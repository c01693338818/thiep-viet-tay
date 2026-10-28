# Thiệp Viết Tay

Website bán thiệp viết tay & postcard. Kế hoạch từng giai đoạn ở [PLAN.md](./PLAN.md).

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- Supabase (Postgres, Storage, Auth)
- Vercel (deploy)

## Chạy local

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file env
copy .env.example .env.local
# rồi điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Chạy dev server
npm run dev
```

Mở http://localhost:3000.

## Lệnh khác

```bash
npm run build   # build production, chạy trước khi push để chắc không lỗi
npm run lint
npx shadcn@latest add <component>   # thêm component UI
```

## Deploy

Vercel kết nối với repo GitHub; mỗi lần push lên `main` sẽ tự deploy.
Env vars được khai báo trong Vercel → Project → Settings → Environment Variables (cùng tên với `.env.example`).
