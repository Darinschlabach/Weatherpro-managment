"use client";

import { Menu } from "lucide-react";

type MobileHeaderProps = {
  menuOpen: boolean;
  onOpenMenu: () => void;
};

export function MobileHeader({ menuOpen, onOpenMenu }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white pt-[env(safe-area-inset-top)] md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="min-w-0">
          <p className="text-[22px] font-semibold leading-none tracking-tight text-brand-900">Weatherpro</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">Management</p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-800 hover:bg-slate-50"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation-drawer"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
