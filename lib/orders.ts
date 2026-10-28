import { createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export type OrderWithItems = Order & { items: OrderItem[] };

// Chỉ gọi từ server (Server Component / Server Action) — dùng service role.
export async function getOrderByCode(code: string): Promise<OrderWithItems | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error) throw new Error(`Không tải được đơn: ${error.message}`);
  return data as OrderWithItems | null;
}

// Mã đơn: TH-YYMMDD-XXXX (4 ký tự ngẫu nhiên), dễ đọc khi khách chuyển khoản.
export function generateOrderCode(now = new Date()) {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ I, O, 0, 1 cho khỏi nhầm
  let rand = "";
  for (let i = 0; i < 4; i++) rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `TH-${yy}${mm}${dd}-${rand}`;
}
