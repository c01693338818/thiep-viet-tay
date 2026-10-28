"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { generateOrderCode, getOrderByCode } from "@/lib/orders";
import { getShippingFee, SHIPPING_ZONES } from "@/lib/shipping";
import { createServiceClient } from "@/lib/supabase/server";
import { MAX_MESSAGE_LENGTH, type Product } from "@/lib/types";

const zoneIds = SHIPPING_ZONES.map((z) => z.id) as [string, ...string[]];

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Nhập họ tên").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)\d{9}$/, "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)"),
  address: z.string().trim().min(10, "Địa chỉ quá ngắn").max(300),
  note: z.string().trim().max(500).optional(),
  zone: z.enum(zoneIds, { message: "Chọn khu vực giao hàng" }),
  payment_method: z.enum(["cod", "bank_transfer"], { message: "Chọn cách thanh toán" }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
        customMessage: z.string().trim().max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1, "Giỏ hàng trống"),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutResult = { ok: true; code: string } | { ok: false; error: string };

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const data = parsed.data;
  const supabase = createServiceClient();

  // Lấy giá từ DB, không tin giá client gửi lên.
  const ids = [...new Set(data.items.map((i) => i.productId))];
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price, type, is_active")
    .in("id", ids);
  if (productError) return { ok: false, error: "Không kiểm tra được sản phẩm, thử lại sau." };

  const byId = new Map((products as Pick<Product, "id" | "name" | "price" | "type" | "is_active">[]).map((p) => [p.id, p]));
  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_active) return { ok: false, error: "Có sản phẩm trong giỏ đã ngừng bán." };
    if (p.type === "handwritten" && item.customMessage.length === 0) {
      return { ok: false, error: `"${p.name}" cần lời nhắn để viết tay.` };
    }
  }

  const subtotal = data.items.reduce((s, i) => s + byId.get(i.productId)!.price * i.quantity, 0);
  const shipping_fee = getShippingFee(data.zone as (typeof SHIPPING_ZONES)[number]["id"]);
  const total = subtotal + shipping_fee;

  // Thử tối đa 3 lần phòng trùng mã (xác suất rất thấp).
  let code = "";
  let orderId = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    code = generateOrderCode();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        code,
        customer_name: data.customer_name,
        phone: data.phone,
        address: `${data.address} (${SHIPPING_ZONES.find((z) => z.id === data.zone)?.label})`,
        note: data.note || null,
        shipping_fee,
        total,
        payment_method: data.payment_method,
        status: "new",
      })
      .select("id")
      .single();

    if (!error) {
      orderId = order.id;
      break;
    }
    if (error.code !== "23505") return { ok: false, error: "Không tạo được đơn, thử lại sau." };
  }
  if (!orderId) return { ok: false, error: "Không tạo được đơn, thử lại sau." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    data.items.map((i) => {
      const p = byId.get(i.productId)!;
      return {
        order_id: orderId,
        product_id: p.id,
        product_name: p.name,
        price: p.price,
        quantity: i.quantity,
        custom_message: i.customMessage || null,
      };
    })
  );
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    return { ok: false, error: "Không lưu được sản phẩm trong đơn, thử lại sau." };
  }

  return { ok: true, code };
}

const lookupSchema = z.object({
  code: z.string().trim().min(1, "Nhập mã đơn"),
  phone: z.string().trim().min(1, "Nhập số điện thoại"),
});

export async function lookupOrder(_prev: { error?: string } | null, formData: FormData) {
  const parsed = lookupSchema.safeParse({ code: formData.get("code"), phone: formData.get("phone") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const order = await getOrderByCode(parsed.data.code);
  const phoneMatches = order && order.phone.replace(/\D/g, "").endsWith(parsed.data.phone.replace(/\D/g, "").slice(-9));
  if (!order || !phoneMatches) return { error: "Không tìm thấy đơn với mã và số điện thoại này." };

  redirect(`/don-hang/${order.code}`);
}
