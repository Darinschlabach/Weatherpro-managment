"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, mainNavItems, settingsNavItems } from "@/lib/navigation";
import { NavIcon } from "@/components/layout/NavIcon";

type AppSidebarProps = {
  displayName: string;
  role: string;
};

function navClassName(active: boolean) {
  return `flex items-center gap-2.5 rounded-md border-l-[3px] px-2.5 py-2 text-sm font-medium transition ${
    active
      ? "border-brand-800 bg-brand-700 text-white shadow-sm"
      : "border-transparent text-brand-800 hover:bg-white/55 hover:text-brand-900"
  }`;
}

export function AppSidebar({ displayName, role }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pt-1">
        <Link href="/dashboard" className="block rounded-md px-1 py-2">
          <p className="text-[22px] font-semibold leading-none tracking-tight text-brand-900">Weatherpro</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">Management</p>
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-6 overflow-y-auto px-1">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={navClassName(active)}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700/80">
            Settings
          </p>
          <div className="space-y-1">
            {settingsNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={navClassName(active)}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mt-auto px-2 pb-2 pt-4">
        <p className="truncate px-1 text-sm font-medium text-brand-900">{displayName}</p>
        <p className="mt-1 px-1 text-xs uppercase tracking-[0.12em] text-brand-700/80">{role}</p>
        <form method="post" action="/api/auth/sign-out" className="mt-5">
          <button
            type="submit"
            className="w-full rounded-md border border-brand-700/45 px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-white/50"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
