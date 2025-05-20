import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity } from '../types';
import { useToast } from '@/components/shared/Toast/useToast';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchActivities() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setActivities(data.map(activity => ({
          id: activity.id,
          userId: activity.user_id,
          type: activity.type,
          data: activity.data,
          createdAt: activity.created_at
        })));
      } catch (error) {
        console.error('Error fetching activities:', error);
        addToast('error', 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, [addToast]);

  return { activities, isLoading };
}