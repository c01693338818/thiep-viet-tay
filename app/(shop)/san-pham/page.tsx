import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductGrid, ProductGridSkeleton } from "@/components/shop/product-card";
import { getProducts } from "@/lib/products";
import { PRODUCT_TYPE_LABEL, type ProductType } from "@/lib/types";
import { cn } from "cn";

export const metadata: Metadata = { title: "Sản phẩm" };

const filters: { value: ProductType | undefined; label: string; href: string }[] = [
  { value: undefined, label: "Tất cả", href: "/san-pham" },
  { value: "postcard", label: PRODUCT_TYPE_LABEL.postcard, href: "/san-pham?type=postcard" },
  { value: "handwritten", label: PRODUCT_TYPE_LABEL.handwritten, href: "/san-pham?type=handwritten" },
];

function parseType(raw: string | string[] | undefined): ProductType | undefined {
  return raw === "postcard" || raw === "handwritten" ? raw : undefined;
}

export default function ProductsPage(props: PageProps<"/san-pham">) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <h1 className="text-2xl font-semibold">Sản phẩm</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/san-pham">, "searchParams">) {
  const type = parseType((await searchParams).type);
  const products = await getProducts(type);

  return (
    <>
      <nav className="flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition",
              f.value === type
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <ProductGrid products={products} />
    </>
  );
}
