"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { CheckSquare, Download, ListChecks, Send, Trash2, Bot, Loader2 } from 'lucide-react';
import { generateClearanceForm, GenerateClearanceFormInput } from '@/ai/flows/generate-clearance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ClearanceItem = {
  id: string;
  name: string;
  department: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
  userProfileId: string;
  rejectionReason?: string;
  price?: number;
  paymentStatus?: 'Outstanding' | 'Paid';
};

const departments = ["Academics", "Library", "Sports", "Dormitory", "IT", "Finance"];

const ClearanceForm = () => {
  const [itemName, setItemName] = useState('');
  const [department, setDepartment] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userProfileRef);

  const clearanceItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/clearanceItems`);
  }, [firestore, user]);

  const { data: clearanceItems, isLoading: isLoadingItems } = useCollection<ClearanceItem>(clearanceItemsQuery);

  const handleGenerateForm = () => {
    // This is a placeholder for now. We can re-implement this if needed.
    toast({ title: "AI Generation is temporarily disabled.", description: "Please add items manually.", variant: "default" });
  };

  const handleAddItem = () => {
    if (!itemName.trim() || !department) {
      toast({ title: 'Error', description: 'Please enter an item name and select a department.', variant: 'destructive' });
      return;
    }
    if (!clearanceItemsQuery || !user) {
      toast({ title: 'Error', description: 'Cannot add item. User or database not ready.', variant: 'destructive' });
      return;
    }

    const newItem: Omit<ClearanceItem, 'id'> = {
      name: itemName.trim(),
      department: department,
      status: 'Pending',
      notes: '',
      userProfileId: user.uid,
    };
    addDocumentNonBlocking(clearanceItemsQuery, newItem);
    setItemName('');
    setDepartment('');
    toast({ title: 'Item added successfully!' });
  };

  const handleRemoveItem = (id: string) => {
    if (!firestore || !user) return;
    const itemRef = doc(firestore, `users/${user.uid}/clearanceItems`, id);
    deleteDocumentNonBlocking(itemRef);
    toast({ title: 'Item removed.' });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    if (!firestore || !user) return;
    const itemRef = doc(firestore, `users/${user.uid}/clearanceItems`, id);
    updateDocumentNonBlocking(itemRef, { notes });
  };

  const handleSubmit = () => {
    if (!clearanceItems || clearanceItems.length === 0) {
      toast({ title: 'Form is empty. Add items first.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Form submitted for final review!', description: 'You will be notified of any updates.' });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Add a Clearance Item</CardTitle>
          <CardDescription>If you have an item to return that is not on your list, add it here. Select the correct department for approval.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 items-end">
          <Input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Advanced Physics Textbook"
            disabled={isUserLoading || isLoadingItems}
          />
          <Select onValueChange={setDepartment} value={department} disabled={isUserLoading || isLoadingItems}>
            <SelectTrigger>
              <SelectValue placeholder="Select a Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={handleAddItem} className="w-full" disabled={isUserLoading || isLoadingItems}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-xl">My Clearance Form</CardTitle>
              <CardDescription>Update the status of your items below. Add notes for the staff to review.</CardDescription>
            </div>
            {/* AI Button can be re-enabled later */}
            {/* <Button onClick={handleGenerateForm} disabled={isPending || !userProfile}>
              <Bot className="mr-2 h-4 w-4" />
              {isPending ? 'Generating...' : 'Generate with AI'}
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
             <div className="text-center rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 p-10 md:p-16">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary/50" />
                <h3 className="font-semibold text-foreground">Loading Your Items...</h3>
             </div>
          ) : !clearanceItems || clearanceItems.length === 0 ? (
            <div className="text-center rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 p-10 md:p-16">
              <ListChecks className="mx-auto mb-4 h-12 w-12 text-primary/50" />
              <h3 className="font-semibold text-foreground">No Clearance Items Found</h3>
              <p className="text-sm text-muted-foreground">Your clearance form is empty. Use the forms above to add items.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clearanceItems.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row justify-between md:items-start gap-4 rounded-lg border bg-accent/20 p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name} <span className="text-sm font-normal text-muted-foreground">({item.department})</span></p>
                    <p className="text-sm text-muted-foreground italic">Status: {item.status}</p>
                     {item.status === 'Rejected' && (
                        <div className="mt-2 text-sm text-destructive border-l-2 border-destructive pl-2">
                           <p><span className="font-semibold">Reason:</span> {item.rejectionReason || 'No reason provided.'}</p>
                           <p><span className="font-semibold">Amount Due:</span> ${item.price?.toFixed(2) || '0.00'}</p>
                           <p><span className="font-semibold">Payment:</span> {item.paymentStatus}</p>
                        </div>
                    )}
                    <Textarea
                      rows={2}
                      placeholder="Notes for staff..."
                      defaultValue={item.notes}
                      onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                      className="mt-2"
                      disabled={item.status !== 'Pending'}
                    />
                  </div>
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive self-end md:self-center"
                     disabled={item.status !== 'Pending'}
                     suppressHydrationWarning
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Item</span>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-end gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => toast({ title: 'PDF generation initiated.' })}
               suppressHydrationWarning
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleSubmit}
               suppressHydrationWarning
            >
              <Send className="mr-2 h-4 w-4" />
              Submit for Final Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClearanceForm;
