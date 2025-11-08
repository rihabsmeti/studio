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
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
  const auth = useAuth();
  const firestore = useFirestore();


  const bgImage = PlaceHolderImages.find(img => img.id === 'ala-campus-bg');
  const logoHorizontal = PlaceHolderImages.find(img => img.id === 'ala-logo-horizontal');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || !selectedRole || !email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please select a role and enter your email and password.',
        variant: 'destructive',
      });
      return;
    }
    
    // Security check: Enforce email domain for staff roles
    if (['Admin', 'Finance', 'Security'].includes(selectedRole) && !email.endsWith('@africanleadershipacademy.org')) {
        toast({
            title: 'Invalid Email',
            description: `Staff roles (${selectedRole}) require an @africanleadershipacademy.org email address.`,
            variant: 'destructive',
        });
        return;
    }


    setIsLoggingIn(true);
    toast({
      title: 'Authenticating...',
      description: `Please wait while we check your credentials.`,
    });

    try {
      let userCredential: UserCredential;

      try {
        // First, try to sign in.
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // If sign-in fails because the user doesn't exist, create a new account.
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          toast({
            title: 'Creating New Account',
            description: 'First time here? We are setting up your account.',
          });
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          // For any other error (e.g., wrong password), re-throw it.
          throw error;
        }
      }

      const user = userCredential.user;
      const userProfileRef = doc(firestore, 'users', user.uid);
      const userProfileSnap = await getDoc(userProfileRef);

      // Create a user profile in Firestore if one doesn't already exist.
      if (!userProfileSnap.exists()) {
        const userProfileData = {
          id: user.uid,
          email: user.email,
          role: selectedRole,
          fullName: user.displayName || 'New User',
          studentId: `SID-${user.uid.substring(0, 8).toUpperCase()}`,
          hallOfResidence: 'Not Assigned',
          gender: 'Not Specified',
        };
        // Use non-blocking write to create the profile.
        setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });
      }

      toast({
        title: 'Success!',
        description: `Welcome! Redirecting to your dashboard.`,
      });

      // Use the role from the database if it exists, otherwise use the selected role.
      const finalRole = userProfileSnap.exists() ? userProfileSnap.data().role : selectedRole;
      
      let redirectPath = `/dashboard?role=${finalRole}`;
      switch (finalRole) {
        case 'Admin':
            redirectPath = `/dashboard/admin?role=${finalRole}`;
            break;
        case 'Finance':
            redirectPath = `/dashboard/finance?role=${finalRole}`;
            break;
        case 'Security':
            redirectPath = `/dashboard/security?role=${finalRole}`;
            break;
        case 'Student':
            redirectPath = `/dashboard?role=${finalRole}`;
            break;
        default:
            redirectPath = `/dashboard?role=${finalRole}`;
      }
      router.push(redirectPath);

    } catch (error: any) {
      console.error('Authentication failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'The password or email you entered is incorrect. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account. Please try signing in.';
      } else {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
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
              Please select your role to sign in or create an account.
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
                                required
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
                                required
                            />
                        </div>
                    </div>
                  <Button type="submit" className="w-full bg-primary/80 hover:bg-primary text-white font-bold" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Authenticating...' : `Sign In / Sign Up as ${selectedRole}`}
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
