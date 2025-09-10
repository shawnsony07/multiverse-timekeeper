import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let subscription: any;
    
    try {
      // Set up auth state listener
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          try {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (event === 'SIGNED_IN') {
              toast({
                title: "Welcome back!",
                description: "You've successfully signed in.",
              });
            } else if (event === 'SIGNED_OUT') {
              // Don't show toast for sign out here since we handle it in signOut function
              console.log('Auth state changed: signed out');
            }
          } catch (stateError) {
            console.error('Error handling auth state change:', stateError);
            setLoading(false);
          }
        }
      );
      
      subscription = authSubscription;

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } catch (sessionError) {
          console.error('Error setting initial session:', sessionError);
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }).catch((error) => {
        console.error('Error getting initial session:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
      });
    } catch (setupError) {
      console.error('Error setting up auth listener:', setupError);
      setLoading(false);
    }

    return () => {
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (cleanupError) {
        console.error('Error cleaning up auth subscription:', cleanupError);
      }
    };
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your signup.",
      });

      return {};
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      return {};
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Prevent multiple simultaneous sign out attempts
    if (isSigningOut) {
      console.log('Sign out already in progress, ignoring request');
      return;
    }
    
    try {
      setIsSigningOut(true);
      setLoading(true);
      
      // Check if we're online before attempting Supabase sign out
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        // Try to sign out from Supabase with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Sign out timeout')), 5000); // 5 second timeout
          });
          
          const signOutPromise = supabase.auth.signOut();
          
          const { error } = await Promise.race([signOutPromise, timeoutPromise]);
          
          if (error) {
            console.warn('Supabase sign out error:', error.message);
            // Don't show error toast for sign out issues, just continue with local cleanup
          }
        } catch (supabaseError: any) {
          console.warn('Supabase sign out failed or timed out:', supabaseError.message);
          // Continue with local cleanup even if Supabase fails
        }
      } else {
        console.log('Offline: skipping Supabase sign out, doing local cleanup only');
      }
      
      // Force local state cleanup regardless of Supabase response
      setUser(null);
      setSession(null);
      
      // Don't clear user data on sign out - users expect their clocks to persist
      // Only clear session-specific data if any
      try {
        // Clear any session-only data here if needed in the future
        // localStorage.removeItem('session-specific-data');
        console.log('Sign out: preserving user clocks data');
      } catch (storageError) {
        console.warn('Failed to handle storage during sign out:', storageError);
      }
      
      // Show success toast
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, force local cleanup
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You've been signed out (with some cleanup issues).",
      });
    } finally {
      setLoading(false);
      setIsSigningOut(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}