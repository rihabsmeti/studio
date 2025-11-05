'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collectionGroup, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, Info } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

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

const FinanceClearanceView = () => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const financeItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collectionGroup(firestore, 'clearanceItems'), 
        where('status', '==', 'Rejected'),
        where('paymentStatus', '==', 'Outstanding')
    );
  }, [firestore]);

  const { data: clearanceItems, isLoading: isLoadingItems, error: itemsError } = useCollection<ClearanceItem>(financeItemsQuery);

  const handleMarkAsPaid = (item: ClearanceItem) => {
    if (!firestore) return;

    const itemRef = doc(firestore, `users/${item.userProfileId}/clearanceItems`, item.id);
    updateDocumentNonBlocking(itemRef, { paymentStatus: 'Paid' });

    toast({
        title: "Payment Recorded",
        description: `Payment for ${item.name} from ${item.userProfileId} has been recorded.`
    });
  };

  if (isLoadingItems) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading financial records...</p>
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
            <AlertTitle>Finance Dashboard</AlertTitle>
            <AlertDescription>
            This dashboard displays all rejected clearance items that have an outstanding balance. Once a student has paid their debt, mark the item as 'Paid' to clear it from this list.
            </AlertDescription>
        </Alert>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Finance Clearance Dashboard</CardTitle>
          <CardDescription>Manage outstanding payments for rejected items.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Reason for Rejection</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearanceItems && clearanceItems.length > 0 ? (
                clearanceItems.map((item) => (
                  <FinanceItemRow key={item.id} item={item} onMarkAsPaid={handleMarkAsPaid} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No outstanding payments found.
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

const FinanceItemRow = ({ item, onMarkAsPaid }: { item: ClearanceItem; onMarkAsPaid: (item: ClearanceItem) => void }) => {
    const firestore = useFirestore();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !item.userProfileId) return null;
        return doc(firestore, 'users', item.userProfileId);
    }, [firestore, item.userProfileId]);

    const { data: userProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(userProfileRef);

    if (isLoadingProfile) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="text-center">
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
            <TableCell>{item.name}</TableCell>
            <TableCell className='italic text-muted-foreground'>{item.rejectionReason || "No reason provided"}</TableCell>
            <TableCell className="font-medium">
                ${item.price?.toFixed(2) || '0.00'}
            </TableCell>
            <TableCell>
              <Badge variant={item.paymentStatus === 'Paid' ? 'default' : 'destructive'} className={item.paymentStatus === 'Paid' ? 'bg-green-600': ''}>
                {item.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsPaid(item)}
                    disabled={item.paymentStatus === 'Paid'}
                >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark as Paid
                </Button>
            </TableCell>
        </TableRow>
    )
}

export default FinanceClearanceView;
