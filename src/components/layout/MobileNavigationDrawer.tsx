"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { ContactAvatar } from "@/components/contacts/ContactAvatar";
import { NavIcon } from "@/components/layout/NavIcon";
import { isNavItemActive, mainNavItems, settingsNavItems } from "@/lib/navigation";

type MobileNavigationDrawerProps = {
  open: boolean;
  displayName: string;
  role: string;
  onClose: () => void;
};

function navClassName(active: boolean) {
  return `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
    active ? "bg-brand-50 text-brand-800" : "text-slate-700 hover:bg-slate-50"
  }`;
}

export function MobileNavigationDrawer({ open, displayName, role, onClose }: MobileNavigationDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`absolute right-0 top-0 flex h-dvh w-[80vw] max-w-[20rem] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="min-w-0 pt-1">
            <p className="text-[22px] font-semibold leading-none tracking-tight text-brand-900">Weatherpro</p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">Management</p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={navClassName(active)}
                  onClick={onClose}
                >
                  <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Settings</p>
          <div className="space-y-1">
            {settingsNavItems.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={navClassName(active)}
                  onClick={onClose}
                >
                  <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-100 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center gap-3">
            <ContactAvatar name={displayName} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{role}</p>
            </div>
          </div>
          <form method="post" action="/api/auth/sign-out" className="mt-4">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
