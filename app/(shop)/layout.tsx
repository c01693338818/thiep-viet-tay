import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4">{children}</div>
      <SiteFooter />
    </>
  );
}
