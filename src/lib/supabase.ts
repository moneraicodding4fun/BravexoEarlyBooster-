import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase bootstrap.
 *
 * Provide VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in a .env file to go
 * live. Without them the app runs in Demo Mode against the local mock data
 * layer (src/lib/mockDb.ts) — every feature stays fully functional.
 *
 * The companion schema with RLS + the hard admin lock lives in
 * supabase/schema.sql.
 */

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Public sign-ups are disabled at the DB level (see schema.sql);
        // the UI only ever calls signInWithPassword / invited sign-ups.
        flowType: 'pkce',
      },
    })
  : null
