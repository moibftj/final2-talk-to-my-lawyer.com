import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import supabase from '../services/supabase';
import { emailService } from '../services/emailService';
import type { User, UserRole } from '../types';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole, affiliateCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
  authEvent: AuthChangeEvent | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleAuthSession(session);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthEvent(event);
        if (event === 'SIGNED_IN' && session) {
          await handleAuthSession(session);
          // Send welcome email when user verifies their email
          if (session.user.email) {
            try {
              await emailService.sendWelcomeEmail(session.user.email);
            } catch (error) {
              console.error('Failed to send welcome email:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'PASSWORD_RECOVERY') {
          // This event is handled in App.tsx to show the password reset page
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSession = async (session: Session) => {
    if (session.user) {
      const profile = await fetchUserProfile(session.user);
      setUser({
        email: session.user.email!,
        role: profile?.role || 'user',
      });
    }
  };

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // First try to get the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: supabaseUser.id,
                email: supabaseUser.email,
                role: 'user'
              }
            ])
            .select('role')
            .single();
            
          if (createError) {
            console.error('Error creating user profile:', createError);
            return null;
          }
          return newProfile as { role: UserRole };
        }
        return null;
      }
      return data as { role: UserRole };
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, role: UserRole, affiliateCode?: string) => {
    // The database is configured with a trigger that automatically creates a
    // 'profiles' row for each new user in the 'auth.users' table.
    // We pass the role in the metadata so the trigger can access it.
    const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                role: role,
                affiliate_code: affiliateCode
            },
            emailRedirectTo: `${window.location.origin}/#verified`
        }
    });
    if (error) throw error;
    
    // Send verification email via MailerSend
    if (data.user && data.user.email && !data.user.email_confirmed_at) {
      try {
        // Get the confirmation URL from Supabase (this would normally be in the email)
        const verificationLink = `${window.location.origin}/#verify-email?token=${data.user.id}`;
        await emailService.sendVerificationEmail(data.user.email, verificationLink);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't throw here as the user account was created successfully
      }
    }
    
    // The user will be signed in after confirming their email.
    // The onAuthStateChange listener will handle the session and profile fetching.
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // Supabase handles the token in the URL
    });
    if (error) throw error;
  };

  const updateUserPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, requestPasswordReset, updateUserPassword, authEvent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
