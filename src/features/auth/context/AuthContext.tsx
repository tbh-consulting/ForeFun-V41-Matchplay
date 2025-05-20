import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/shared/Toast/useToast';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface User {
  id: string;
  email: string;
  username: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  handicap?: number | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    addToast('success', 'Successfully logged in!');
    navigate('/');
  };

  const register = async ({ email, password, username, handicap }: RegisterData) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          handicap: handicap || 0
        },
      },
    });

    if (error) {
      throw error;
    }

    addToast('success', 'Account created successfully!');
    navigate('/');
  };

  const logout = async () => {
    try {
      // First try to get the current session
      const { data: { session } } = await supabase.auth.getSession();

      // If there's no session, just clean up local state
      if (!session) {
        setUser(null);
        addToast('info', 'Logged out successfully');
        navigate('/login', { replace: true });
        return;
      }

      // If we have a session, try to sign out
      const { error } = await supabase.auth.signOut();
      
      // Handle any errors during sign out
      if (error) {
        // If it's a session_not_found error, we can ignore it
        if (error.message?.includes('session_not_found')) {
          console.warn('Session not found during logout, proceeding anyway');
        } else {
          // For other errors, log them but continue with cleanup
          console.error('Error during sign out:', error);
        }
      }

      // Always clean up local state
      setUser(null);
      addToast('info', 'Logged out successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      // Handle any unexpected errors
      console.error('Unexpected error during logout:', error);
      
      // Still clean up local state
      setUser(null);
      addToast('info', 'Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}