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

type ClearanceItem = {
  id: string; // Firestore document ID
  name: string;
  status: 'Pending Submission' | 'Cleared' | 'Rejected';
  notes: string;
  userProfileId: string;
};

const ClearanceForm = () => {
  const [itemName, setItemName] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Fetch user profile to get details for AI generation
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userProfileRef);

  // Fetch clearance items for the current user
  const clearanceItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/clearanceItems`);
  }, [firestore, user]);

  const { data: clearanceItems = [], isLoading: isLoadingItems } = useCollection<ClearanceItem>(clearanceItemsQuery);

  const handleGenerateForm = () => {
    if (!userProfile) {
        toast({ title: "Profile not loaded", description: "Please wait for your profile to load before generating a form.", variant: "destructive"});
        return;
    }

    const studentData: GenerateClearanceFormInput = {
        studentName: userProfile.fullName,
        studentId: userProfile.studentId,
        hallOfResidence: userProfile.hallOfResidence,
    };

    startTransition(async () => {
        try {
            toast({ title: "🤖 AI is generating your form...", description: "Please wait a moment." });
            const result = await generateClearanceForm(studentData);
            
            const parseMarkdownTable = (markdown: string): Omit<ClearanceItem, 'id' | 'status' | 'notes' | 'userProfileId'>[] => {
                if (!markdown) return [];
                const lines = markdown.trim().split('\n');
                const items: Omit<ClearanceItem, 'id' | 'status' | 'notes' | 'userProfileId'>[] = [];
                for (let i = 2; i < lines.length; i++) {
                    const columns = lines[i].split('|').map(c => c.trim());
                    const name = columns[1];
                    if (name) items.push({ name });
                }
                return items;
            };

            const parsedItems = parseMarkdownTable(result.clearanceForm);
            
            if (clearanceItemsQuery) {
                for (const item of parsedItems) {
                    const newItem: Omit<ClearanceItem, 'id'> = {
                        ...item,
                        status: 'Pending Submission',
                        notes: '',
                        userProfileId: user!.uid,
                    };
                    addDocumentNonBlocking(clearanceItemsQuery, newItem);
                }
            }

            toast({ title: "✅ Success", description: "AI has populated your clearance form.", variant: "default" });

        } catch (error) {
            console.error("AI generation failed:", error);
            toast({ title: "❌ Error", description: "Failed to generate form with AI.", variant: "destructive" });
        }
    });
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast({ title: 'Error', description: 'Please enter an item name.', variant: 'destructive' });
      return;
    }
    if (!clearanceItemsQuery || !user) {
      toast({ title: 'Error', description: 'Cannot add item. User or database not ready.', variant: 'destructive' });
      return;
    }

    const newItem: Omit<ClearanceItem, 'id'> = {
      name: itemName.trim(),
      status: 'Pending Submission',
      notes: '',
      userProfileId: user.uid,
    };
    addDocumentNonBlocking(clearanceItemsQuery, newItem);
    setItemName('');
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
    // This is a "last-write-wins" approach. For more complex scenarios, you might debounce this.
    updateDocumentNonBlocking(itemRef, { notes });
  };

  const handleSubmit = () => {
    if (clearanceItems.length === 0) {
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
          <CardDescription>If you have an item to return that is not on your list, add it here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Advanced Physics Textbook"
              disabled={isUserLoading || isLoadingItems}
            />
          </div>
          <Button onClick={handleAddItem} className="w-full md:w-auto" disabled={isUserLoading || isLoadingItems}>
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
            <Button onClick={handleGenerateForm} disabled={isPending || !userProfile}>
              <Bot className="mr-2 h-4 w-4" />
              {isPending ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
             <div className="text-center rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 p-10 md:p-16">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary/50" />
                <h3 className="font-semibold text-foreground">Loading Your Items...</h3>
             </div>
          ) : clearanceItems.length === 0 ? (
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
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground italic">Status: {item.status}</p>
                    <Textarea
                      rows={2}
                      placeholder="Notes for staff..."
                      defaultValue={item.notes} // Use defaultValue to avoid controlled/uncontrolled issues with debouncing
                      onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                      className="mt-2"
                      disabled={item.status !== 'Pending Submission'}
                    />
                  </div>
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive self-end md:self-center"
                     disabled={item.status !== 'Pending Submission'}
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
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handleSubmit}
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
