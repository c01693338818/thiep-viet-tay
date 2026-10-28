import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Danh sách email được vào /admin, cách nhau bằng dấu phẩy trong ADMIN_EMAILS.
const allowed = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null) {
  return Boolean(email) && allowed.includes(email!.toLowerCase());
}

export type AdminUser = { id: string; email: string };

async function readAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return { id: user.id, email: user.email! };
}

// Dùng trong Server Component: chưa đăng nhập thì đưa về /login.
export async function getAdminUser(): Promise<AdminUser> {
  const admin = await readAdmin();
  if (!admin) redirect("/login");
  return admin;
}

// Dùng trong Server Action: không redirect, ném lỗi để action trả về thông báo.
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await readAdmin();
  if (!admin) throw new Error("Bạn chưa đăng nhập admin.");
  return admin;
}
