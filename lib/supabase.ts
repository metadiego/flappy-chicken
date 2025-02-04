import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

let supabase: ReturnType<typeof createBrowserClient<Database>>;

export const getSupabase = () => {
  if (!supabase && typeof window !== "undefined") {
    supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
};
