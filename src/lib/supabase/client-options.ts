import { SupabaseClientOptions } from '@supabase/supabase-js';

export const clientOptions: SupabaseClientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'forefun'
    }
  },
  db: {
    schema: 'public'
  }
};