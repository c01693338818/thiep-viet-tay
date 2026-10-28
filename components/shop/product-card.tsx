import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { PRODUCT_TYPE_LABEL, type Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex flex-col gap-3 rounded-xl ring-1 ring-foreground/10 transition hover:ring-foreground/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-xl bg-muted">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-3 pb-3">
        <Badge variant="secondary">{PRODUCT_TYPE_LABEL[product.type]}</Badge>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</h3>
        <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Chưa có sản phẩm nào.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl ring-1 ring-foreground/10">
          <div className="aspect-[4/5] animate-pulse rounded-t-xl bg-muted" />
          <div className="flex flex-col gap-2 px-3 pb-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
