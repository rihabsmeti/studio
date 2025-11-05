"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, User, Shield, Briefcase, AtSign, KeyRound, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const roles = [
    { name: 'Student', icon: User },
    { name: 'Finance', icon: Briefcase },
    { name: 'Security', icon: Shield },
    { name: 'Admin', icon: Building },
];

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const bgImage = PlaceHolderImages.find(img => img.id === 'ala-campus-bg');
  const logoHorizontal = PlaceHolderImages.find(img => img.id === 'ala-logo-horizontal');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || !selectedRole) return;

    if (!email || !password) {
        toast({
            title: 'Missing Information',
            description: 'Please enter your email and password.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoggingIn(true);
    toast({
      title: 'Logging In...',
      description: `You will be redirected as ${selectedRole}.`,
    });

    setTimeout(() => {
      // In a real app, you'd perform authentication here.
      router.push(`/dashboard?role=${selectedRole}`);
    }, 1500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-body">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          style={{objectFit:"cover"}}
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
              Please select your role to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-4">
                {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                        <button
                            key={role.name}
                            onClick={() => setSelectedRole(role.name)}
                            disabled={isLoggingIn}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all duration-200",
                                "bg-white/10 border-2 border-transparent",
                                "hover:bg-white/20 hover:border-primary/50",
                                selectedRole === role.name ? "bg-white/20 border-primary" : "",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <Icon className="h-8 w-8 text-white" />
                            <span className="font-semibold">{role.name}</span>
                        </button>
                    )
                })}
            </div>

            {selectedRole && (
                 <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email for {selectedRole}</Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="you@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border-white/20 pl-10 text-white placeholder:text-white/50"
                                disabled={isLoggingIn}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border-white/20 pl-10 text-white placeholder:text-white/50"
                                disabled={isLoggingIn}
                            />
                        </div>
                    </div>
                  <Button type="submit" className="w-full bg-primary/80 hover:bg-primary text-white font-bold" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Logging in...' : 'Log In'}
                    <LogIn className="ml-2 h-5 w-5" />
                  </Button>
                </form>
            )}
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
