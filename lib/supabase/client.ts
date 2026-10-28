import { createBrowserClient } from "@supabase/ssr";

// Dùng trong Client Components. Chỉ có quyền của anon key (đọc products).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
