"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNavigationDrawer } from "@/components/layout/MobileNavigationDrawer";

type AppShellProps = {
  displayName: string;
  role: string;
  children: ReactNode;
};

export function AppShell({ displayName, role, children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-white">
      <aside className="hidden h-full w-[208px] shrink-0 border-r border-brand-200 bg-brand-100 p-3 md:block">
        <AppSidebar displayName={displayName} role={role} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader menuOpen={mobileOpen} onOpenMenu={() => setMobileOpen(true)} />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-auto bg-white px-4 py-4 md:p-6">
          {children}
        </main>
      </div>

      <MobileNavigationDrawer open={mobileOpen} displayName={displayName} role={role} onClose={closeMobileMenu} />
    </div>
  );
}
