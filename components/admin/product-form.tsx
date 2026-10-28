"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveProduct } from "@/app/actions/admin";
import { PRODUCT_TYPE_LABEL, type Product, type ProductType } from "@/lib/types";

export function ProductForm({ product }: { product: Product | null }) {
  const [state, action, pending] = useActionState(saveProduct, null);

  return (
    <form action={action} className="grid max-w-2xl gap-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {product?.image_url && <input type="hidden" name="image_url" value={product.image_url} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên sản phẩm" htmlFor="name">
          <Input id="name" name="name" required defaultValue={product?.name ?? ""} />
        </Field>
        <Field label="Slug (đường dẫn)" htmlFor="slug" hint="Để trống sẽ tự tạo từ tên">
          <Input id="slug" name="slug" defaultValue={product?.slug ?? ""} className="font-mono" placeholder="thiep-sinh-nhat-viet-tay" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loại" htmlFor="type">
          <select
            id="type"
            name="type"
            defaultValue={product?.type ?? "handwritten"}
            className="h-8 rounded-lg border bg-background px-2.5 text-sm"
          >
            {(Object.keys(PRODUCT_TYPE_LABEL) as ProductType[]).map((t) => (
              <option key={t} value={t}>{PRODUCT_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </Field>
        <Field label="Giá (VND)" htmlFor="price">
          <Input id="price" name="price" type="number" min={0} step={1000} required defaultValue={product?.price ?? ""} />
        </Field>
        <Field label="Thứ tự hiển thị" htmlFor="sort_order">
          <Input id="sort_order" name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} />
        </Field>
      </div>

      <Field label="Mô tả" htmlFor="description">
        <Textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ""} />
      </Field>

      <Field label="Ảnh sản phẩm" htmlFor="image" hint="Tỉ lệ 4:5 (VD 800×1000), tối đa 5MB">
        <div className="flex items-start gap-4">
          {product?.image_url && (
            <Image src={product.image_url} alt="" width={96} height={120} className="rounded-lg object-cover" />
          )}
          <Input id="image" name="image" type="file" accept="image/*" />
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="size-4" />
        Đang bán (hiện trên shop)
      </label>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
