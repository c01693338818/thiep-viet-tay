import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/shop/order-lookup-form";

export const metadata: Metadata = { title: "Tra cứu đơn hàng" };

export default function LookupPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Tra cứu đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Nhập mã đơn (dạng TH-…) và số điện thoại bạn dùng khi đặt.
        </p>
      </div>
      <OrderLookupForm />
    </div>
  );
}
