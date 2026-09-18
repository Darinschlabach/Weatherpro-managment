import { getPublicEnv } from "@/lib/env";

export const passwordSetupPaths = ["/set-password", "/reset-password"] as const;
export type PasswordSetupPath = (typeof passwordSetupPaths)[number];

export function getSiteOrigin() {
  return new URL(getPublicEnv().NEXT_PUBLIC_SITE_URL).origin;
}

export function isPasswordSetupPath(pathname: string): pathname is PasswordSetupPath {
  return (passwordSetupPaths as readonly string[]).includes(pathname);
}

export function safeAuthNext(value: string | null | undefined, fallback: PasswordSetupPath): PasswordSetupPath {
  if (value && isPasswordSetupPath(value)) {
    return value;
  }
  return fallback;
}

export function authCallbackUrl(next: PasswordSetupPath) {
  const url = new URL("/auth/callback", `${getSiteOrigin()}/`);
  url.searchParams.set("next", next);
  return url.toString();
}
