import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { profileDisplayName } from "@/lib/roles";

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile } = await requireUser();

  return (
    <AppShell displayName={profileDisplayName(profile)} role={profile.role}>
      {children}
    </AppShell>
  );
}
