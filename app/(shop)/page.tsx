import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/shop/product-card";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <section className="flex flex-col items-start gap-5 py-14 sm:py-20">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Thiệp viết tay, gửi lời bạn muốn nói.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Bạn soạn lời nhắn, chúng mình viết tay bằng bút mực lên thiệp và postcard giấy mỹ
          thuật, rồi gửi tới tận tay người nhận.
        </p>
        <div className="flex gap-3">
          <Button size="lg" render={<Link href="/san-pham?type=handwritten" />}>
            Đặt thiệp viết tay
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/san-pham?type=postcard" />}>
            Xem postcard
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Sản phẩm</h2>
          <Link href="/san-pham" className="text-sm text-muted-foreground hover:text-foreground">
            Xem tất cả
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 8)} />
      </section>
    </>
  );
}
