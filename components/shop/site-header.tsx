import Link from "next/link";
import { CartButton } from "./cart-button";

const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? "Thiệp Viết Tay";

const nav = [
  { href: "/san-pham", label: "Tất cả" },
  { href: "/san-pham?type=postcard", label: "Postcard" },
  { href: "/san-pham?type=handwritten", label: "Thiệp viết tay" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {shopName}
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
