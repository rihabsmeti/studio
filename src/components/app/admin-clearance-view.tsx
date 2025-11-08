'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collectionGroup, query, where, doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type ClearanceItem = {
  id: string;
  name: string;
  department: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  userProfileId: string;
};

type UserProfile = {
  fullName: string;
  email: string;
};

type RejectDialogState = {
  isOpen: boolean;
  item: ClearanceItem | null;
  reason: string;
  price: string;
};

const AdminClearanceView = () => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    isOpen: false,
    item: null,
    reason: '',
    price: '',
  });

  const pendingItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // THIS IS THE FIX: A collectionGroup query requires a 'where' filter.
    // We filter for pending items, which is what the admin needs to see.
    return query(
        collectionGroup(firestore, 'clearanceItems'),
        where('status', '==', 'Pending')
    );
  }, [firestore]);

  const { data: clearanceItems, isLoading: isLoadingItems, error: itemsError } = useCollection<ClearanceItem>(pendingItemsQuery);

  const handleApprove = (item: ClearanceItem) => {
    if (!firestore) return;

    const itemRef = doc(firestore, `users/${item.userProfileId}/clearanceItems`, item.id);
    updateDocumentNonBlocking(itemRef, { status: 'Approved' });
    toast({
        title: "Item Approved",
        description: `"${item.name}" has been approved.`,
    });
  };

  const openRejectDialog = (item: ClearanceItem) => {
    setRejectDialog({ isOpen: true, item, reason: '', price: '' });
  };

  const handleConfirmReject = () => {
    const { item, reason, price } = rejectDialog;
    if (!firestore || !item) return;

    const priceValue = parseFloat(price);
    if (!reason || isNaN(priceValue) || priceValue < 0) {
        toast({ title: "Invalid Input", description: "Please provide a valid reason and price.", variant: "destructive" });
        return;
    }

    const itemRef = doc(firestore, `users/${item.userProfileId}/clearanceItems`, item.id);
    updateDocumentNonBlocking(itemRef, {
        status: 'Rejected',
        rejectionReason: reason,
        price: priceValue,
        paymentStatus: 'Outstanding'
    });

    toast({
        title: "Item Rejected",
        description: `"${item.name}" has been rejected.`,
        variant: "destructive"
    });

    setRejectDialog({ isOpen: false, item: null, reason: '', price: '' });
  };

  const renderContent = () => {
    if (isLoadingItems) {
      return (
        <div className="flex h-full items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading pending items...</p>
        </div>
      );
    }
  
    if (itemsError) {
      return (
          <div className="p-8">
              <Card className="border-l-4 border-destructive bg-destructive/10">
                  <CardHeader>
                      <CardTitle className="text-destructive">Error Loading Data</CardTitle>
                      <CardDescription className="text-destructive/80">
                          There was a problem fetching clearance items. This may be due to security rules.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p className="mt-2 font-mono text-sm text-destructive/70">{itemsError.message}</p>
                  </CardContent>
              </Card>
          </div>
      );
    }

    return (
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Decision</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {clearanceItems && clearanceItems.length > 0 ? (
                clearanceItems.map((item) => (
                <AdminItemRow key={item.id} item={item} onApprove={handleApprove} onDeny={openRejectDialog} />
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No pending items to review.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <Card className="animate-fade-in-up">
            <CardHeader>
            <CardTitle className="font-headline text-3xl">Admin Clearance Dashboard</CardTitle>
            <CardDescription>Review and decide on pending clearance items submitted by students.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialog.isOpen} onOpenChange={(isOpen) => setRejectDialog(prev => ({...prev, isOpen}))}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Item: {rejectDialog.item?.name}</DialogTitle>
                <DialogDescription>
                    Provide a reason for the rejection and specify the cost to be paid by the student.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price ($)</Label>
                    <Input id="price" type="number" value={rejectDialog.price} onChange={(e) => setRejectDialog(prev => ({...prev, price: e.target.value}))} className="col-span-3" placeholder="e.g., 25.50" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reason" className="text-right">Reason</Label>
                    <Textarea id="reason" value={rejectDialog.reason} onChange={(e) => setRejectDialog(prev => ({...prev, reason: e.target.value}))} className="col-span-3" placeholder="e.g., Textbook was returned damaged."/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialog(prev => ({...prev, isOpen: false}))}>Cancel</Button>
                <Button variant="destructive" onClick={handleConfirmReject}>Confirm Rejection</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


const AdminItemRow = ({ item, onApprove, onDeny }: { item: ClearanceItem; onApprove: (item: ClearanceItem) => void; onDeny: (item: ClearanceItem) => void; }) => {
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !item.userProfileId) return null;
        return doc(firestore, 'users', item.userProfileId);
    }, [firestore, item.userProfileId]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    if (isLoadingProfile) {
        return (
            <TableRow>
                <TableCell colSpan={5} className="text-center">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" />
                </TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow>
            <TableCell>
                <div className='font-medium'>{userProfile?.fullName || 'N/A'}</div>
                <div className='text-xs text-muted-foreground'>{userProfile?.email || 'N/A'}</div>
            </TableCell>
            <TableCell>{item.department}</TableCell>
            <TableCell>{item.name}</TableCell>
             <TableCell className='italic text-muted-foreground'>{item.notes || "No notes"}</TableCell>
            <TableCell className="text-right space-x-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => onApprove(item)}
                >
                    <CheckCircle className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => onDeny(item)}
                >
                    <XCircle className="h-5 w-5" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

export default AdminClearanceView;
