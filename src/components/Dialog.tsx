"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

// 네이티브 <dialog>. 바깥(백드롭) 클릭과 Esc로 닫힌다.
export function Dialog({ open, onClose, title, children, actions }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby={titleId}
      // Esc 또는 close() 모두 onClose로 상태를 맞춘다
      onClose={onClose}
      onClick={(e) => {
        // 클릭 대상이 dialog 자체면 백드롭을 누른 것
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="p-6">
        <h2 id={titleId} className="text-dialog">
          {title}
        </h2>
        {children && <div className="mt-3 text-muted">{children}</div>}
        {actions && <div className="mt-6 flex flex-wrap justify-end gap-2">{actions}</div>}
      </div>
    </dialog>
  );
}
