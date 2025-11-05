"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, User, Shield, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const roles = [
  { name: 'Student', icon: User },
  { name: 'Staffulty', icon: Briefcase },
  { name: 'Security', icon: Shield },
  { name: 'Admin', icon: LogIn },
];

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const bgImage = PlaceHolderImages.find(img => img.id === 'ala-campus-bg');
  const logoHorizontal = PlaceHolderImages.find(img => img.id === 'ala-logo-horizontal');

  const handleRoleSelect = (role: string) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setSelectedRole(role);
    toast({
      title: 'Logging In...',
      description: `You will be redirected as ${role}.`,
    });

    setTimeout(() => {
      router.push(`/dashboard?role=${role}`);
    }, 1500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-body">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          objectFit="cover"
          className="absolute inset-0 z-[-10] animate-ken-burns"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 z-[-5] bg-black/50" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-4">
        {logoHorizontal && (
          <div className="absolute top-[60px] animate-fade-slide-down">
            <Image
              src={logoHorizontal.imageUrl}
              alt={logoHorizontal.description}
              width={280}
              height={56}
              className="w-full max-w-[280px] md:max-w-[400px]"
              data-ai-hint={logoHorizontal.imageHint}
            />
          </div>
        )}

        <Card className="w-full max-w-md animate-fade-in-slide-up rounded-2xl bg-black/30 text-white backdrop-blur-lg border-white/20 shadow-2xl">
           <CardHeader className="items-center text-center">
            <CardTitle className="font-headline text-4xl drop-shadow-md">Welcome to ExitPass</CardTitle>
            <CardDescription className="text-white/80">
              Please select your role to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
              <div className="grid grid-cols-2 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.name;
                  return (
                    <button
                      key={role.name}
                      onClick={() => handleRoleSelect(role.name)}
                      className={cn(
                        "group p-6 rounded-xl transition-all duration-300 ease-in-out",
                        "flex flex-col items-center justify-center space-y-2",
                        "bg-white/10 border-2 border-transparent shadow-lg",
                        "hover:scale-[1.03] hover:shadow-primary/40 hover:shadow-2xl hover:bg-white/20",
                        isSelected && "border-primary/80 shadow-lg shadow-primary/50 bg-white/25",
                        isLoggingIn && !isSelected && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={isLoggingIn}
                    >
                      <Icon className={cn("w-8 h-8 text-white/90 transition-colors duration-300 group-hover:text-primary", isSelected && 'text-primary')} />
                      <span className="text-lg font-semibold text-white/90 transition-colors duration-300 group-hover:text-primary">
                        {role.name}
                      </span>
                    </button>
                  );
                })}
              </div>
          </CardContent>
        </Card>
        <p className="absolute bottom-4 text-center text-white/80 text-xs">
          &copy; {new Date().getFullYear()} African Leadership Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
