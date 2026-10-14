import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error("Missing server-only Supabase configuration.");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
