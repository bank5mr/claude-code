"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

type NavItem = { href: string; label: string; match: (p: string) => boolean };

const NAV: NavItem[] = [
  { href: "/", label: "자료", match: (p) => p === "/" || p.startsWith("/products") },
  { href: "/library", label: "내 자료", match: (p) => p.startsWith("/library") },
];
const ADMIN_NAV: NavItem = { href: "/admin", label: "관리", match: (p) => p.startsWith("/admin") };

export type HeaderViewer = { isAdmin: boolean } | null;

export function Header({ viewer }: { viewer: HeaderViewer }) {
  const pathname = usePathname();
  const { ids } = useCart();
  const items = viewer?.isAdmin ? [...NAV, ADMIN_NAV] : NAV;
  // 로그인 후 지금 보던 곳으로 돌아오게
  const loginHref = pathname === "/" || pathname === "/login" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="wrap flex h-[60px] items-center gap-3 max-sm:gap-1">
        <Logo />
        <nav aria-label="주 메뉴" className="ml-3 max-sm:ml-1">
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-ctl px-2.5 text-[15px] transition-colors duration-150 max-sm:px-2 ${
                      active ? "bg-grid-soft font-semibold" : "hover:text-grid"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/cart" className="btn btn-secondary btn-sm">
            장바구니 <span className="font-semibold text-grid">{ids.length}</span>
          </Link>
          {!viewer && (
            <Link href={loginHref} className="btn btn-text btn-sm">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
