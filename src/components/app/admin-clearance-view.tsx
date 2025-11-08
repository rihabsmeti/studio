'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

// Define the types for our static data
type ClearanceItem = {
  id: string;
  name: string;
  department: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  studentName: string;
  studentEmail: string;
};

// Create a static array of mock data
const staticClearanceItems: ClearanceItem[] = [
  { id: '1', name: 'Physics Textbook', department: 'Academics', status: 'Pending', notes: 'Forgot to return after finals.', studentName: 'John Doe', studentEmail: 'john.doe@example.com' },
  { id: '2', name: 'Library Book: "The Great Gatsby"', department: 'Library', status: 'Pending', notes: '', studentName: 'Jane Smith', studentEmail: 'jane.smith@example.com' },
  { id: '3', name: 'Basketball', department: 'Sports', status: 'Pending', notes: 'Left it in the gym locker.', studentName: 'Mike Johnson', studentEmail: 'mike.j@example.com' },
];

type RejectDialogState = {
  isOpen: boolean;
  item: ClearanceItem | null;
  reason: string;
  price: string;
};

const AdminClearanceView = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(staticClearanceItems);

  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    isOpen: false,
    item: null,
    reason: '',
    price: '',
  });

  const handleApprove = (item: ClearanceItem) => {
    // Simulate the action with a toast
    toast({
        title: "Item Approved (Simulated)",
        description: `"${item.name}" has been approved for ${item.studentName}.`,
    });
    // Optional: Update local state to reflect the change visually
    setItems(prevItems => prevItems.filter(i => i.id !== item.id));
  };

  const openRejectDialog = (item: ClearanceItem) => {
    setRejectDialog({ isOpen: true, item, reason: '', price: '' });
  };

  const handleConfirmReject = () => {
    const { item, reason, price } = rejectDialog;
    if (!item) return;

    if (!reason || !price) {
        toast({ title: "Invalid Input", description: "Please provide a valid reason and price.", variant: "destructive" });
        return;
    }
    
    // Simulate the action with a toast
    toast({
        title: "Item Rejected (Simulated)",
        description: `"${item.name}" has been rejected for ${item.studentName}.`,
        variant: "destructive"
    });
    
    // Optional: Update local state
    setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    setRejectDialog({ isOpen: false, item: null, reason: '', price: '' });
  };

  return (
    <>
      <div className="p-4 md:p-8">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Decision</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {items && items.length > 0 ? (
                items.map((item) => (
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
      </div>

      <Dialog open={rejectDialog.isOpen} onOpenChange={(isOpen) => setRejectDialog(prev => ({...prev, isOpen}))}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reject Item: {rejectDialog.item?.name}</DialogTitle>
                <DialogDescription>
                    Provide a reason for the rejection and specify the cost to be paid by the user.
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
    return (
        <TableRow>
            <TableCell>
                <div className='font-medium'>{item.studentName}</div>
                <div className='text-xs text-muted-foreground'>{item.studentEmail}</div>
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
