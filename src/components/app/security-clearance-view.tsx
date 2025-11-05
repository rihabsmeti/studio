'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

const SecurityClearanceView = () => {
  return (
    <div className="p-4 md:p-8">
      <Card className="animate-fade-in-up">
        <CardHeader>
            <div className="flex items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="font-headline text-3xl">Security Dashboard</CardTitle>
                    <CardDescription>View student clearance history and payment status.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-center rounded-xl border-2 border-dashed border-primary/20 bg-accent/30 p-10 md:p-16">
              <h3 className="font-semibold text-foreground">Security View Under Construction</h3>
              <p className="text-sm text-muted-foreground">This section will display student item history, approval status, and payment confirmation.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityClearanceView;
