import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not configured');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// For backward compatibility, lazily initialize the default export
let lazySupabase: ReturnType<typeof createClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target: any, prop: string) {
    if (!lazySupabase && supabaseUrl && supabaseAnonKey) {
      lazySupabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return lazySupabase?.[prop as keyof typeof lazySupabase];
  },
});
