import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BankTransferInfo } from "@/components/shop/bank-transfer-info";
import { formatPrice } from "@/lib/format";
import { getOrderByCode } from "@/lib/orders";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Đơn hàng", robots: { index: false } };

export default function OrderPage({ params }: PageProps<"/don-hang/[code]">) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Suspense fallback={<p className="py-16 text-center text-muted-foreground">Đang tải đơn…</p>}>
        <OrderDetail params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/don-hang/[code]">, "params">) {
  const order = await getOrderByCode((await params).code);
  if (!order) notFound();

  const subtotal = order.total - order.shipping_fee;
  const isNew = order.status === "new";

  return (
    <>
      <div className="flex flex-col gap-2">
        {isNew && <p className="text-sm text-muted-foreground">Cảm ơn bạn đã đặt hàng!</p>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">
            Đơn <span className="font-mono">{order.code}</span>
          </h1>
          <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Lưu lại mã đơn để tra cứu tại{" "}
          <Link href="/tra-cuu" className="underline underline-offset-4">
            /tra-cuu
          </Link>
          .
        </p>
      </div>

      {order.payment_method === "bank_transfer" && (isNew || order.status === "confirmed") && (
        <BankTransferInfo amount={order.total} code={order.code} />
      )}
      {order.payment_method === "cod" && isNew && (
        <div className="rounded-xl bg-muted/50 p-5 text-sm ring-1 ring-foreground/10">
          <p className="font-medium">Thanh toán khi nhận hàng</p>
          <p className="mt-1 text-muted-foreground">
            Vui lòng chuẩn bị <strong>{formatPrice(order.total)}</strong> tiền mặt khi nhận hàng.
            Chúng mình sẽ gọi xác nhận trước khi viết thiệp.
          </p>
        </div>
      )}
      {order.tracking_code && (
        <p className="text-sm">
          Mã vận đơn: <span className="font-mono font-medium">{order.tracking_code}</span>
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        <section className="flex flex-col gap-3">
          <h2 className="font-medium">Sản phẩm</h2>
          <ul className="divide-y rounded-xl ring-1 ring-foreground/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    {item.product_name} <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </div>
                {item.custom_message && (
                  <p className="text-sm text-muted-foreground italic">“{item.custom_message}”</p>
                )}
                {item.proof_image_url && (
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">Thiệp đã viết:</p>
                    <Image
                      src={item.proof_image_url}
                      alt={`Thiệp đã viết cho ${item.product_name}`}
                      width={480}
                      height={600}
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex h-fit flex-col gap-3 rounded-xl bg-muted/50 p-5 text-sm ring-1 ring-foreground/10">
          <h2 className="font-medium">Giao tới</h2>
          <p>
            {order.customer_name}
            <br />
            {order.phone}
            <br />
            {order.address}
          </p>
          {order.note && <p className="text-muted-foreground">Ghi chú: {order.note}</p>}
          <div className="mt-2 flex flex-col gap-1 border-t pt-3">
            <div className="flex justify-between"><span>Tạm tính</span><span className="tabular-nums">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span>Phí vận chuyển</span><span className="tabular-nums">{formatPrice(order.shipping_fee)}</span></div>
            <div className="flex justify-between text-base font-semibold"><span>Tổng cộng</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method]}</p>
          </div>
        </aside>
      </div>

      <div>
        <Button variant="outline" render={<Link href="/san-pham" />}>
          Tiếp tục mua sắm
        </Button>
      </div>
    </>
  );
}
