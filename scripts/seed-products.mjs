// Nhập sản phẩm từ supabase/products.json vào bảng products (upsert theo slug).
// Chạy: node scripts/seed-products.mjs
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// Đọc .env.local thủ công để không phụ thuộc thư viện ngoài.
for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");

const products = JSON.parse(readFileSync(resolve(root, "supabase/products.json"), "utf8"));

const res = await fetch(`${url}/rest/v1/products?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(products),
});

if (!res.ok) {
  console.error(`Lỗi ${res.status}:`, await res.text());
  process.exit(1);
}

const rows = await res.json();
console.log(`Đã nhập ${rows.length} sản phẩm:`);
for (const r of rows) console.log(`  - ${r.name} (${r.type}, ${r.price.toLocaleString("vi-VN")}đ)`);
