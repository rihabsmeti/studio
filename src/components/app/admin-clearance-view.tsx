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
      studentName: 'John Doe',
      email: 'john.doe@example.com',
      item: 'Advanced Physics Textbook',
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      email: 'jane.smith@example.com',
      item: 'Library Book: "The Great Gatsby"',
    },
    {
      id: '3',
      studentName: 'Sam Wilson',
      email: 'sam.wilson@example.com',
      item: 'Basketball',
    },
    {
        id: '4',
        studentName: 'Emily White',
        email: 'emily.white@example.com',
        item: 'Dormitory Keys',
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
          As an Admin, your role is to review items submitted by students. Approve items that have been successfully returned or cleared, and reject items that are missing or damaged.
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
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staticClearanceItems.map((request) => (
                <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.studentName}</TableCell>
                    <TableCell>{request.email}</TableCell>
                    <TableCell>{request.item}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(request.studentName, request.item)}
                        >
                            <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => handleDeny(request.studentName, request.item)}
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
