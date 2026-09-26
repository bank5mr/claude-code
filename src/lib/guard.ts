import "server-only";
import { notFound, redirect } from "next/navigation";
import { getViewer } from "./auth";

// proxy가 먼저 막지만, 페이지에서도 한 번 더 확인한다 (이중 방어)
export async function requireViewer(nextPath: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return viewer;
}

// 관리자가 아니면 페이지가 없는 것처럼 보이게 한다
export async function requireAdmin() {
  const viewer = await requireViewer("/admin");
  if (!viewer.isAdmin) notFound();
  return viewer;
}
