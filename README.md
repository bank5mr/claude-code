# 한칸

직접 만든 국어 학습 자료(PDF)를 판매하는 사이트.

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Auth, Postgres, Storage) — 2단계부터
- 토스페이먼츠 결제위젯 — 4단계부터

## 로컬 실행

### A. 로컬 Supabase로 (Docker 필요)

```bash
npm install
npm run db:start          # 마이그레이션 + 시드까지 자동 적용
cp .env.example .env.local
# db:start가 출력한 API_URL, PUBLISHABLE_KEY, SECRET_KEY를 .env.local에 넣기
npm run dev               # http://localhost:3000
```

스키마를 처음부터 다시 만들려면 `npm run db:reset`.

### B. 클라우드 Supabase 프로젝트로

1. 대시보드 SQL Editor에서 `supabase/migrations/` 파일을 이름 순서대로 실행
2. 개발용 자료가 필요하면 `supabase/seed.sql`도 실행
3. `.env.local`에 프로젝트 URL, publishable key, secret key 입력
4. `npm run dev`

## 관리자 지정

로그인을 한 번 한 뒤 SQL Editor에서:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = '내이메일@example.com');
```

## 폴더

- `supabase/migrations/` 스키마, RLS, Storage 버킷
- `supabase/seed.sql` 개발용 자료 6개
- `supabase/templates/` 로그인 메일 템플릿 (클라우드는 대시보드에 붙여 넣기)
- `src/lib/supabase/` Supabase 클라이언트 (server / client / admin)

## 진행 상황

- [x] 1단계: 프로젝트, 디자인 토큰, 레이아웃, 정적 목업 페이지
- [x] 2단계: Supabase 연결, 마이그레이션, RLS, 시드
- [x] 3단계: 로그인
- [ ] 4단계: 장바구니 + 토스 테스트 결제
- [ ] 5단계: 내 자료 + signed URL 다운로드
- [ ] 6단계: 관리자
- [ ] 7단계: 법적 페이지, 상태 문구, 로딩 정리
- [ ] 8단계: Vercel 배포 가이드
