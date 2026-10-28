# Kế hoạch website bán thiệp viết tay & postcard

Nguyên tắc: **đơn giản nhất có thể chạy được**. Mỗi giai đoạn có tiêu chí "xong" rõ ràng, làm xong giai đoạn này mới sang giai đoạn sau.

## Stack (toàn bộ miễn phí)

| Thành phần | Chọn | Lý do |
|---|---|---|
| Frontend + backend | Next.js (App Router) + TypeScript + Tailwind | Một codebase, deploy free |
| Database + ảnh + auth | Supabase (free tier) | Postgres + Storage + Auth, đủ cho vài trăm đơn/tháng |
| Deploy | Vercel (Hobby, free) | Kết nối GitHub là tự deploy |
| Domain | Dùng `*.vercel.app` trước, mua domain sau | Chưa cần tốn tiền |
| Thanh toán | **Không tích hợp cổng**. Chuyển khoản qua ảnh QR tĩnh + COD | Đối soát tay, đủ cho giai đoạn đầu |
| Thông báo đơn mới | Email qua Resend (free 3.000 mail/tháng) | Đơn giản hơn Zalo |

---

## Giai đoạn 0 — Chốt phạm vi

Mục tiêu: viết ra giấy trước khi code.

- [ ] Liệt kê sản phẩm ban đầu (gợi ý 5–10 mẫu): tên, giá, kích thước, ảnh
- [ ] Chốt luồng thiệp viết tay:
  1. Khách chọn mẫu → nhập lời nhắn (giới hạn ~200 ký tự)
  2. Khách đặt hàng → chọn COD hoặc chuyển khoản
  3. Bạn viết thiệp → chụp ảnh → gửi hàng
- [ ] Chốt phí ship: bảng giá cố định (VD nội thành 20k, ngoại thành 30k, toàn quốc 35k)
- [ ] Chuẩn bị ảnh QR chuyển khoản (VietQR tạo tại vietqr.io) và số tài khoản
- [ ] Chuẩn bị tên shop, logo (có thể làm bằng Canva)

**Xong khi**: có file `products.json` nháp với danh sách sản phẩm + 1 ảnh QR.

---

## Giai đoạn 1 — Khởi tạo dự án

Mục tiêu: có trang "Hello" chạy trên Vercel.

- [x] Tạo repo GitHub: https://github.com/c01693338818/thiep-viet-tay
- [x] `npx create-next-app@latest thiep-viet-tay --typescript --tailwind --app --eslint`
- [x] Cài shadcn/ui: `npx shadcn@latest init`, thêm `button`, `card`, `input`, `textarea`, `select`, `badge`, `table`
- [ ] Tạo project Supabase → lấy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Tạo `.env.example` (đã commit) và `.env.local` (đã điền key Supabase)
- [x] Kết nối repo với Vercel, deploy: https://thiep-viet-tay.vercel.app (đã thêm env vars Supabase)
- [x] Thêm `README.md` ghi cách chạy local

**Xong khi**: mở `https://<tên>.vercel.app` thấy trang chủ, push code là tự deploy lại.

---

## Giai đoạn 2 — Database

Mục tiêu: schema tối giản, chạy migration trên Supabase.

```sql
-- products
id uuid pk, slug text unique, name text, description text,
price int (VND), image_url text, type text ('postcard' | 'handwritten'),
is_active bool default true, sort_order int, created_at timestamptz

-- orders
id uuid pk, code text unique (VD: TH-240101-001),
customer_name text, phone text, address text, note text,
shipping_fee int, total int,
payment_method text ('cod' | 'bank_transfer'),
status text ('new' | 'confirmed' | 'writing' | 'shipped' | 'done' | 'cancelled'),
tracking_code text, created_at timestamptz

-- order_items
id uuid pk, order_id uuid fk, product_id uuid fk,
product_name text, price int, quantity int,
custom_message text, proof_image_url text
```

- [x] Tạo 3 bảng trên qua SQL Editor của Supabase (SQL ở `supabase/schema.sql`)
- [x] Bật RLS: `products` ai cũng đọc được; `orders` / `order_items` chỉ service role ghi/đọc
- [x] Tạo bucket Storage `products` (public) và `proofs` (public)
- [x] Nhập 8 sản phẩm mẫu từ `supabase/products.json` (`node scripts/seed-products.mjs`) — ảnh đang là placeholder, [ ] thay ảnh thật sau
- [x] `lib/supabase/client.ts` (anon, browser) và `lib/supabase/server.ts` (anon + service role, server)

**Xong khi**: query `select * from products` trả về sản phẩm có ảnh hiển thị được.

---

## Giai đoạn 3 — Trang bán hàng (khách xem)

Mục tiêu: khách xem và chọn được sản phẩm.

- [x] Layout chung `app/(shop)/layout.tsx`: header (logo, nav, nút giỏ hàng), footer
- [x] Trang chủ `/`: banner + lưới 8 sản phẩm
- [x] Trang danh mục `/san-pham?type=`: lọc postcard / thiệp viết tay
- [x] Trang chi tiết `/san-pham/[slug]`:
  - Ảnh lớn, tên, giá, mô tả
  - Nếu `type = handwritten`: ô nhập lời nhắn (đếm ký tự, tối đa 200, bắt buộc)
  - Chọn số lượng, nút "Thêm vào giỏ"
- [x] Giỏ hàng lưu `localStorage` bằng Zustand (`lib/cart.ts`, key `thiep-cart`)
- [x] Trang `/gio-hang`: danh sách, sửa số lượng, xóa, tạm tính, nút sang `/thanh-toan`
- [ ] Responsive: bạn mở https://thiep-viet-tay.vercel.app trên điện thoại kiểm tra

Ghi chú kỹ thuật: sản phẩm được cache 1 giờ (`"use cache"` + `cacheTag("products")`); admin sửa sản phẩm ở giai đoạn 5 sẽ gọi `revalidateTag("products")`.

**Xong khi**: thêm 2 sản phẩm vào giỏ, tắt trình duyệt mở lại giỏ vẫn còn.

---

## Giai đoạn 4 — Đặt hàng (không cổng thanh toán)

Mục tiêu: khách đặt được đơn, bạn nhận được thông báo.

- [x] Trang `/thanh-toan`: form họ tên, SĐT, địa chỉ, ghi chú; chọn vùng ship (`lib/shipping.ts`, 3 mức phí); chọn COD / chuyển khoản
- [x] Validate bằng `zod` (SĐT 10 số, địa chỉ ≥ 10 ký tự, thiệp viết tay phải có lời nhắn)
- [x] Server Action `createOrder` (`app/actions/orders.ts`): mã đơn `TH-YYMMDD-XXXX`, giá lấy lại từ DB, ghi `orders` + `order_items`, xóa giỏ
- [x] Trang `/don-hang/[code]`:
  - Mã đơn, trạng thái, sản phẩm + lời nhắn, tổng tiền, địa chỉ
  - Chuyển khoản: QR động VietQR (đúng số tiền + nội dung = mã đơn) — [ ] **cần điền `NEXT_PUBLIC_BANK_ID/ACCOUNT/HOLDER`** vào `.env.local` và Vercel
  - COD: hướng dẫn chuẩn bị tiền mặt
- [ ] Gửi email cho bạn khi có đơn mới (Resend) — **để sau**, cần `RESEND_API_KEY` + `ORDER_NOTIFY_EMAIL`
- [x] Trang `/tra-cuu`: mã đơn + SĐT → chuyển sang `/don-hang/[code]`

**Xong khi**: tự đặt 1 đơn thử trên bản deploy, tra cứu ra đơn. (Email bổ sung sau.)

---

## Giai đoạn 5 — Admin xử lý đơn

Mục tiêu: bạn quản lý đơn trên web thay vì vào Supabase.

- [ ] Supabase Auth: tạo 1 tài khoản admin bằng email/password (tắt đăng ký công khai)
- [ ] Middleware chặn `/admin/*` nếu chưa đăng nhập
- [ ] `/admin/don-hang`: bảng đơn, lọc theo trạng thái, mới nhất lên đầu
- [ ] `/admin/don-hang/[id]`:
  - Thông tin khách, sản phẩm, **lời nhắn in to dễ đọc để viết**
  - Nút đổi trạng thái theo thứ tự: new → confirmed → writing → shipped → done
  - Upload ảnh thiệp đã viết (bucket `proofs`) → lưu `proof_image_url`
  - Nhập mã vận đơn
- [ ] `/admin/san-pham`: thêm/sửa/ẩn sản phẩm, upload ảnh
- [ ] Trang tra cứu của khách hiển thị ảnh thiệp khi có `proof_image_url`

**Xong khi**: xử lý 1 đơn từ `new` đến `done` hoàn toàn trên `/admin`, khách tra cứu thấy ảnh thiệp.

---

## Giai đoạn 6 — Nội dung & hoàn thiện

Mục tiêu: trang trông đáng tin, share lên Facebook/Zalo đẹp.

- [ ] Chụp lại ảnh sản phẩm thật, nền sáng, cùng tỉ lệ (gợi ý 4:5)
- [ ] Trang `/gioi-thieu`, `/chinh-sach` (giao hàng, đổi trả, bảo mật)
- [ ] Metadata: title, description, Open Graph image cho từng trang sản phẩm
- [ ] `sitemap.xml`, `robots.txt` (Next.js hỗ trợ sẵn)
- [ ] Favicon, trang 404
- [ ] Google Analytics hoặc Vercel Analytics (free)
- [ ] Kiểm tra Lighthouse trên mobile > 80 điểm

**Xong khi**: paste link vào Zalo/Messenger hiện ảnh + tiêu đề đúng.

---

## Giai đoạn 7 — Ra mắt

- [ ] Nhờ 3–5 người đặt thử, ghi lại chỗ họ bị vướng
- [ ] Sửa lỗi phát hiện
- [ ] (Tùy chọn) Mua domain `.vn` / `.com`, trỏ về Vercel
- [ ] Đăng bài giới thiệu lên Facebook / Instagram / TikTok

---

## Để sau (khi đã có đơn đều)

- Cổng thanh toán tự động (PayOS / VNPay)
- API vận chuyển GHN / GHTK tính phí & tạo vận đơn
- Mã giảm giá
- Khách đăng nhập, xem lịch sử đơn
- Đánh giá sản phẩm
- Thông báo Zalo OA

---

## Cấu trúc thư mục dự kiến

```
thiep-viet-tay/
├── app/
│   ├── (shop)/              # layout khách
│   │   ├── page.tsx
│   │   ├── san-pham/
│   │   ├── gio-hang/
│   │   ├── thanh-toan/
│   │   ├── don-hang/[code]/
│   │   └── tra-cuu/
│   ├── admin/               # layout admin, có middleware
│   │   ├── don-hang/
│   │   └── san-pham/
│   └── login/
├── components/
├── lib/
│   ├── supabase.ts
│   ├── cart.ts
│   └── shipping.ts          # bảng phí ship cố định
├── supabase/
│   └── schema.sql
├── .env.example
└── PLAN.md                  # file này
```
