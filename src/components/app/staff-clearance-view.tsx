'use client';

import React from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collectionGroup, query, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase';

type ClearanceItem = {
  id: string;
  name: string;
  status: 'Pending Submission' | 'Cleared' | 'Rejected';
  notes: string;
  userProfileId: string;
};

type UserProfile = {
  fullName: string;
  email: string;
};


const StaffClearanceView = () => {
  const firestore = useFirestore();
  const { toast } = useToast();

  const clearanceItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'clearanceItems'));
  }, [firestore]);

  const { data: clearanceItems, isLoading: isLoadingItems, error: itemsError } = useCollection<ClearanceItem>(clearanceItemsQuery);

  const handleUpdateStatus = (item: ClearanceItem, status: 'Cleared' | 'Rejected') => {
    if (!firestore) return;

    const itemRef = doc(firestore, `users/${item.userProfileId}/clearanceItems`, item.id);
    updateDocumentNonBlocking(itemRef, { status });

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
                        Please check the console for more details and ensure your security rules are set up correctly.
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
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Staff Clearance Dashboard</CardTitle>
          <CardDescription>Review and manage all student clearance submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student Email</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
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

// A helper component to fetch user profile for each row
const ClearanceItemRow = ({ item, onUpdateStatus }: { item: ClearanceItem; onUpdateStatus: (item: ClearanceItem, status: 'Cleared' | 'Rejected') => void }) => {
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
            <TableCell>{userProfile?.fullName || 'N/A'}</TableCell>
            <TableCell>{userProfile?.email || 'N/A'}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge
                variant={
                  item.status === 'Cleared' ? 'default' :
                  item.status === 'Rejected' ? 'destructive' : 'secondary'
                }
                className={item.status === 'Cleared' ? 'bg-green-600' : ''}
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className='italic text-muted-foreground'>{item.notes || "No notes"}</TableCell>
            <TableCell className="text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600 hover:text-green-700"
                    onClick={() => onUpdateStatus(item, 'Cleared')}
                    disabled={item.status === 'Cleared'}
                >
                    <CheckCircle className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => onUpdateStatus(item, 'Rejected')}
                     disabled={item.status === 'Rejected'}
                >
                    <XCircle className="h-5 w-5" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

export default StaffClearanceView;
