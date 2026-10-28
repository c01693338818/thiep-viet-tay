"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupOrder } from "@/app/actions/orders";

export function OrderLookupForm() {
  const [state, action, pending] = useActionState(lookupOrder, null);

  return (
    <form action={action} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Mã đơn</Label>
        <Input id="code" name="code" required placeholder="TH-261028-AB3K" className="font-mono uppercase" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Số điện thoại đặt hàng</Label>
        <Input id="phone" name="phone" type="tel" required inputMode="numeric" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Đang tìm…" : "Tra cứu"}
      </Button>
    </form>
  );
}
