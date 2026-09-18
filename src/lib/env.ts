import { z } from "zod";

function trimEnvString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function asAbsoluteUrl(value: unknown): string | undefined {
  const trimmed = trimEnvString(value);
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function resolveSiteUrl(): string | undefined {
  const configured = asAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  const vercelUrl = trimEnvString(process.env.VERCEL_URL);
  if (vercelUrl) return `https://${vercelUrl}`;

  return undefined;
}

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(asAbsoluteUrl, z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(trimEnvString, z.string().min(1)),
  NEXT_PUBLIC_SITE_URL: z.preprocess(asAbsoluteUrl, z.string().url()),
});

export type PublicEnv = z.infer<typeof publicSchema>;

function readPublicEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl(),
  };
}

function formatConfigError(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`).join("; ");
}

export function getPublicEnvOrNull(): PublicEnv | null {
  const parsed = publicSchema.safeParse(readPublicEnv());
  return parsed.success ? parsed.data : null;
}

export function getEnvConfigurationHint(): string | null {
  const parsed = publicSchema.safeParse(readPublicEnv());
  if (parsed.success) return null;
  return formatConfigError(parsed.error);
}

export function getPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse(readPublicEnv());
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables (${formatConfigError(parsed.error)}). Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables (Production and Preview), then Redeploy.`,
    );
  }
  return parsed.data;
}
