import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service role client for privileged server operations (bypasses RLS).
 * Always manually scope queries with `user_id = req.user.id`.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Creates an authenticated Supabase client scoped to a user's JWT token.
 * @param {string} token - The user's Supabase JWT access token
 */
export function createUserClient(token) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
