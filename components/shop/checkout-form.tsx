"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrder } from "@/app/actions/orders";
import { cartSubtotal, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getShippingFee, SHIPPING_ZONES, type ShippingZoneId } from "@/lib/shipping";
import { PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "cn";

export function CheckoutForm() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [zone, setZone] = useState<ShippingZoneId>("hcm");
  const [payment, setPayment] = useState<PaymentMethod>("bank_transfer");

  if (!hydrated) return <p className="py-16 text-center text-muted-foreground">Đang tải…</p>;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Giỏ hàng đang trống, chưa có gì để đặt.</p>
        <Button render={<Link href="/san-pham" />}>Xem sản phẩm</Button>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const shippingFee = getShippingFee(zone);
  const total = subtotal + shippingFee;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createOrder({
        customer_name: String(form.get("customer_name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""),
        note: String(form.get("note") ?? ""),
        zone,
        payment_method: payment,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          customMessage: i.customMessage,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/don-hang/${result.code}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 font-medium">Thông tin nhận hàng</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer_name">Họ tên người nhận</Label>
              <Input id="customer_name" name="customer_name" required autoComplete="name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" type="tel" required inputMode="numeric" autoComplete="tel" placeholder="0912345678" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" name="address" required autoComplete="street-address" placeholder="Số nhà, đường, phường/xã, quận/huyện" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Khu vực giao hàng</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {SHIPPING_ZONES.map((z) => (
                <ChoiceCard key={z.id} selected={zone === z.id} onSelect={() => setZone(z.id)}>
                  <span>{z.label}</span>
                  <span className="text-xs text-muted-foreground">{formatPrice(z.fee)}</span>
                </ChoiceCard>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Ghi chú (không bắt buộc)</Label>
            <Textarea id="note" name="note" rows={2} placeholder="VD: Giao giờ hành chính, gọi trước khi giao…" />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-medium">Thanh toán</legend>
          {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((m) => (
            <ChoiceCard key={m} selected={payment === m} onSelect={() => setPayment(m)}>
              <span>{PAYMENT_METHOD_LABEL[m]}</span>
              <span className="text-xs text-muted-foreground">
                {m === "bank_transfer"
                  ? "Quét mã QR sau khi đặt, đơn được xử lý ngay khi nhận tiền."
                  : "Trả tiền mặt cho người giao hàng."}
              </span>
            </ChoiceCard>
          ))}
        </fieldset>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-xl bg-muted/50 p-5 ring-1 ring-foreground/10">
        <h2 className="font-medium">Đơn hàng</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((i) => (
            <li key={i.lineId} className="flex justify-between gap-3">
              <span className="min-w-0">
                {i.name} <span className="text-muted-foreground">× {i.quantity}</span>
                {i.customMessage && (
                  <span className="block truncate text-xs text-muted-foreground italic">“{i.customMessage}”</span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 border-t pt-3 text-sm">
          <Row label="Tạm tính" value={formatPrice(subtotal)} />
          <Row label="Phí vận chuyển" value={formatPrice(shippingFee)} />
          <Row label="Tổng cộng" value={formatPrice(total)} bold />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Đang tạo đơn…" : "Đặt hàng"}
        </Button>
        <Link href="/gio-hang" className="text-center text-xs text-muted-foreground hover:text-foreground">
          Sửa giỏ hàng
        </Link>
      </aside>
    </form>
  );
}

function ChoiceCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left text-sm transition",
        selected ? "border-foreground bg-background ring-1 ring-foreground" : "hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "text-base font-semibold")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
