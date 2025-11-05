'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const FinanceClearanceView = () => {
  return (
    <div className="p-4 md:p-8">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="font-headline text-3xl">Finance Dashboard</CardTitle>
                <CardDescription>Review outstanding student debts for clearance items.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="text-center rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 p-10 md:p-16">
              <h3 className="font-semibold text-foreground">Finance View Under Construction</h3>
              <p className="text-sm text-muted-foreground">This section will display students' outstanding balances for unreturned items.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceClearanceView;
