-- 자동 생성 파일: npm run db:bundle (직접 고치지 말 것)
-- 새 Supabase 프로젝트의 SQL Editor에 전체를 붙여 넣고 Run 한 번이면 끝.

-- ===== 20260926000001_schema.sql =====
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

-- ===== 20260926000002_storage.sql =====
-- ─────────────────────────────────────────────────────────────
-- Storage 버킷
--  previews : 공개. 미리보기 이미지 (png/jpeg/webp, 5MB)
--  files    : 비공개. 판매용 PDF (50MB). 다운로드는 서버가 60초 signed URL로만
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('previews', 'previews', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('files', 'files', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

-- 공개 버킷은 URL로 누구나 읽을 수 있으므로 select 정책을 두지 않는다
-- (select 정책을 열면 목록 조회까지 허용되기 때문)

-- previews: 관리자만 올리기/바꾸기/지우기
create policy "previews: 관리자 업로드"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'previews' and (select public.is_admin()));

create policy "previews: 관리자 수정"
  on storage.objects for update to authenticated
  using (bucket_id = 'previews' and (select public.is_admin()))
  with check (bucket_id = 'previews' and (select public.is_admin()));

create policy "previews: 관리자 삭제"
  on storage.objects for delete to authenticated
  using (bucket_id = 'previews' and (select public.is_admin()));

-- files: 관리자만 올리기/바꾸기/지우기. 일반 사용자에겐 select 정책이 없으므로
-- 브라우저에서 직접 받을 방법이 없다 (서버의 signed URL로만 가능)
create policy "files: 관리자 업로드"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'files' and (select public.is_admin()));

create policy "files: 관리자 수정"
  on storage.objects for update to authenticated
  using (bucket_id = 'files' and (select public.is_admin()))
  with check (bucket_id = 'files' and (select public.is_admin()));

create policy "files: 관리자 삭제"
  on storage.objects for delete to authenticated
  using (bucket_id = 'files' and (select public.is_admin()));

-- 업로드 시 upsert를 쓰려면 select도 필요하다 (관리자 한정)
create policy "files: 관리자 읽기"
  on storage.objects for select to authenticated
  using (bucket_id in ('files', 'previews') and (select public.is_admin()));

-- ===== 20260926000003_profiles_trigger.sql =====
-- ─────────────────────────────────────────────────────────────
-- 가입하면 profiles 행을 자동으로 만든다
-- 이름: 구글 로그인이면 full_name/name, 이메일 로그인이면 비워 둔다
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 트리거 전용 함수라 API로 호출할 수 없게 막는다
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 이 마이그레이션 전에 가입한 사용자도 프로필을 채운다
insert into public.profiles (id, name)
select u.id, nullif(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'), '')
from auth.users u
on conflict (id) do nothing;

-- ===== 20260926000004_customer_key.sql =====
-- 토스 결제위젯용 customerKey.
-- 토스 문서: 회원 ID처럼 추측 가능한 값 대신 충분히 무작위한 값을 쓰라고 해서 별도 키를 둔다.
alter table public.profiles
  add column customer_key uuid not null default gen_random_uuid() unique;

-- ===== seed.sql (개발용 자료 6개) =====
-- 개발용 시드 자료 6개.
-- preview_paths가 '/'로 시작하면 앱의 public 폴더 이미지를 쓴다 (목업 이미지).
-- 실제 자료는 관리자 페이지에서 업로드하면 버킷 경로가 들어간다.
insert into public.products (title, category, description, price, pages, preview_paths, is_published, created_at)
values
  ('현대시 핵심 작품 30선 정리 노트', '문학',
   '교과서와 모의고사에 자주 나오는 현대시 30편을 화자, 정서, 표현법 중심으로 한 쪽씩 정리했어. 작품마다 기출 선지 분석을 붙였어.',
   12500, 18, array['/mock/preview-1.svg', '/mock/preview-2.svg', '/mock/preview-3.svg'], true, now() - interval '1 minute'),
  ('고전소설 인물 관계도와 줄거리 요약', '문학',
   '자주 출제되는 고전소설 12편의 인물 관계도와 장면별 줄거리를 정리했어.',
   9000, 24, array['/mock/preview-2.svg', '/mock/preview-3.svg'], true, now() - interval '2 minutes'),
  ('비문학 독해 구조도 그리기 연습장', '비문학',
   '과학·기술, 인문, 사회 지문을 문단 구조도로 옮기는 연습장이야. 예시 지문 10개와 해설 구조도가 들어 있어.',
   11000, 32, array['/mock/preview-3.svg'], true, now() - interval '3 minutes'),
  ('경제 지문 배경지식 한 장 요약', '비문학',
   '금리, 환율, 보험처럼 경제 지문에 자주 나오는 개념을 그림과 함께 짧게 정리했어.',
   6000, 10, array['/mock/preview-1.svg', '/mock/preview-2.svg'], true, now() - interval '4 minutes'),
  ('음운 변동 규칙 총정리', '문법',
   '교체, 탈락, 첨가, 축약을 표 하나로 묶고 헷갈리는 예외를 따로 모았어.',
   7500, 14, array['/mock/preview-2.svg'], true, now() - interval '5 minutes'),
  ('문장 성분과 안긴문장 판별 노트', '문법',
   '문장 성분부터 안긴문장 종류까지, 기출 예문으로 판별 순서를 연습해.',
   8000, 16, array['/mock/preview-3.svg', '/mock/preview-1.svg'], true, now() - interval '6 minutes');
