'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

// Define a simple type for our static data, representing the final clearance status for a student.
type SecurityRecord = {
  id: string;
  studentName: string;
  studentEmail: string;
  isApprovedToLeave: boolean; // A simple boolean to determine if they can exit.
};

// Create a static array of mock data for the security view.
const staticSecurityData: SecurityRecord[] = [
  { id: '1', studentName: 'John Doe', studentEmail: 'john.doe@example.com', isApprovedToLeave: true },
  { id: '2', studentName: 'Jane Smith', studentEmail: 'jane.smith@example.com', isApprovedToLeave: false },
  { id: '3', studentName: 'Mike Johnson', studentEmail: 'mike.j@example.com', isApprovedToLeave: true },
  { id: '4', studentName: 'Alice Wonderland', studentEmail: 'alice.w@example.com', isApprovedToLeave: false },
  { id: '5', studentName: 'Charlie Brown', studentEmail: 'charlie.b@example.com', isApprovedToLeave: true },
];

const SecurityClearanceView = () => {
  return (
    <div className="p-4 md:p-8">
        <Alert className='mb-8 border-primary/20 bg-primary/5 text-primary'>
            <Info className="h-4 w-4 !text-primary" />
            <AlertTitle className='text-primary'>Security Gate Overview</AlertTitle>
            <AlertDescription>
              This dashboard provides a simple, read-only view to verify if a student is fully cleared to exit campus.
            </AlertDescription>
        </Alert>

      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Student Exit Clearance Status</CardTitle>
          <CardDescription>A summary of students and their final approval status for leaving campus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Overall Clearance Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staticSecurityData.length > 0 ? (
                staticSecurityData.map((record) => (
                  <SecurityItemRow key={record.id} record={record} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No student records in the system.
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

const SecurityItemRow = ({ record }: { record: SecurityRecord }) => {
    return (
        <TableRow>
            <TableCell>
                <div className='font-medium'>{record.studentName}</div>
                <div className='text-xs text-muted-foreground'>{record.studentEmail}</div>
            </TableCell>
            <TableCell className="text-right">
              <Badge
                variant={record.isApprovedToLeave ? 'default' : 'destructive'}
                className={record.isApprovedToLeave ? 'bg-green-600' : ''}
              >
                {record.isApprovedToLeave ? (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                ) : (
                    <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                {record.isApprovedToLeave ? 'Approved to Leave' : 'Not Cleared'}
              </Badge>
            </TableCell>
        </TableRow>
    )
}

export default SecurityClearanceView;
