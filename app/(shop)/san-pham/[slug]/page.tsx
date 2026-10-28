import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCart } from "@/components/shop/add-to-cart";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getProducts } from "@/lib/products";
import { PRODUCT_TYPE_LABEL } from "@/lib/types";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: product.image_url ? { images: [product.image_url] } : undefined,
  };
}

export default function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  return (
    <div className="py-8">
      <Link
        href="/san-pham"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Sản phẩm
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: Pick<PageProps<"/san-pham/[slug]">, "params">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Badge variant="secondary">{PRODUCT_TYPE_LABEL[product.type]}</Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
          <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
        </div>
        {product.description && (
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        )}
        <AddToCart product={product} />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12">
      <div className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-20 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
