'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collectionGroup, query, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

type ClearanceItem = {
  id: string;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  userProfileId: string;
  department: string;
  price?: number;
  rejectionReason?: string;
  paymentStatus?: 'Outstanding' | 'Paid';
};

type UserProfile = {
  fullName: string;
  email: string;
};


const AdminClearanceView = () => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const clearanceItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'clearanceItems'));
  }, [firestore]);

  const { data: clearanceItems, isLoading: isLoadingItems, error: itemsError } = useCollection<ClearanceItem>(clearanceItemsQuery);

  const handleUpdateStatus = (item: ClearanceItem, status: 'Approved' | 'Rejected', rejectionDetails?: { reason: string, price: number }) => {
    if (!firestore) return;

    const itemRef = doc(firestore, `users/${item.userProfileId}/clearanceItems`, item.id);
    
    let updatedData: Partial<ClearanceItem> = { status };
    if (status === 'Rejected' && rejectionDetails) {
        updatedData = {
            ...updatedData,
            rejectionReason: rejectionDetails.reason,
            price: rejectionDetails.price,
            paymentStatus: 'Outstanding'
        }
    }
    
    updateDocumentNonBlocking(itemRef, updatedData);

    toast({
        title: "Status Updated",
        description: `${item.name} has been marked as ${status}.`
    })
  };

  if (isLoadingItems) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading clearance items...</p>
      </div>
    );
  }

  if (itemsError) {
    return (
        <div className="p-4 md:p-8">
            <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="text-destructive">Error Loading Data</CardTitle>
                    <CardDescription className="text-destructive/80">
                        There was a problem fetching the clearance items from the database.
                        This is likely due to Firestore Security Rules.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-mono text-sm text-destructive/70">{itemsError.message}</p>
                </CardContent>
            </Card>
        </div>
    );
  }


  return (
    <div className="p-4 md:p-8">
       <Alert className='mb-8'>
        <Info className="h-4 w-4" />
        <AlertTitle>Admin Dashboard</AlertTitle>
        <AlertDescription>
          As an Admin (Teacher), your role is to review items submitted by students. Approve items that have been successfully returned or cleared, and reject items that are missing or damaged. When rejecting, you must provide a reason and assign a replacement cost.
        </AlertDescription>
      </Alert>
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Admin Clearance Dashboard</CardTitle>
          <CardDescription>Review and manage all student clearance submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearanceItems && clearanceItems.length > 0 ? (
                clearanceItems.map((item) => (
                  <ClearanceItemRow key={item.id} item={item} onUpdateStatus={handleUpdateStatus} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No clearance items submitted yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ClearanceItemRow = ({ item, onUpdateStatus }: { item: ClearanceItem; onUpdateStatus: (item: ClearanceItem, status: 'Approved' | 'Rejected', rejectionDetails?: { reason: string, price: number }) => void }) => {
    const firestore = useFirestore();
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !item.userProfileId) return null;
        return doc(firestore, 'users', item.userProfileId);
    }, [firestore, item.userProfileId]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    const handleRejectSubmit = () => {
        const price = parseFloat(itemPrice);
        if (!rejectionReason || isNaN(price) || price <= 0) {
            alert('Please provide a valid reason and a positive price.');
            return;
        }
        onUpdateStatus(item, 'Rejected', { reason: rejectionReason, price });
        setIsRejecting(false);
        setRejectionReason('');
        setItemPrice('');
    }

    if (isLoadingProfile) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="text-center">
                    <Loader2 className="mx-auto h-4 w-4 animate-spin text-primary" />
                </TableCell>
            </TableRow>
        )
    }

    const isActionable = item.status === 'Pending';

    return (
        <TableRow>
            <TableCell>
                <div className='font-medium'>{userProfile?.fullName || 'N/A'}</div>
                <div className='text-xs text-muted-foreground'>{userProfile?.email || 'N/A'}</div>
            </TableCell>
            <TableCell className="font-medium">{item.department}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell className='italic text-muted-foreground'>{item.notes || "No notes"}</TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === 'Approved' ? 'default' :
                  item.status === 'Rejected' ? 'destructive' : 'secondary'
                }
                className={item.status === 'Approved' ? 'bg-green-600' : ''}
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
                <AlertDialog open={isRejecting} onOpenChange={setIsRejecting}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => onUpdateStatus(item, 'Approved')}
                        disabled={!isActionable}
                    >
                        <CheckCircle className="h-5 w-5" />
                    </Button>
                    <AlertDialogTrigger asChild>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            disabled={!isActionable}
                        >
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Reject Item: {item.name}</AlertDialogTitle>
                        <AlertDialogDescription>
                            To reject this item, please provide a reason for the rejection (e.g., "Item damaged" or "Not returned") and specify the replacement cost. This information will be sent to the finance department.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <Textarea 
                                placeholder="Reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Replacement cost (e.g., 25.50)"
                                value={itemPrice}
                                onChange={(e) => setItemPrice(e.target.value)}
                            />
                        </div>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRejectSubmit}>Submit Rejection</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    )
}

export default AdminClearanceView;
