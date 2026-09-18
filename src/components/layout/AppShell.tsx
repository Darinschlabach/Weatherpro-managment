"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";

type AppShellProps = {
  displayName: string;
  role: string;
  children: ReactNode;
};

export function AppShell({ displayName, role, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <aside className="hidden h-full w-[208px] shrink-0 border-r border-brand-200 bg-brand-100 p-3 lg:block">
        <AppSidebar displayName={displayName} role={role} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-50 h-full w-[208px] border-r border-brand-200 bg-brand-100 p-3 shadow-xl">
            <button
              type="button"
              className="mb-2 ml-auto flex h-8 w-8 items-center justify-center rounded-md text-brand-800 hover:bg-white/55"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <AppSidebar displayName={displayName} role={role} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-slate-200 px-4 py-3 lg:hidden">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="ml-3">
            <p className="text-sm font-semibold text-brand-800">Weatherpro</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Management</p>
          </div>
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
