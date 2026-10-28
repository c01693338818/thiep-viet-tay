import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./types";

export type CartItem = {
  lineId: string; // productId + lời nhắn → cùng sản phẩm nhưng khác lời nhắn là 2 dòng
  productId: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  type: Product["type"];
  quantity: number;
  customMessage: string;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity: number, customMessage?: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product, quantity, customMessage = "") => {
        const message = customMessage.trim();
        const lineId = `${product.id}|${message}`;
        set((state) => {
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                lineId,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                type: product.type,
                quantity,
                customMessage: message,
              },
            ],
          };
        });
      },

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.lineId !== lineId)
              : state.items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
        })),

      remove: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),

      clear: () => set({ items: [] }),
    }),
    { name: "thiep-cart" }
  )
);

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
