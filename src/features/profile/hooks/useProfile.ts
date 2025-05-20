import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Profile, ProfileFormData } from '../types';
import { useToast } from '@/components/shared/Toast/useToast';
import { SupabaseError } from '@/lib/supabase/error-handler';

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (error) throw error;
        
        setProfile({
          id: data.id,
          username: data.username,
          email: user?.email || '',
          fullName: data.full_name,
          handicap: data.handicap,
          bestScore: data.best_score,
          roundsPlayed: data.rounds_played,
          homeClub: data.home_club,
          language: data.language,
          phone: data.phone,
          address: data.address,
          country: data.country,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        addToast('error', 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId, user, addToast]);

  const updateProfile = async (formData: ProfileFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          handicap: formData.handicap,
          best_score: formData.bestScore,
          rounds_played: formData.roundsPlayed,
          home_club: formData.homeClub,
          language: formData.language,
          phone: formData.phone,
          address: formData.address,
          country: formData.country,
          avatar_url: formData.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw new SupabaseError('Failed to update profile', error);

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      addToast('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const message = error instanceof SupabaseError 
        ? error.message 
        : 'Failed to update profile';
      addToast('error', message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
  };
}