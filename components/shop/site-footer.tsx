import Link from "next/link";

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "Thiệp Viết Tay";
// Tính một lần lúc build; tránh gọi new Date() trong render (Cache Components không cho).
const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} {shopName}</p>
        <nav className="flex gap-4">
          <Link href="/san-pham" className="hover:text-foreground">Sản phẩm</Link>
          <Link href="/tra-cuu" className="hover:text-foreground">Tra cứu đơn</Link>
          <Link href="/chinh-sach" className="hover:text-foreground">Chính sách</Link>
        </nav>
      </div>
    </footer>
  );
}
