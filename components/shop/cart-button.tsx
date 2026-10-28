"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartCount, useCart } from "@/lib/cart";
import { useHydrated } from "@/lib/use-hydrated";

export function CartButton() {
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.items));
  const show = hydrated && count > 0;

  return (
    <Button
      variant="outline"
      size="sm"
      render={<Link href="/gio-hang" aria-label="Giỏ hàng" />}
    >
      <ShoppingBag />
      <span>Giỏ hàng</span>
      {show && (
        <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  );
}
