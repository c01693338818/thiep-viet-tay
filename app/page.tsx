import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">
        {process.env.NEXT_PUBLIC_SHOP_NAME ?? "Thiệp Viết Tay"}
      </h1>
      <p className="max-w-md text-muted-foreground">
        Thiệp viết tay &amp; postcard. Website đang được xây dựng.
      </p>
      <Button>Xem sản phẩm</Button>
    </main>
  );
}
