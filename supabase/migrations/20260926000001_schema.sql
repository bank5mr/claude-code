-- ─────────────────────────────────────────────────────────────
-- 한칸 기본 스키마: profiles / products / orders / order_items
-- 원칙
--  1) 모든 테이블 RLS 켜기
--  2) grant는 필요한 것만 명시적으로 (기본 grant에 기대지 않음)
--  3) 주문 쓰기는 서버(secret key = service_role)만
-- ─────────────────────────────────────────────────────────────

-- ───────── profiles ─────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 현재 로그인 사용자가 관리자인지.
-- RLS 정책 안에서 profiles를 다시 읽으면 재귀가 생기므로 security definer로 우회한다.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ───────── products ─────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  category text not null check (category in ('문학', '비문학', '문법', '화법과 작문')),
  description text not null default '',
  price integer not null check (price > 0),
  pages integer not null check (pages > 0),
  -- 비공개 버킷(files) 안의 PDF 경로. 업로드 전에는 null
  file_path text,
  -- 공개 버킷(previews) 안의 미리보기 이미지 경로, 최대 3장. 첫 장이 썸네일 표지
  preview_paths text[] not null default '{}' check (cardinality(preview_paths) <= 3),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_published_created_idx
  on public.products (is_published, created_at desc);

-- ───────── orders ─────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- 주문 기록은 남겨야 하므로 계정 삭제로 연쇄 삭제하지 않는다
  user_id uuid not null references auth.users (id) on delete restrict,
  -- 토스 orderId (6~64자, 영문/숫자/-/_)
  order_id text not null unique check (order_id ~ '^[A-Za-z0-9_-]{6,64}$'),
  amount integer not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  payment_key text,
  created_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);

-- ───────── order_items ─────────
create table public.order_items (
  order_id uuid not null references public.orders (id) on delete cascade,
  -- 구매 기록이 있는 자료는 지울 수 없게 막는다 (관리자 "삭제"는 숨김으로 처리)
  product_id uuid not null references public.products (id) on delete restrict,
  price_at_purchase integer not null check (price_at_purchase > 0),
  primary key (order_id, product_id)
);

create index order_items_product_idx on public.order_items (product_id);

-- ─────────────────────────────────────────────────────────────
-- Grants: 먼저 전부 회수하고 필요한 것만 준다
-- ─────────────────────────────────────────────────────────────
revoke all on public.profiles, public.products, public.orders, public.order_items
  from anon, authenticated;

-- products: 누구나 읽기, 쓰기는 로그인 사용자에게 열되 RLS에서 관리자만 통과
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- profiles: 본인 것 읽기, 이름만 수정 가능 (is_admin 컬럼은 수정 권한 없음)
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

-- orders / order_items: 읽기만. 쓰기는 service_role(서버)만
grant select on public.orders, public.order_items to authenticated;

-- 서버(secret key)
grant all on public.profiles, public.products, public.orders, public.order_items
  to service_role;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles
create policy "profiles: 본인 읽기"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: 본인 수정"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- products: 공개된 것만 읽기 (관리자는 전부)
create policy "products: 공개 자료 읽기"
  on public.products for select to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "products: 관리자 등록"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));

create policy "products: 관리자 수정"
  on public.products for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products: 관리자 삭제"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

-- orders: 본인 것만 읽기
create policy "orders: 본인 읽기"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

-- order_items: 본인 주문에 속한 것만 읽기
create policy "order_items: 본인 읽기"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );
