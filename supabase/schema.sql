-- Schema giai đoạn 2. Chạy toàn bộ file này trong Supabase → SQL Editor → Run.
-- Chạy lại nhiều lần an toàn (idempotent).

create extension if not exists "pgcrypto";

-- ---------- products ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  price       integer not null check (price >= 0),          -- VND
  image_url   text,
  type        text not null check (type in ('postcard', 'handwritten')),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,                     -- VD: TH-241028-001
  customer_name   text not null,
  phone           text not null,
  address         text not null,
  note            text,
  shipping_fee    integer not null default 0,
  total           integer not null default 0,
  payment_method  text not null check (payment_method in ('cod', 'bank_transfer')),
  status          text not null default 'new'
                  check (status in ('new', 'confirmed', 'writing', 'shipped', 'done', 'cancelled')),
  tracking_code   text,
  created_at      timestamptz not null default now()
);

create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- ---------- order_items ----------
create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  product_id      uuid references public.products (id) on delete set null,
  product_name    text not null,                            -- snapshot, phòng sản phẩm đổi tên
  price           integer not null,
  quantity        integer not null check (quantity > 0),
  custom_message  text,
  proof_image_url text
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------- RLS ----------
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Ai cũng đọc được sản phẩm đang bán. Ghi/sửa chỉ qua service role (bỏ qua RLS).
drop policy if exists "products: public read active" on public.products;
create policy "products: public read active"
  on public.products for select
  using (is_active = true);

-- orders / order_items: không có policy nào → anon không đọc/ghi được.
-- Mọi thao tác đi qua service role trong Server Actions.

-- ---------- Storage ----------
insert into storage.buckets (id, name, public)
values ('products', 'products', true), ('proofs', 'proofs', true)
on conflict (id) do nothing;

-- Ai cũng xem được ảnh (bucket public). Upload chỉ qua service role.
drop policy if exists "storage: public read products" on storage.objects;
create policy "storage: public read products"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "storage: public read proofs" on storage.objects;
create policy "storage: public read proofs"
  on storage.objects for select
  using (bucket_id = 'proofs');
