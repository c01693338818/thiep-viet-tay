"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!isAdminEmail(email)) return { error: "Tài khoản này không có quyền admin." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Sai email hoặc mật khẩu." };

  redirect(next.startsWith("/admin") ? next : "/admin/don-hang");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
