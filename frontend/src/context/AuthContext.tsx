import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  username: string;
  phone?: string;
  preferred_language: string;
  location: string;
  current_area: string;
  home_area: string;
  latitude: number;
  longitude: number;
}

interface AuthContextType {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  login: (emailOrUsername: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, username?: string, location?: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPass: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'demo-user-1',
  user_id: 'demo-user-1',
  name: 'Karachi Citizen',
  username: 'karachicitizen',
  email: 'citizen@karachi.pk',
  preferred_language: 'en',
  location: 'North Nazimabad, Karachi',
  current_area: 'North Nazimabad, Karachi',
  home_area: 'North Nazimabad, Karachi',
  latitude: 24.9333,
  longitude: 66.9833
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('cwa_user_v2');
    if (cached) {
      try { return JSON.parse(cached); } catch { return null; }
    }
    return null;
  });
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const full_name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Karachi Resident';
        const uname = session.user.user_metadata?.username || `user_${session.user.id.slice(0, 8)}`;
        const loc = session.user.user_metadata?.location || 'North Nazimabad, Karachi';
        const u: UserProfile = {
          id: session.user.id,
          user_id: session.user.id,
          email: session.user.email || 'citizen@karachi.pk',
          name: full_name,
          username: uname,
          preferred_language: 'en',
          location: loc,
          current_area: loc,
          home_area: loc,
          latitude: 24.9333,
          longitude: 66.9833
        };
        setUser(u);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const full_name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Karachi Resident';
        const uname = session.user.user_metadata?.username || `user_${session.user.id.slice(0, 8)}`;
        const loc = session.user.user_metadata?.location || 'North Nazimabad, Karachi';
        const u: UserProfile = {
          id: session.user.id,
          user_id: session.user.id,
          email: session.user.email || 'citizen@karachi.pk',
          name: full_name,
          username: uname,
          preferred_language: 'en',
          location: loc,
          current_area: loc,
          home_area: loc,
          latitude: 24.9333,
          longitude: 66.9833
        };
        setUser(u);
        localStorage.setItem('cwa_user_v2', JSON.stringify(u));
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('cwa_user_v2');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, pass: string) => {
    let emailToUse = emailOrUsername.trim();
    if (!emailToUse.includes('@')) {
      emailToUse = `${emailToUse.toLowerCase()}@citizen.karachi.pk`;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailToUse, password: pass });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
    }
  };

  const signup = async (email: string, pass: string, name: string, username?: string, location?: string) => {
    const uname = username || name.toLowerCase().replace(/\s+/g, '_');
    const loc = location || 'North Nazimabad, Karachi';
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          username: uname,
          location: loc
        }
      }
    });
    if (error) throw error;
    if (data.user) {
      toast.success('Account created successfully!');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('cwa_user_v2');
    localStorage.removeItem('cwa_user');
    setUser(null);
    setSession(null);
    toast.success('Logged out');
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    localStorage.setItem('cwa_user_v2', JSON.stringify(DEMO_USER));
    toast.success('Signed in as Demo Karachi Citizen');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
    toast.success('Password reset email sent! Check your inbox.');
  };

  const updatePassword = async (newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    toast.success('Password updated successfully!');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('cwa_user_v2', JSON.stringify(updated));
      toast.success('Profile updated');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signup, logout, demoLogin, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
