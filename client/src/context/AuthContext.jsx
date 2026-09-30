import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { apiClient } from '../lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check initial session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        // Fallback local demo user for development when Supabase project is not yet provisioned
        const savedUser = localStorage.getItem('km_local_user');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (mounted) {
              setUser(parsed);
              setProfile(parsed.profile);
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          // Default demo profile for seamless instant local exploration
          const demoUser = {
            id: 'demo-farmer-id',
            email: 'farmer@kisanmitra.ai',
            profile: {
              full_name: 'Ramesh Patel',
              preferred_language: localStorage.getItem('km_language') || 'en',
              state: 'Maharashtra',
              district: 'Nashik',
              onboarding_completed: true
            }
          };
          if (mounted) {
            setUser(demoUser);
            setProfile(demoUser.profile);
            localStorage.setItem('km_local_user', JSON.stringify(demoUser));
          }
        }
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user || null);
          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    }
  }, []);

  async function fetchProfile(userId) {
    try {
      const res = await apiClient('/me');
      setProfile(res?.profile || null);
    } catch (err) {
      console.warn('Could not fetch remote profile:', err.message);
      // Fallback local profile
      setProfile({
        id: userId,
        full_name: user?.user_metadata?.full_name || 'Farmer',
        preferred_language: 'en',
        onboarding_completed: false
      });
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'demo-farmer-id',
        email,
        profile: {
          full_name: email.split('@')[0],
          preferred_language: 'en',
          state: 'Maharashtra',
          district: 'Nashik',
          onboarding_completed: true
        }
      };
      setUser(demoUser);
      setProfile(demoUser.profile);
      localStorage.setItem('km_local_user', JSON.stringify(demoUser));
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, metadata = {}) => {
    if (!isSupabaseConfigured) {
      const demoUser = {
        id: 'user-' + Date.now(),
        email,
        profile: {
          full_name: metadata.full_name || 'Kisan Mitra Farmer',
          preferred_language: metadata.preferred_language || 'en',
          onboarding_completed: false
        }
      };
      setUser(demoUser);
      setProfile(demoUser.profile);
      localStorage.setItem('km_local_user', JSON.stringify(demoUser));
      return { user: demoUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('km_local_user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    if (!isSupabaseConfigured) {
      const updatedUser = { ...user, profile: { ...profile, ...updates } };
      setUser(updatedUser);
      localStorage.setItem('km_local_user', JSON.stringify(updatedUser));
      return updatedUser.profile;
    }
    const res = await apiClient('/me', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    setProfile(res?.profile);
    return res?.profile;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        isConfigured: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
