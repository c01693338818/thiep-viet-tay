import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = { title: "Giỏ hàng" };

export default function CartPage() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-semibold">Giỏ hàng</h1>
      <CartView />
    </div>
  );
}
