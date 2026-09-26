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
