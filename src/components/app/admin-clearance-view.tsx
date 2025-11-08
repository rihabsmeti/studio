'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

const staticClearanceItems = [
    {
      id: '1',
      item: 'Advanced Physics Textbook',
      student: 'John Doe',
    },
    {
      id: '2',
      item: 'Library Book: "The Great Gatsby"',
      student: 'Jane Smith',
    },
    {
      id: '3',
      item: 'Basketball',
      student: 'Sam Wilson',
    },
    {
        id: '4',
        item: 'Dormitory Keys',
        student: 'Emily White',
    }
];


const AdminClearanceView = () => {
    const { toast } = useToast();

    const handleApprove = (student: string, item: string) => {
        toast({
            title: "Item Approved",
            description: `You approved "${item}" for ${student}.`
        });
    }

    const handleDeny = (student: string, item: string) => {
        toast({
            title: "Item Denied",
            description: `You denied "${item}" for ${student}.`,
            variant: "destructive"
        });
    }

  return (
    <div className="p-4 md:p-8">
       <Alert className='mb-8'>
        <Info className="h-4 w-4" />
        <AlertTitle>Admin Dashboard</AlertTitle>
        <AlertDescription>
          As an Admin (Teacher), your role is to review items submitted by students. Approve items that have been successfully returned or cleared, and reject items that are missing or damaged.
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
                <TableHead>Item</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staticClearanceItems.map((item) => (
                <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>{item.student}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(item.student, item.item)}
                        >
                            <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => handleDeny(item.student, item.item)}
                        >
                            <XCircle className="h-5 w-5" />
                        </Button>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClearanceView;
