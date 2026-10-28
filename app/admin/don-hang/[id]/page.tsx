import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/admin/submit-button";
import { updateOrderStatus, updateTracking, uploadProof } from "@/app/actions/admin";
import { getOrderById } from "@/lib/admin-data";
import { getAdminUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, type OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Chi tiết đơn" };

// Bước tiếp theo của quy trình xử lý.
const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "confirmed", label: "Xác nhận đơn" },
  confirmed: { status: "writing", label: "Bắt đầu viết" },
  writing: { status: "shipped", label: "Đã gửi hàng" },
  shipped: { status: "done", label: "Hoàn tất" },
};

export default function AdminOrderPage({ params }: PageProps<"/admin/don-hang/[id]">) {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/don-hang" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Đơn hàng
      </Link>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải…</p>}>
        <OrderDetail params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/don-hang/[id]">, "params">) {
  await getAdminUser();
  const order = await getOrderById((await params).id);
  if (!order) notFound();

  const next = NEXT_STATUS[order.status];
  const canCancel = order.status !== "done" && order.status !== "cancelled";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold">{order.code}</h1>
          <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
          <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
        </div>
        <div className="flex gap-2">
          {next && (
            <form action={updateOrderStatus.bind(null, order.id, next.status)}>
              <SubmitButton pendingText="Đang cập nhật…">{next.label}</SubmitButton>
            </form>
          )}
          {canCancel && (
            <form action={updateOrderStatus.bind(null, order.id, "cancelled")}>
              <SubmitButton variant="destructive" pendingText="Đang hủy…">Hủy đơn</SubmitButton>
            </form>
          )}
          {order.status === "cancelled" && (
            <form action={updateOrderStatus.bind(null, order.id, "new")}>
              <SubmitButton variant="outline" pendingText="…">Mở lại đơn</SubmitButton>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="flex flex-col gap-4">
          <h2 className="font-medium">Sản phẩm cần làm</h2>
          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-foreground/10">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-medium">
                    {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </div>

                {item.custom_message ? (
                  <blockquote className="rounded-lg bg-muted/60 p-4 text-lg leading-relaxed whitespace-pre-wrap">
                    {item.custom_message}
                  </blockquote>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có lời nhắn (postcard in sẵn).</p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                  {item.proof_image_url && (
                    <Image
                      src={item.proof_image_url}
                      alt="Ảnh thiệp đã viết"
                      width={160}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <form action={uploadProof.bind(null, order.id, item.id)} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <Input type="file" name="proof" accept="image/*" required className="flex-1" />
                    <SubmitButton variant="outline" pendingText="Đang tải lên…">
                      {item.proof_image_url ? "Thay ảnh thiệp" : "Tải ảnh thiệp đã viết"}
                    </SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex h-fit flex-col gap-4 rounded-xl bg-muted/40 p-5 text-sm ring-1 ring-foreground/10">
          <div>
            <h2 className="mb-1 font-medium">Khách hàng</h2>
            <p>
              {order.customer_name}
              <br />
              <a href={`tel:${order.phone}`} className="underline underline-offset-4">{order.phone}</a>
              <br />
              {order.address}
            </p>
            {order.note && <p className="mt-2 text-muted-foreground">Ghi chú: {order.note}</p>}
          </div>

          <div className="flex flex-col gap-1 border-t pt-3">
            <div className="flex justify-between"><span>Tạm tính</span><span className="tabular-nums">{formatPrice(order.total - order.shipping_fee)}</span></div>
            <div className="flex justify-between"><span>Phí ship</span><span className="tabular-nums">{formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between font-semibold"><span>Tổng</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
            <p className="text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
          </div>

          <form action={updateTracking.bind(null, order.id)} className="flex flex-col gap-2 border-t pt-3">
            <label htmlFor="tracking_code" className="font-medium">Mã vận đơn</label>
            <div className="flex gap-2">
              <Input id="tracking_code" name="tracking_code" defaultValue={order.tracking_code ?? ""} placeholder="VD: GHN123456" />
              <SubmitButton variant="outline" pendingText="…">Lưu</SubmitButton>
            </div>
          </form>

          <Button variant="link" size="sm" className="self-start px-0" render={<Link href={`/don-hang/${order.code}`} target="_blank" />}>
            Xem trang khách thấy ↗
          </Button>
        </aside>
      </div>
    </>
  );
}
