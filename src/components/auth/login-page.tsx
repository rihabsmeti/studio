"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, User, Shield, Briefcase, AtSign, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const bgImage = PlaceHolderImages.find(img => img.id === 'ala-campus-bg');
  const logoHorizontal = PlaceHolderImages.find(img => img.id === 'ala-logo-horizontal');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    if (!email || !password || !role) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all fields.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoggingIn(true);
    toast({
      title: 'Logging In...',
      description: `You will be redirected as ${role}.`,
    });

    setTimeout(() => {
      // In a real app, you'd perform authentication here.
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
              Please sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
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
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={setRole} value={role} disabled={isLoggingIn}>
                        <SelectTrigger id="role" className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 text-white border-white/20">
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Staffulty">Staffulty</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
              <Button type="submit" className="w-full bg-primary/80 hover:bg-primary text-white font-bold" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Log In'}
                <LogIn className="ml-2 h-5 w-5" />
              </Button>
            </form>
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
