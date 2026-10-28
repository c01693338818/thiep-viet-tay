import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="max-w-md text-muted-foreground">
        Đường dẫn này không tồn tại hoặc sản phẩm đã ngừng bán.
      </p>
      <div className="flex gap-2">
        <Button render={<Link href="/" />}>Về trang chủ</Button>
        <Button variant="outline" render={<Link href="/san-pham" />}>Xem sản phẩm</Button>
      </div>
    </main>
  );
}
