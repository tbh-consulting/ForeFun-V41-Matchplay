import { supabase } from './client';

export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection validation failed:', error);
    return false;
  }
}

export async function checkSupabaseHealth(): Promise<{
  isConnected: boolean;
  isAuthenticated: boolean;
}> {
  try {
    const [connectionValid, { data: { session } }] = await Promise.all([
      validateSupabaseConnection(),
      supabase.auth.getSession()
    ]);

    return {
      isConnected: connectionValid,
      isAuthenticated: !!session
    };
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return {
      isConnected: false,
      isAuthenticated: false
    };
  }
}