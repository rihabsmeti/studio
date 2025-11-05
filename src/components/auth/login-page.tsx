"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, User, Shield, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

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
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-[-10] animate-ken-burns"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 z-[-5] bg-black/50" />

      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-fade-slide-down">
        {logoHorizontal && (
          <Image
            src={logoHorizontal.imageUrl}
            alt={logoHorizontal.description}
            width={400}
            height={80}
            data-ai-hint={logoHorizontal.imageHint}
          />
        )}
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="w-full max-w-md md:max-w-lg p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-fade-in-slide-up">
          <h2 className="font-headline text-5xl text-white text-center mb-2 drop-shadow-md">Good Morning</h2>
          <p className="font-body text-white/80 text-center mb-8">
            Welcome to ExitPass. Please select your role to log in.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.name;
              return (
                <button
                  key={role.name}
                  onClick={() => handleRoleSelect(role.name)}
                  className={cn(
                    "p-6 rounded-xl transition-all duration-300 ease-in-out",
                    "flex flex-col items-center justify-center space-y-2 text-white",
                    "bg-white/15 border-2 border-transparent shadow-lg",
                    "hover:scale-[1.03] hover:shadow-primary/20 hover:shadow-xl",
                    isSelected && "border-primary/70 shadow-lg shadow-primary/50"
                  )}
                  disabled={isLoggingIn}
                >
                  <Icon className={cn("w-8 h-8 transition-colors duration-300", isSelected ? 'text-primary' : 'text-white/80')} />
                  <span className={cn("text-lg font-semibold transition-colors duration-300", isSelected ? 'text-white' : 'text-white')}>
                    {role.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-white/60 text-sm mt-12">
            &copy; {new Date().getFullYear()} African Leadership Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
