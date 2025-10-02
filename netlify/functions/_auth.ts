import { createClient } from '@supabase/supabase-js';
import type { HandlerEvent } from '@netlify/functions';

interface UserContext {
  user: any;
  profile: { id: string; role?: string; email?: string } | null;
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_ANON_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  // We intentionally throw early so misconfiguration surfaces fast in logs
  console.warn('[auth] Missing SUPABASE_URL (or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_URL) or VITE_SUPABASE_ANON_KEY env vars');
}

function getAnonClient() {
  return createClient(supabaseUrl!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'X-Client-Info': 'netlify-fn-anon' } }
  });
}

export async function getUserContext(event: HandlerEvent): Promise<UserContext> {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { statusCode: 401, message: 'Missing or invalid Authorization header' };
  }
  const accessToken = authHeader.substring('Bearer '.length).trim();
  if (!accessToken) {
    throw { statusCode: 401, message: 'Empty access token' };
  }

  const supabase = getAnonClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    throw { statusCode: 401, message: 'Invalid or expired token' };
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, email')
    .eq('id', user.id)
    .single();

  if (profileError) {
    // Profile not strictly required for some endpoints; here we escalate for admin gating
    throw { statusCode: 403, message: 'Profile not found' };
  }

  return { user, profile };
}

export async function requireAdmin(event: HandlerEvent): Promise<UserContext> {
  const ctx = await getUserContext(event);
  if (ctx.profile?.role !== 'admin') {
    throw { statusCode: 403, message: 'Admin role required' };
  }
  return ctx;
}

export function jsonResponse(statusCode: number, body: any, extraHeaders: Record<string,string> = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body)
  };
}
