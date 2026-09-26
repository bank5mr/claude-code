-- 토스 결제위젯용 customerKey.
-- 토스 문서: 회원 ID처럼 추측 가능한 값 대신 충분히 무작위한 값을 쓰라고 해서 별도 키를 둔다.
alter table public.profiles
  add column customer_key uuid not null default gen_random_uuid() unique;
