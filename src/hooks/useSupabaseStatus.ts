import { useState, useEffect } from 'react';
import { checkSupabaseHealth } from '@/lib/supabase/connection';
import { isSupabaseConfigured } from '@/lib/supabase';

export function useSupabaseStatus() {
  const [status, setStatus] = useState({
    isConfigured: false,
    isConnected: false,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const checkStatus = async () => {
      const isConfigured = isSupabaseConfigured();
      
      if (!isConfigured) {
        setStatus({
          isConfigured: false,
          isConnected: false,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      try {
        const { isConnected, isAuthenticated } = await checkSupabaseHealth();
        setStatus({
          isConfigured: true,
          isConnected,
          isAuthenticated,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to check Supabase status:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkStatus();
  }, []);

  return status;
}