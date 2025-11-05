import type { Metadata } from 'next';
import Sidebar from '@/components/app/sidebar';
import Header from '@/components/app/header';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ExitPass Dashboard',
  description: 'African Leadership Academy ExitPass Application',
};

export default function DashboardLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: { role?: string };
}) {
  const role = searchParams?.role || 'Student';

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="md:hidden flex h-16 shrink-0 items-center justify-between border-b px-4 bg-card">
            <h1 className="font-headline text-2xl text-card-foreground">ExitPass</h1>
            <Drawer direction="left">
                <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="h-full w-64 p-0">
                    <Sidebar role={role} />
                </DrawerContent>
            </Drawer>
        </div>
        <div className='hidden md:block'>
            <Header />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
