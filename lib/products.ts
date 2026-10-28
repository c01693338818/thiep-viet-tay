import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product, ProductType } from "./types";

// Client anon không gắn cookie: dùng được bên trong "use cache".
function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// Sản phẩm ít đổi → cache theo giờ, admin sửa thì revalidateTag("products").
export async function getProducts(type?: ProductType): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  let query = publicClient()
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw new Error(`Không tải được sản phẩm: ${error.message}`);
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${slug}`);

  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Không tải được sản phẩm: ${error.message}`);
  return data as Product | null;
}
