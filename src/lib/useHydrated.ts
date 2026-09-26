"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// 서버 렌더링 중엔 false, 클라이언트에서 붙은 뒤엔 true.
// localStorage에 의존하는 화면에서 "빈 상태"가 잠깐 보이는 걸 막는 데 쓴다.
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
