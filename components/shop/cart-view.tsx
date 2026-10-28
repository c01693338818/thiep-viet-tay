"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  if (!hydrated) {
    return <p className="py-16 text-center text-muted-foreground">Đang tải giỏ hàng…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Giỏ hàng đang trống.</p>
        <Button render={<Link href="/san-pham" />}>Xem sản phẩm</Button>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col divide-y">
        {items.map((item) => (
          <li key={item.lineId} className="flex gap-4 py-4">
            <Link
              href={`/san-pham/${item.slug}`}
              className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              {item.image_url && (
                <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Link href={`/san-pham/${item.slug}`} className="font-medium leading-snug">
                {item.name}
              </Link>
              {item.customMessage && (
                <p className="line-clamp-2 text-xs text-muted-foreground italic">
                  “{item.customMessage}”
                </p>
              )}
              <p className="text-sm">{formatPrice(item.price)}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center rounded-lg border">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Giảm"
                    onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                  >
                    <Minus />
                  </Button>
                  <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Tăng"
                    onClick={() => setQuantity(item.lineId, Math.min(99, item.quantity + 1))}
                  >
                    <Plus />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Xóa"
                  className="text-muted-foreground"
                  onClick={() => remove(item.lineId)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-xl bg-muted/50 p-5 ring-1 ring-foreground/10">
        <h2 className="mb-4 font-medium">Tóm tắt</h2>
        <div className="flex justify-between text-sm">
          <span>Tạm tính</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Phí vận chuyển tính ở bước thanh toán.</p>
        <Button size="lg" className="mt-5 w-full" render={<Link href="/thanh-toan" />}>
          Tiến hành đặt hàng
        </Button>
      </aside>
    </div>
  );
}
