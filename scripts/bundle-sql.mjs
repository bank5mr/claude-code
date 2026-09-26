// supabase/migrations/*.sql + seed.sql → supabase/setup_all.sql
// 클라우드 SQL Editor에 한 번에 붙여 넣기 위한 파일을 만든다. (npm run db:bundle)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = "supabase/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const parts = [
  "-- 자동 생성 파일: npm run db:bundle (직접 고치지 말 것)",
  "-- 새 Supabase 프로젝트의 SQL Editor에 전체를 붙여 넣고 Run 한 번이면 끝.",
  "",
  ...files.map((f) => `-- ===== ${f} =====\n${readFileSync(`${dir}/${f}`, "utf8")}`),
  `-- ===== seed.sql (개발용 자료 6개) =====\n${readFileSync("supabase/seed.sql", "utf8")}`,
];
writeFileSync("supabase/setup_all.sql", parts.join("\n"));
console.log(`supabase/setup_all.sql (${files.length} migrations + seed)`);
