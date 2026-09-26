"use client";

import { useSyncExternalStore } from "react";

// 장바구니: 상품 id 배열만 localStorage에 저장한다.
// 가격은 절대 여기 저장하지 않는다 (결제 금액은 서버가 DB 가격으로 계산).
const KEY = "hankan:cart";
const EMPTY: string[] = [];
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // 저장 공간이 막혀 있어도 이번 탭에서는 동작하게 둔다
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바뀐 경우 반영
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  // 서버 렌더링 때는 빈 장바구니로 그린 뒤 클라이언트에서 채운다
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    add: (id: string) => {
      const cur = read();
      if (!cur.includes(id)) write([...cur, id]);
    },
    remove: (id: string) => write(read().filter((v) => v !== id)),
    clear: () => write([]),
  };
}
