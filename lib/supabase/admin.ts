import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://eeldlrstipmafirjvogl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EQKZh3BiLS33PRLPwu5Gog_bBPHMHhv";

export function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
