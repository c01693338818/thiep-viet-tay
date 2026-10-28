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

- [ ] Tạo repo GitHub (private cũng được)
- [ ] `npx create-next-app@latest thiep-viet-tay --typescript --tailwind --app --eslint`
- [ ] Cài shadcn/ui: `npx shadcn@latest init`, thêm `button`, `card`, `input`, `textarea`, `select`, `badge`, `table`
- [ ] Tạo project Supabase → lấy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Tạo `.env.local` (không commit) và `.env.example` (commit)
- [ ] Kết nối repo với Vercel, thêm env vars, deploy
- [ ] Thêm `README.md` ghi cách chạy local

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

- [ ] Tạo 3 bảng trên qua SQL Editor của Supabase (lưu SQL vào `supabase/schema.sql`)
- [ ] Bật RLS: `products` ai cũng đọc được; `orders` / `order_items` chỉ service role ghi/đọc
- [ ] Tạo bucket Storage `products` (public) và `proofs` (public)
- [ ] Nhập 5–10 sản phẩm từ `products.json` giai đoạn 0, upload ảnh
- [ ] Tạo `lib/supabase.ts` với 2 client: anon (client-side) và service (server-side)

**Xong khi**: query `select * from products` trả về sản phẩm có ảnh hiển thị được.

---

## Giai đoạn 3 — Trang bán hàng (khách xem)

Mục tiêu: khách xem và chọn được sản phẩm.

- [ ] Layout chung: header (logo, link giỏ hàng), footer (liên hệ, chính sách)
- [ ] Trang chủ `/`: banner + lưới sản phẩm nổi bật
- [ ] Trang danh mục `/san-pham`: lọc theo `type` (postcard / thiệp viết tay)
- [ ] Trang chi tiết `/san-pham/[slug]`:
  - Ảnh lớn, tên, giá, mô tả
  - Nếu `type = handwritten`: ô nhập lời nhắn (đếm ký tự, tối đa 200)
  - Chọn số lượng, nút "Thêm vào giỏ"
- [ ] Giỏ hàng lưu `localStorage` (không cần đăng nhập), dùng Zustand hoặc React context
- [ ] Trang `/gio-hang`: danh sách, sửa số lượng, xóa, tổng tiền
- [ ] Responsive: kiểm tra trên điện thoại (phần lớn khách dùng mobile)

**Xong khi**: thêm 2 sản phẩm vào giỏ, tắt trình duyệt mở lại giỏ vẫn còn.

---

## Giai đoạn 4 — Đặt hàng (không cổng thanh toán)

Mục tiêu: khách đặt được đơn, bạn nhận được thông báo.

- [ ] Trang `/thanh-toan`: form họ tên, SĐT, địa chỉ, ghi chú; chọn vùng ship (tính phí); chọn COD / chuyển khoản
- [ ] Validate bằng `zod` (SĐT 10 số, địa chỉ không rỗng)
- [ ] Server Action `createOrder`: sinh mã đơn, ghi `orders` + `order_items` bằng service client, xóa giỏ
- [ ] Trang `/don-hang/[code]`:
  - Hiện mã đơn, tổng tiền, trạng thái
  - Nếu chuyển khoản: hiện ảnh QR + số TK + nội dung CK = mã đơn
  - Nếu COD: hướng dẫn chuẩn bị tiền mặt
- [ ] Gửi email cho bạn khi có đơn mới (Resend) — gồm mã đơn, SĐT khách, nội dung lời nhắn
- [ ] Trang tra cứu `/tra-cuu`: nhập mã đơn + SĐT → xem trạng thái

**Xong khi**: tự đặt 1 đơn thử trên bản deploy, nhận được email, tra cứu ra đơn.

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
