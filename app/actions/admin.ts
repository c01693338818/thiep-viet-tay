"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "writing", "shipped", "done", "cancelled"];

export type ActionState = { error?: string; ok?: boolean } | null;

// ---------- Đơn hàng ----------

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Trạng thái không hợp lệ");

  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(`Không cập nhật được: ${error.message}`);

  revalidatePath("/admin/don-hang");
  revalidatePath(`/admin/don-hang/${orderId}`);
}

export async function updateTracking(orderId: string, formData: FormData) {
  await requireAdmin();
  const tracking = String(formData.get("tracking_code") ?? "").trim() || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").update({ tracking_code: tracking }).eq("id", orderId);
  if (error) throw new Error(`Không lưu được mã vận đơn: ${error.message}`);

  revalidatePath(`/admin/don-hang/${orderId}`);
}

const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

export async function uploadProof(
  orderId: string,
  itemId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }
  const file = formData.get("proof");
  if (!(file instanceof File) || file.size === 0) return { error: "Chưa chọn ảnh" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Ảnh quá 3.5MB, chọn ảnh nhỏ hơn." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${orderId}/${itemId}-${Date.now()}.${ext}`;
  const supabase = createServiceClient();

  const { error: uploadError } = await supabase.storage
    .from("proofs")
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
  if (uploadError) return { error: `Không upload được ảnh: ${uploadError.message}` };

  const { data } = supabase.storage.from("proofs").getPublicUrl(path);
  const { error } = await supabase
    .from("order_items")
    .update({ proof_image_url: data.publicUrl })
    .eq("id", itemId);
  if (error) return { error: `Không lưu được ảnh: ${error.message}` };

  revalidatePath(`/admin/don-hang/${orderId}`);
  return { ok: true };
}

// ---------- Sản phẩm ----------

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Nhập tên sản phẩm").max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  type: z.enum(["postcard", "handwritten"], { message: "Chọn loại sản phẩm" }),
  price: z.coerce.number().int("Giá phải là số nguyên").min(0, "Giá không âm"),
  description: z.string().trim().max(1000).optional(),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean(),
  image_url: z.string().trim().optional(),
});

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") ?? "")),
    type: formData.get("type"),
    price: formData.get("price"),
    description: formData.get("description") || undefined,
    sort_order: formData.get("sort_order") || 0,
    is_active: formData.get("is_active") === "on",
    image_url: formData.get("image_url") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const { id, ...fields } = parsed.data;
  const supabase = createServiceClient();

  // Ảnh mới (nếu có) → upload lên bucket products.
  const image = formData.get("image");
  let image_url = fields.image_url ?? null;
  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) return { error: "Ảnh quá 3.5MB, chọn ảnh nhỏ hơn." };
    const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${fields.slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(path, Buffer.from(await image.arrayBuffer()), { contentType: image.type, upsert: true });
    if (uploadError) return { error: `Không upload được ảnh: ${uploadError.message}` };
    image_url = supabase.storage.from("products").getPublicUrl(path).data.publicUrl;
  }

  const row = { ...fields, description: fields.description ?? null, image_url };
  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (error) {
    if (error.code === "23505") return { error: "Slug đã tồn tại, đổi slug khác." };
    return { error: `Không lưu được: ${error.message}` };
  }

  updateTag("products");
  revalidatePath("/admin/san-pham");
  redirect("/admin/san-pham");
}

export async function toggleProductActive(productId: string, is_active: boolean) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("products").update({ is_active }).eq("id", productId);
  if (error) throw new Error(`Không cập nhật được: ${error.message}`);

  updateTag("products");
  revalidatePath("/admin/san-pham");
}

// "Thiệp sinh nhật viết tay" → "thiep-sinh-nhat-viet-tay"
function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
