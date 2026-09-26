"use client";

import { useId, useState } from "react";
import { CATEGORIES } from "@/lib/types";
import { useToast } from "@/components/Toast";

const MAX_PREVIEWS = 3;

// 자료 등록 폼 (1단계 목업: 검증만, 저장은 6단계)
export function ProductForm() {
  const id = useId();
  const f = (name: string) => `${id}-${name}`;
  const toast = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function err(name: string) {
    return errors[name] ? (
      <p id={`${f(name)}-err`} className="field-error">
        {errors[name]}
      </p>
    ) : null;
  }
  function aria(name: string) {
    return {
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${f(name)}-err` : undefined,
    };
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const next: Record<string, string> = {};
        if (!String(fd.get("title") ?? "").trim()) next.title = "제목이 비어 있어. 자료 이름을 적어 줘.";
        const price = Number(fd.get("price"));
        if (!Number.isInteger(price) || price <= 0) next.price = "가격은 1원 이상 정수로 적어 줘.";
        const pages = Number(fd.get("pages"));
        if (!Number.isInteger(pages) || pages <= 0) next.pages = "쪽수는 1 이상 정수로 적어 줘.";
        const pdf = fd.get("pdf");
        if (!(pdf instanceof File) || pdf.size === 0) next.pdf = "PDF 파일이 없어. 판매할 PDF를 골라 줘.";
        const previews = fd.getAll("previews").filter((v) => v instanceof File && v.size > 0);
        if (previews.length === 0) next.previews = "미리보기 이미지가 없어. 1장 이상 골라 줘.";
        if (previews.length > MAX_PREVIEWS) next.previews = `미리보기는 ${MAX_PREVIEWS}장까지야. 몇 장 빼 줘.`;
        setErrors(next);
        if (Object.keys(next).length === 0) toast.show("목업이라 저장은 6단계에서 연결돼.");
      }}
      className="grid gap-x-6 gap-y-5 sm:grid-cols-2"
    >
      <div>
        <label htmlFor={f("title")} className="field-label">제목</label>
        <input id={f("title")} name="title" className="input" {...aria("title")} />
        {err("title")}
      </div>
      <div>
        <label htmlFor={f("category")} className="field-label">분류</label>
        <select id={f("category")} name="category" className="input" defaultValue={CATEGORIES[0]}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={f("price")} className="field-label">가격 (원)</label>
        <input id={f("price")} name="price" type="number" inputMode="numeric" min={1} step={1} className="input" {...aria("price")} />
        {err("price")}
      </div>
      <div>
        <label htmlFor={f("pages")} className="field-label">쪽수</label>
        <input id={f("pages")} name="pages" type="number" inputMode="numeric" min={1} step={1} className="input" {...aria("pages")} />
        {err("pages")}
      </div>
      <div>
        <label htmlFor={f("pdf")} className="field-label">PDF</label>
        <input id={f("pdf")} name="pdf" type="file" accept="application/pdf" className="input file-input" {...aria("pdf")} />
        {err("pdf")}
      </div>
      <div>
        <label htmlFor={f("previews")} className="field-label">미리보기 이미지 (최대 3장)</label>
        <input
          id={f("previews")}
          name="previews"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="input file-input"
          {...aria("previews")}
        />
        {err("previews")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={f("description")} className="field-label">설명</label>
        <textarea id={f("description")} name="description" rows={4} className="input resize-y" />
      </div>
      <label className="flex min-h-10 cursor-pointer items-center gap-3 sm:col-span-2">
        <input type="checkbox" name="is_published" className="size-[18px] accent-[var(--grid)]" defaultChecked />
        <span>공개</span>
      </label>
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary">등록하기</button>
      </div>
    </form>
  );
}
