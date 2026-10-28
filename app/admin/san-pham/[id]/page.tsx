import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { getProductById } from "@/lib/admin-data";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

export default function AdminProductPage({ params }: PageProps<"/admin/san-pham/[id]">) {
  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/san-pham" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Sản phẩm
      </Link>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải…</p>}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

async function Editor({ params }: Pick<PageProps<"/admin/san-pham/[id]">, "params">) {
  await getAdminUser();
  const { id } = await params;

  if (id === "new") {
    return (
      <>
        <h1 className="text-xl font-semibold">Thêm sản phẩm</h1>
        <ProductForm product={null} />
      </>
    );
  }

  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <h1 className="text-xl font-semibold">{product.name}</h1>
      <ProductForm product={product} />
    </>
  );
}
