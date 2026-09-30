import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://eeldlrstipmafirjvogl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EQKZh3BiLS33PRLPwu5Gog_bBPHMHhv";

export function getSupabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
