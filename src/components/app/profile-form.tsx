"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Profile = {
  fullName: string;
  email: string;
  studentId: string;
  hallOfResidence: string;
  gender: string;
};

const ProfileForm = () => {
  const [profile, setProfile] = useState<Profile>({
    fullName: 'Ahmed Farouk',
    email: 'ahmedff@gmail.com',
    studentId: 'zTDGEi7gfeYtWR8k06f5QQetjICWKZ2',
    hallOfResidence: 'Nelson Mandela Hall',
    gender: 'Male',
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: 'Profile updated successfully!' });
  };

  const handleChange = <K extends keyof Profile>(field: K, value: Profile[K]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (!isEditing) setIsEditing(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card className="animate-fade-in-up">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Identity & Contact</CardTitle>
          <CardDescription>Your personal and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={profile.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={profile.email} disabled />
            <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input id="studentId" value={profile.studentId} disabled />
             <p className="text-xs text-muted-foreground">Your unique identifier cannot be changed.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Campus Information</CardTitle>
          <CardDescription>Details related to your life on campus.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="hallOfResidence">Hall of Residence</Label>
            <Input id="hallOfResidence" value={profile.hallOfResidence} onChange={(e) => handleChange('hallOfResidence', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={profile.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!isEditing}>
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileForm;
