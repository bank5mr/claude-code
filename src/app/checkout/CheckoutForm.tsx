"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useCartProducts } from "@/lib/useCartProducts";
import { won } from "@/lib/format";

type Errors = Partial<Record<"name" | "email" | "agree", string>>;

// 1단계 목업: 토스 결제위젯 자리만 잡아 둔다 (4단계에서 연결)
const IS_TEST_MODE = true;

export function CheckoutForm() {
  const router = useRouter();
  const { products } = useCartProducts();
  const hydrated = products !== null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const ids = { name: useId(), email: useId(), agree: useId() };

  // TODO(4단계): 금액은 서버가 만든 pending 주문의 amount를 쓴다
  const total = (products ?? []).reduce((s, p) => s + p.price, 0);

  function validate(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = "이름이 비어 있어. 주문자 이름을 적어 줘.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "이메일 형식이 아니야. name@example.com처럼 적어 줘.";
    if (!agree) e.agree = "청약철회 제한에 동의해야 결제할 수 있어. 위 상자를 체크해 줘.";
    return e;
  }

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length === 0) router.push("/checkout/success");
      }}
      className="flex flex-col gap-5"
    >
      <div>
        <label htmlFor={ids.name} className="field-label">
          이름
        </label>
        <input
          id={ids.name}
          className="input"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${ids.name}-err` : undefined}
        />
        {errors.name && (
          <p id={`${ids.name}-err`} className="field-error">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={ids.email} className="field-label">
          이메일
        </label>
        <input
          id={ids.email}
          className="input"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${ids.email}-err` : undefined}
        />
        {errors.email && (
          <p id={`${ids.email}-err`} className="field-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        {IS_TEST_MODE && (
          <p className="mb-3 border border-dashed border-grid px-3 py-2 text-meta">
            테스트 결제야. 실제로 돈이 나가지 않아.
          </p>
        )}
        {/* TODO(4단계): 토스 결제위젯 renderPaymentMethods / renderAgreement */}
        <div className="flex flex-col gap-3 border border-line bg-surface p-5" aria-hidden>
          <div className="skeleton h-5 w-1/3" />
          <div className="grid grid-cols-3 gap-2">
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
            <div className="skeleton h-12" />
          </div>
          <div className="skeleton h-4 w-2/3" />
          <p className="text-note text-muted">토스 결제위젯이 들어갈 자리야.</p>
        </div>
      </div>

      <div>
        <label className="flex min-h-10 cursor-pointer items-start gap-3">
          <input
            id={ids.agree}
            type="checkbox"
            className="mt-1 size-[18px] shrink-0 accent-[var(--grid)]"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            aria-invalid={!!errors.agree}
            aria-describedby={errors.agree ? `${ids.agree}-err` : undefined}
          />
          <span className="text-meta">
            (필수) 디지털 콘텐츠 특성상 내려받은 뒤에는 청약철회가 제한된다는 점을 확인했어.
          </span>
        </label>
        {errors.agree && (
          <p id={`${ids.agree}-err`} className="field-error">
            {errors.agree}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={!hydrated || total === 0}>
        {hydrated ? `${won(total)} 결제` : "결제"}
      </button>
    </form>
  );
}
