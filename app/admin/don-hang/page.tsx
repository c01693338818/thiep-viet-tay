import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { countOrdersByStatus, listOrders } from "@/lib/admin-data";
import { getAdminUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { cn } from "cn";

export const metadata: Metadata = { title: "Đơn hàng" };

const STATUS_ORDER: OrderStatus[] = ["new", "confirmed", "writing", "shipped", "done", "cancelled"];

function parseStatus(raw: string | string[] | undefined): OrderStatus | undefined {
  return typeof raw === "string" && (STATUS_ORDER as string[]).includes(raw) ? (raw as OrderStatus) : undefined;
}

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/don-hang">) {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Đơn hàng</h1>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải…</p>}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin/don-hang">, "searchParams">) {
  await getAdminUser();
  const status = parseStatus((await searchParams).status);
  const [orders, counts] = await Promise.all([listOrders(status), countOrdersByStatus()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <nav className="flex flex-wrap gap-2 text-sm">
        <FilterChip href="/admin/don-hang" active={!status}>
          Tất cả ({total})
        </FilterChip>
        {STATUS_ORDER.map((s) => (
          <FilterChip key={s} href={`/admin/don-hang?status=${s}`} active={status === s}>
            {ORDER_STATUS_LABEL[s]} ({counts[s] ?? 0})
          </FilterChip>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Chưa có đơn nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Tổng</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link href={`/admin/don-hang/${o.id}`} className="font-mono font-medium underline-offset-4 hover:underline">
                      {o.code}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                  <TableCell>
                    {o.customer_name}
                    <span className="block text-xs text-muted-foreground">{o.phone}</span>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(o.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{o.payment_method === "cod" ? "COD" : "CK"}</TableCell>
                  <TableCell>
                    <Badge variant={o.status === "cancelled" ? "destructive" : o.status === "done" ? "outline" : "secondary"}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3 py-1 transition",
        active ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
