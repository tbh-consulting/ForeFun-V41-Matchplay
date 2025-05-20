export class SupabaseError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: unknown): never {
  console.error('Supabase error:', error);
  throw new SupabaseError(
    'Failed to connect to Supabase',
    error instanceof Error ? error.message : error
  );
}