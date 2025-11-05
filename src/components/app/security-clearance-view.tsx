'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collectionGroup, query, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Info } from 'lucide-react';
import { useDoc } from '@/firebase';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type ClearanceItem = {
  id: string;
  name: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  userProfileId: string;
  department: string;
  paymentStatus?: 'Outstanding' | 'Paid';
};

type UserProfile = {
  fullName: string;
  email: string;
};

const SecurityClearanceView = () => {
  const firestore = useFirestore();

  const clearanceItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'clearanceItems'));
  }, [firestore]);

  const { data: clearanceItems, isLoading: isLoadingItems, error: itemsError } = useCollection<ClearanceItem>(clearanceItemsQuery);

  if (isLoadingItems) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading all clearance records...</p>
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
            <AlertTitle>Security Dashboard</AlertTitle>
            <AlertDescription>
            This dashboard provides a read-only overview of all student clearance items in the system. You can monitor the status of items to ensure students are cleared for exit.
            </AlertDescription>
        </Alert>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Security Clearance Overview</CardTitle>
          <CardDescription>A real-time, read-only view of all student clearance items.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Finance Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clearanceItems && clearanceItems.length > 0 ? (
                clearanceItems.map((item) => (
                  <SecurityItemRow key={item.id} item={item} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No clearance items in the system.
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

const SecurityItemRow = ({ item }: { item: ClearanceItem }) => {
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
            <TableCell>{item.department}</TableCell>
            <TableCell>{item.name}</TableCell>
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
            <TableCell>
                {item.paymentStatus ? (
                    <Badge variant={item.paymentStatus === 'Paid' ? 'default' : 'destructive'} className={item.paymentStatus === 'Paid' ? 'bg-green-600': ''}>
                        {item.paymentStatus}
                    </Badge>
                ) : (
                    <Badge variant="secondary">N/A</Badge>
                )}
            </TableCell>
            <TableCell className='italic text-muted-foreground'>{item.notes || "No notes"}</TableCell>
        </TableRow>
    )
}

export default SecurityClearanceView;
