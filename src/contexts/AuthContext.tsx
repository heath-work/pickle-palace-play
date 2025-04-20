
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  membership_type: string | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<{ error: any | null }>;
  refreshProfile: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAndUpdateMembership = async (userId: string) => {
    try {
      console.log('Checking subscription status for user:', userId);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId }
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data.subscribed) {
        console.log('User has active subscription:', data.subscription_tier);
        // Update profile with subscription tier
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            membership_type: data.subscription_tier,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile with membership:', updateError);
        } else {
          console.log('Successfully updated profile with membership type:', data.subscription_tier);
          // Refresh the profile to get the updated data
          await fetchProfile(userId);
        }
      } else {
        console.log('No active subscription found');
      }
    } catch (error) {
      console.error('Error in checkAndUpdateMembership:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Auth state changed, checking membership for user:', session.user.id);
        // Using setTimeout to prevent deadlocks with Supabase auth
        setTimeout(() => {
          if (mounted) {
            checkAndUpdateMembership(session.user.id);
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Initial session check, checking membership for user:', session.user.id);
        // Using setTimeout to prevent deadlocks with Supabase auth
        setTimeout(() => {
          if (mounted) {
            checkAndUpdateMembership(session.user.id);
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        console.log('Profile data received:', data);
        if (data) {
          setProfile(data as Profile);
        } else {
          console.error('No profile found for user ID:', userId);
          // Create a default profile if one doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId,
                username: user?.email?.split('@')[0] || null,
                full_name: user?.user_metadata?.full_name || null,
                membership_type: null
              }
            ]);
          
          if (insertError) {
            console.error('Error creating default profile:', insertError);
          } else {
            console.log('Created default profile for user');
            // Fetch the newly created profile
            fetchProfile(userId);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (userId: string) => {
    try {
      console.log('Refreshing profile for userId:', userId);
      await fetchProfile(userId);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (!error) {
        toast.success('Account created successfully');
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          toast.error('Signup successful, but automatic sign-in failed');
        }
      } else {
        toast.error(error.message);
      }
      return { error };
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('An error occurred during signup');
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully');
      }
      return { error };
    } catch (error) {
      console.error('Error during sign in:', error);
      toast.error('An error occurred during sign in');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('An error occurred during sign out');
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updates = {
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profile with data:', updates);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('An error occurred while updating your profile');
      } else {
        if (profile) {
          setProfile({ ...profile, ...profileData });
          toast.success('Profile updated successfully');
          console.log('Profile updated successfully:', { ...profile, ...profileData });
        }
      }
      return { error };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
