"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ListChecks, User as UserIcon, Shield, LogOut } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

const studentMenuItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'My Clearance', icon: ListChecks, href: '/dashboard/clearance' },
  { name: 'My Profile', icon: UserIcon, href: '/dashboard/profile' },
];

const staffMenuItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Staff Dashboard', icon: Shield, href: '/dashboard/staff' },
    { name: 'My Profile', icon: UserIcon, href: '/dashboard/profile' },
];

const getMenuItems = (role: string) => {
    switch (role) {
        case 'Admin':
        case 'Finance':
        case 'Security':
            return staffMenuItems;
        default:
            return studentMenuItems;
    }
}


type SidebarProps = {
  role: string;
};

const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const logoHorizontal = PlaceHolderImages.find(img => img.id === 'ala-logo-horizontal');
  const logoRound = PlaceHolderImages.find(img => img.id === 'ala-logo-round');

  const userEmail = user?.email || "loading...";
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const menuItems = getMenuItems(role);

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        toast({ title: 'Logged Out', description: 'You have been successfully signed out.' });
        router.push('/');
    } catch (error) {
        console.error("Logout failed:", error);
        toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive'});
    }
  }


  return (
    <div className="hidden h-screen w-64 shrink-0 flex-col justify-between border-r bg-card p-4 md:flex">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col items-center border-b py-4">
          {logoHorizontal && (
            <Image
              src={logoHorizontal.imageUrl}
              alt={logoHorizontal.description}
              width={160}
              height={32}
              className="mb-2"
              data-ai-hint={logoHorizontal.imageHint}
            />
          )}
          <p className="font-headline text-lg font-bold text-primary">
            ExitPass
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link href={`${item.href}?role=${role}`} key={item.name}>
                <div
                  className={cn(
                    'relative flex w-full items-center space-x-3 rounded-xl p-3 text-left transition-all duration-200',
                    isActive
                      ? 'bg-accent font-semibold text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  {isActive && <span className="absolute left-0 h-full w-1 rounded-r-full bg-primary" />}
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
         <div className="flex items-center space-x-3 rounded-xl bg-secondary p-4 shadow-lg">
            <Avatar>
               {logoRound && <AvatarImage src={logoRound.imageUrl} alt="User Avatar" data-ai-hint={logoRound.imageHint} />}
               <AvatarFallback>{isUserLoading ? '...' : userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-secondary-foreground">{isUserLoading ? 'Loading...' : userEmail}</p>
              <p className="text-xs capitalize text-secondary-foreground/70">{role}</p>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
