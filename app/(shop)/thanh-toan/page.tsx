import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Đặt hàng" };

export default function CheckoutPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-semibold">Đặt hàng</h1>
      <CheckoutForm />
    </div>
  );
}
