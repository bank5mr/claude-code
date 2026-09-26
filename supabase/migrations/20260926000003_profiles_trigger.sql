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
