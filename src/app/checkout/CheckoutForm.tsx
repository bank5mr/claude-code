"use client";

import { useEffect, useId, useRef, useState } from "react";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { won } from "@/lib/format";

type Errors = Partial<Record<"name" | "email" | "agree" | "widget", string>>;

type Props = {
  clientKey: string;
  customerKey: string;
  orderId: string;
  orderName: string;
  amount: number;
  defaultName: string;
  defaultEmail: string;
};

export function CheckoutForm({
  clientKey,
  customerKey,
  orderId,
  orderName,
  amount,
  defaultName,
  defaultEmail,
}: Props) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const ids = { name: useId(), email: useId(), agree: useId() };
  const isTest = clientKey.startsWith("test_");

  // 결제위젯 준비: 금액 설정 → 결제수단 UI, 약관 UI 렌더링
  // 개발 모드(StrictMode)에서 effect가 두 번 돌아도 한 번만 그리도록 ref로 막는다
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        // 금액은 서버가 만든 주문 금액 (반드시 렌더링보다 먼저)
        await widgets.setAmount({ currency: "KRW", value: amount });
        await Promise.all([
          widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
          widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
        ]);
        widgetsRef.current = widgets;
        setReady(true);
      } catch {
        setErrors((e) => ({ ...e, widget: "결제 화면을 불러오지 못했어. 새로고침해 줘." }));
      }
    })();
  }, [clientKey, customerKey, amount]);

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
      onSubmit={async (ev) => {
        ev.preventDefault();
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0 || !widgetsRef.current) return;
        setPaying(true);
        try {
          // 결제창 열기. 결과는 successUrl / failUrl로 돌아온다
          const origin = window.location.origin;
          await widgetsRef.current.requestPayment({
            orderId,
            orderName,
            successUrl: `${origin}/checkout/success`,
            failUrl: `${origin}/checkout/fail?order=${encodeURIComponent(orderId)}`,
            customerEmail: email.trim(),
            customerName: name.trim(),
          });
        } catch {
          // 결제창을 닫는 등으로 요청이 끝나지 않은 경우: 다시 누를 수 있게
          setPaying(false);
        }
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
          maxLength={100}
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
          maxLength={100}
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
        {isTest && (
          <p className="mb-3 border border-dashed border-grid px-3 py-2 text-meta">
            테스트 결제야. 실제로 돈이 나가지 않아.
          </p>
        )}
        {/* 토스 결제위젯이 그려지는 자리. 불러오는 동안 자리표시자 */}
        <div className="relative border border-line bg-surface">
          {!ready && !errors.widget && (
            <div aria-hidden className="absolute inset-0 flex flex-col gap-3 p-5">
              <div className="skeleton h-5 w-1/3" />
              <div className="grid grid-cols-3 gap-2">
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
                <div className="skeleton h-12" />
              </div>
              <div className="skeleton h-4 w-2/3" />
            </div>
          )}
          <div id="payment-method" className="min-h-[240px]" />
          <div id="agreement" />
        </div>
        {errors.widget && (
          <p className="field-error" role="alert">
            {errors.widget}
          </p>
        )}
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

      <button type="submit" className="btn btn-primary w-full" disabled={!ready || paying}>
        {paying ? "결제창 여는 중…" : `${won(amount)} 결제`}
      </button>
    </form>
  );
}
