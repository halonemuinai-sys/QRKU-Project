import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseServer() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'barcode' }
    });
  }
  return _supabase;
}

// Lazy proxy so Supabase isn't instantiated at build time
export const supabaseServer: any = new Proxy({}, {
  get(_, prop) {
    return (getSupabaseServer() as any)[prop];
  }
});
