import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  points?: number;
  commission_earned?: number;
  coupon_code?: string;
  referred_by?: string;
  subscription_status?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean; // alias for compatibility
  authEvent: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    role?: UserRole,
    couponCode?: string
  ) => Promise<{ error: any; user: User | null }>;
  adminSignIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    role?: UserRole,
    couponCode?: string
  ) => Promise<User | null>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<string | null>(null);

  // Fetch user profile from profiles table
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthEvent(event);

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole = 'user',
    couponCode?: string
  ) => {
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role, // Pass role in metadata
          },
        },
      });

      if (error) {
        return { error, user: null };
      }

      // If user is created, create profile entry
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email || email,
          role: role,
          points: role === 'employee' ? 0 : undefined,
          commission_earned: role === 'employee' ? 0 : undefined,
          subscription_status: 'inactive',
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError, user: null };
        }

        // Process referral if coupon code provided and user is signing up as 'user'
        if (couponCode && role === 'user') {
          try {
            const { data: referralResult, error: referralError } =
              await supabase.rpc('process_referral_signup', {
                new_user_id: data.user.id,
                coupon_code_param: couponCode,
              });

            if (referralError) {
              console.error('Error processing referral:', referralError);
              // Don't fail signup for referral errors, just log
            } else if (referralResult?.success) {
              console.log('Referral processed successfully:', referralResult);
            }
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
            // Don't fail signup for referral errors
          }
        }
      }

      return { error: null, user: data.user };
    } catch (error) {
      return { error, user: null };
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
  };

  const signup = async (
    email: string,
    password: string,
    role: UserRole = 'user',
    couponCode?: string
  ) => {
    const { error, user: newUser } = await signUp(
      email,
      password,
      role,
      couponCode
    );
    if (error) {
      throw error;
    }
    return newUser;
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await resetPassword(email);
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut();
  };

  const updateUserPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw error;
    }
  };

  const adminSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Verify admin role
    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id);
      if (!userProfile || userProfile.role !== 'admin') {
        await supabase.auth.signOut();
        return {
          error: { message: 'Access denied. Admin privileges required.' },
        };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  // Function to update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Refresh profile data
      await refreshProfile();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isLoading: loading, // alias for compatibility
    authEvent,
    signIn,
    signUp,
    adminSignIn,
    signOut,
    resetPassword,
    refreshProfile,
    updateProfile,
    login,
    signup,
    requestPasswordReset,
    logout,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
