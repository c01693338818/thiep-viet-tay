import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin/don-hang", label: "Đơn hàng" },
  { href: "/admin/san-pham", label: "Sản phẩm" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b bg-muted/40">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-sm">
          <nav className="flex items-center gap-4">
            <span className="font-semibold">Admin</span>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="text-muted-foreground hover:text-foreground" target="_blank">
              Xem shop ↗
            </Link>
          </nav>
          <Suspense fallback={null}>
            <AdminUserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}

async function AdminUserMenu() {
  const admin = await getAdminUser();
  return (
    <form action={logout} className="flex items-center gap-3">
      <span className="hidden text-muted-foreground sm:inline">{admin.email}</span>
      <Button variant="ghost" size="sm" type="submit">
        Đăng xuất
      </Button>
    </form>
  );
}
