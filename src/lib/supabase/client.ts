import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { SUPABASE_CONFIG } from './config';
import { clientOptions } from './client-options';
import { handleSupabaseError } from './error-handler';

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.warn('Missing Supabase environment variables');
}

try {
  export const supabase = createClient<Database>(
    SUPABASE_CONFIG.url || '',
    SUPABASE_CONFIG.anonKey || '',
    clientOptions
  );
} catch (error) {
  handleSupabaseError(error);
}

export { isSupabaseConfigured } from './config';