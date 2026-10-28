import { createServiceClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/lib/orders";
import type { OrderStatus, Product } from "@/lib/types";

// Chỉ gọi sau khi đã getAdminUser()/requireAdmin() — dùng service role, bỏ qua RLS.

export async function listOrders(status?: OrderStatus): Promise<OrderWithItems[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`Không tải được đơn: ${error.message}`);
  return data as OrderWithItems[];
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Không tải được đơn: ${error.message}`);
  return data as OrderWithItems | null;
}

export async function countOrdersByStatus(): Promise<Record<string, number>> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("orders").select("status");
  if (error) throw new Error(`Không đếm được đơn: ${error.message}`);
  const counts: Record<string, number> = {};
  for (const row of data as { status: string }[]) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

export async function listAllProducts(): Promise<Product[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Không tải được sản phẩm: ${error.message}`);
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Không tải được sản phẩm: ${error.message}`);
  return data as Product | null;
}
