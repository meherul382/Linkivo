import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = "https://eeldlrstipmafirjvogl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_EQKZh3BiLS33PRLPwu5Gog_bBPHMHhv";

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {}
      },
    },
  });
}
