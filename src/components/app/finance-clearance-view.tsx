'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Define the type for our static data
type FinanceItem = {
  id: string;
  name: string;
  rejectionReason: string;
  price: number;
  paymentStatus: 'Outstanding' | 'Paid';
  studentName: string;
  studentEmail: string;
};

// Create a static array of mock data
const staticFinanceItems: FinanceItem[] = [
  { id: '1', studentName: 'Alice Wonderland', studentEmail: 'alice.w@example.com', name: 'Damaged Chemistry Beaker', rejectionReason: 'Cracked during experiment', price: 25.50, paymentStatus: 'Outstanding' },
  { id: '2', studentName: 'Bob Builder', studentEmail: 'bob.b@example.com', name: 'Unreturned Library Book', rejectionReason: 'Lost "The Art of Code"', price: 45.00, paymentStatus: 'Outstanding' },
  { id: '3', studentName: 'Charlie Brown', studentEmail: 'charlie.b@example.com', name: 'Lost Dorm Key', rejectionReason: 'Key replacement fee', price: 75.00, paymentStatus: 'Outstanding' },
];


const FinanceClearanceView = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(staticFinanceItems);

  const handleMarkAsPaid = (item: FinanceItem) => {
    // Simulate the action with a toast
    toast({
        title: "Payment Recorded (Simulated)",
        description: `Payment for ${item.name} from ${item.studentName} has been recorded.`
    });
    
    // Optional: Update local state to reflect the change visually
    setItems(prevItems => prevItems.map(i => i.id === item.id ? {...i, paymentStatus: 'Paid'} : i));
  };


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
              {items && items.length > 0 ? (
                items.map((item) => (
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

const FinanceItemRow = ({ item, onMarkAsPaid }: { item: FinanceItem; onMarkAsPaid: (item: FinanceItem) => void }) => {
    
    return (
        <TableRow>
            <TableCell>
                <div className='font-medium'>{item.studentName}</div>
                <div className='text-xs text-muted-foreground'>{item.studentEmail}</div>
            </TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell className='italic text-muted-foreground'>{item.rejectionReason}</TableCell>
            <TableCell className="font-medium">
                ${item.price.toFixed(2)}
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
