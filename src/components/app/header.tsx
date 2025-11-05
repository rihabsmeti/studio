"use client";

import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useMemo } from 'react';

const Header = () => {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname.includes('/clearance')) return 'Clearance';
    if (pathname.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  }, [pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-8 bg-card">
      <h1 className="font-headline text-3xl text-card-foreground">{title}</h1>
      <Settings className="h-6 w-6 cursor-pointer text-muted-foreground transition-colors hover:text-foreground" />
    </header>
  );
};

export default Header;
