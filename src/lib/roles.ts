import type { AppRole } from "@/types/database";

export type { AppRole };

export const APP_ROLES: readonly AppRole[] = ["admin", "user"] as const;

export function isAppRole(value: string): value is AppRole {
  return value === "admin" || value === "user";
}

export function normalizeRole(value: string): AppRole {
  return value === "admin" ? "admin" : "user";
}

export function profileDisplayName(profile: {
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
}) {
  const combined = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
  return profile.display_name.trim() || combined || profile.email;
}

export function wouldLeaveNoActiveAdmin(options: {
  targetUserId: string;
  nextRole: AppRole;
  nextIsActive: boolean;
  activeAdminIds: string[];
}) {
  const { targetUserId, nextRole, nextIsActive, activeAdminIds } = options;
  const isCurrentlyActiveAdmin = activeAdminIds.includes(targetUserId);
  if (!isCurrentlyActiveAdmin) {
    return false;
  }
  const remainsAdmin = nextRole === "admin" && nextIsActive;
  if (remainsAdmin) {
    return false;
  }
  return activeAdminIds.length <= 1;
}
