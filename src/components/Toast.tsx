"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastApi = { show: (message: string) => void };
const ToastContext = createContext<ToastApi>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// 화면 하단 중앙 토스트. 2.2초 뒤 사라짐.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMessage(m);
    setKey((k) => k + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* 영역은 항상 두고 내용만 바꿔야 스크린리더가 읽는다 */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4"
        style={{ bottom: "calc(24px + env(safe-area-inset-bottom))" }}
      >
        {message && (
          <div
            key={key}
            className="toast-in rounded-ctl bg-ink px-4 py-2.5 text-meta text-paper"
          >
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
