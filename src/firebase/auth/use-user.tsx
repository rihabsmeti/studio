'use client';
import { useFirebase } from '@/firebase/provider';

export interface UserHookResult {
  user: any | null; // Consider using a more specific User type if available from Firebase
  isUserLoading: boolean;
  userError: Error | null;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
