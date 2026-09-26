import "server-only";

// 토스페이먼츠 서버 API. 시크릿 키는 이 파일에서만 읽는다 (NEXT_PUBLIC_ 금지).
const API = "https://api.tosspayments.com/v1";

export type TossPayment = {
  paymentKey: string;
  orderId: string;
  status: string; // READY | IN_PROGRESS | DONE | CANCELED | ...
  totalAmount: number;
  method: string | null;
  approvedAt: string | null;
};

export type TossError = { code: string; message: string };

export type TossResult =
  | { ok: true; payment: TossPayment }
  | { ok: false; status: number; error: TossError }
  // 네트워크 오류 등으로 결과를 알 수 없음 (주문을 실패 처리하면 안 됨)
  | { ok: false; status: 0; error: TossError; unknown: true };

function authHeader() {
  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret) throw new Error("TOSS_SECRET_KEY가 없어. .env.local에 넣어 줘.");
  // Basic base64("시크릿키:") — 콜론을 빠뜨리지 않는다
  return `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
}

async function call(path: string, init: RequestInit): Promise<TossResult> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: authHeader(), "Content-Type": "application/json", ...init.headers },
      cache: "no-store",
    });
    const body = await res.json().catch(() => null);
    if (res.ok) return { ok: true, payment: body as TossPayment };
    const error: TossError = {
      code: typeof body?.code === "string" ? body.code : "UNKNOWN",
      message: typeof body?.message === "string" ? body.message : "결제 처리 중 문제가 생겼어.",
    };
    // 5xx는 토스 쪽 일시 오류일 수 있으니 결과 불명으로 본다
    if (res.status >= 500) return { ok: false, status: 0, error, unknown: true };
    return { ok: false, status: res.status, error };
  } catch {
    return {
      ok: false,
      status: 0,
      unknown: true,
      error: { code: "NETWORK_ERROR", message: "토스페이먼츠와 연결하지 못했어." },
    };
  }
}

// 결제 승인. 같은 주문은 같은 멱등키를 써서 두 번 요청돼도 한 번만 승인된다 (키 유효기간 15일).
export function confirmPayment(input: { paymentKey: string; orderId: string; amount: number }) {
  return call("/payments/confirm", {
    method: "POST",
    headers: { "Idempotency-Key": `hankan-confirm-${input.orderId}` },
    body: JSON.stringify(input),
  });
}

// 주문번호로 결제 조회 (승인 API가 실패했을 때 실제 상태 확인용)
export function getPaymentByOrderId(orderId: string) {
  return call(`/payments/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}
