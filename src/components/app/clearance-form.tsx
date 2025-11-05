"use client";

import React, { useState, useTransition } from 'react';
import { CheckSquare, Download, ListChecks, Send, Trash2, Bot } from 'lucide-react';
import { generateClearanceForm, GenerateClearanceFormInput } from '@/ai/flows/generate-clearance-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ClearanceItem = {
  id: number;
  name: string;
  status: 'Pending Submission' | 'Cleared' | 'Rejected';
  notes: string;
};

// Mock user data for AI generation
const mockStudentData: GenerateClearanceFormInput = {
    studentName: 'Ahmed Farouk',
    studentId: 'zTDGEi7gfeYtWR8k06f5QQetjICWKZ2',
    hallOfResidence: 'Nelson Mandela Hall',
};

const parseMarkdownTable = (markdown: string): Omit<ClearanceItem, 'id' | 'status' | 'notes'>[] => {
    if (!markdown) return [];
    const lines = markdown.trim().split('\n');
    const items: Omit<ClearanceItem, 'id' | 'status' | 'notes'>[] = [];

    // Start from line 2 to skip header and separator
    for (let i = 2; i < lines.length; i++) {
        const columns = lines[i].split('|').map(c => c.trim());
        const name = columns[1]; // Assumes first column is the item
        if (name) {
            items.push({ name });
        }
    }
    return items;
};

const ClearanceForm = () => {
  const [itemName, setItemName] = useState('');
  const [clearanceItems, setClearanceItems] = useState<ClearanceItem[]>([]);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleGenerateForm = () => {
    startTransition(async () => {
        try {
            toast({ title: "🤖 AI is generating your form...", description: "Please wait a moment." });
            const result = await generateClearanceForm(mockStudentData);
            const parsedItems = parseMarkdownTable(result.clearanceForm);
            
            const newItems: ClearanceItem[] = parsedItems.map((item, index) => ({
                ...item,
                id: Date.now() + index,
                status: 'Pending Submission',
                notes: '',
            }));

            setClearanceItems(prevItems => [...prevItems, ...newItems]);
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
    const newItem: ClearanceItem = {
      id: Date.now(),
      name: itemName.trim(),
      status: 'Pending Submission',
      notes: '',
    };
    setClearanceItems([...clearanceItems, newItem]);
    setItemName('');
    toast({ title: 'Item added successfully!' });
  };

  const handleRemoveItem = (id: number) => {
    setClearanceItems(clearanceItems.filter(item => item.id !== id));
    toast({ title: 'Item removed.' });
  };

  const handleUpdateNotes = (id: number, notes: string) => {
    setClearanceItems(clearanceItems.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
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
            />
          </div>
          <Button onClick={handleAddItem} className="w-full md:w-auto">
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
            <Button onClick={handleGenerateForm} disabled={isPending}>
              <Bot className="mr-2 h-4 w-4" />
              {isPending ? 'Generating...' : 'Generate with AI'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {clearanceItems.length === 0 ? (
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
                      value={item.notes}
                      onChange={(e) => handleUpdateNotes(item.id, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive self-end md:self-center"
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
