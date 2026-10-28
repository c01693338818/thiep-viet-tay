"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { MAX_MESSAGE_LENGTH, type Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  const needsMessage = product.type === "handwritten";
  const messageMissing = needsMessage && message.trim().length === 0;

  function handleAdd() {
    if (messageMissing) return;
    add(product, quantity, message);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="flex flex-col gap-5">
      {needsMessage && (
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-medium">
            Lời nhắn muốn viết tay
          </label>
          <Textarea
            id="message"
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={4}
            placeholder="VD: Chúc Lan sinh nhật thật vui, luôn rực rỡ như hoa hướng dương. – Minh"
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/{MAX_MESSAGE_LENGTH} ký tự. Chúng mình sẽ viết đúng nội dung này.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Số lượng</span>
        <div className="flex items-center rounded-lg border">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Giảm"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">{quantity}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Tăng"
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button size="lg" className="sm:min-w-44" disabled={messageMissing} onClick={handleAdd}>
          {added ? (
            <>
              <Check /> Đã thêm vào giỏ
            </>
          ) : (
            "Thêm vào giỏ"
          )}
        </Button>
        {added && (
          <Button variant="outline" size="lg" render={<Link href="/gio-hang" />}>
            Xem giỏ hàng
          </Button>
        )}
      </div>
      {messageMissing && (
        <p className="text-xs text-muted-foreground">Nhập lời nhắn để thêm vào giỏ.</p>
      )}
    </div>
  );
}
