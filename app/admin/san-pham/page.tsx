import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubmitButton } from "@/components/admin/submit-button";
import { toggleProductActive } from "@/app/actions/admin";
import { listAllProducts } from "@/lib/admin-data";
import { getAdminUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { PRODUCT_TYPE_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sản phẩm</h1>
        <Button render={<Link href="/admin/san-pham/new" />}>Thêm sản phẩm</Button>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải…</p>}>
        <Products />
      </Suspense>
    </div>
  );
}

async function Products() {
  await getAdminUser();
  const products = await listAllProducts();

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14"></TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Giá</TableHead>
            <TableHead className="text-right">Thứ tự</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} className={p.is_active ? "" : "opacity-60"}>
              <TableCell>
                {p.image_url && (
                  <Image src={p.image_url} alt="" width={40} height={50} className="rounded object-cover" />
                )}
              </TableCell>
              <TableCell>
                <Link href={`/admin/san-pham/${p.id}`} className="font-medium underline-offset-4 hover:underline">
                  {p.name}
                </Link>
                <span className="block font-mono text-xs text-muted-foreground">{p.slug}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{PRODUCT_TYPE_LABEL[p.type]}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPrice(p.price)}</TableCell>
              <TableCell className="text-right tabular-nums">{p.sort_order}</TableCell>
              <TableCell>
                <Badge variant={p.is_active ? "secondary" : "outline"}>{p.is_active ? "Đang bán" : "Ẩn"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <form action={toggleProductActive.bind(null, p.id, !p.is_active)}>
                  <SubmitButton variant="ghost" size="sm" pendingText="…">
                    {p.is_active ? "Ẩn" : "Hiện"}
                  </SubmitButton>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
