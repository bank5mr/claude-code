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
