import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Sanitizes Supabase URL to strip any accidental trailing slashes or /rest/v1 paths.
 */
export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  return rawUrl.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
}

const supabaseUrl = sanitizeSupabaseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
);
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    (supabaseServiceRoleKey || supabaseAnonKey)
  );
}

// Global cached singletons across Next.js invocations
let cachedAdminClient: SupabaseClient | null = null;
let cachedAnonClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client configured with the Service Role Key.
 * For Next.js server-side operations (API routes, admin moderation, storage uploads).
 * Bypasses RLS to ensure operations succeed.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedAdminClient;
}

/**
 * Returns a Supabase client configured with the Anon Public Key.
 */
export function getSupabaseAnonClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    });
  }
  return cachedAnonClient;
}

/**
 * Returns the best available Supabase client (service role preferred on server).
 */
export function getSupabaseClient(): SupabaseClient | null {
  return getSupabaseAdminClient() || getSupabaseAnonClient();
}
