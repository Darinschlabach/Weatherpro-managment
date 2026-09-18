import { z } from "zod";

function trimEnvString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(trimEnvString, z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(trimEnvString, z.string().min(1)),
  NEXT_PUBLIC_SITE_URL: z.preprocess(trimEnvString, z.string().url()),
});

export type PublicEnv = z.infer<typeof publicSchema>;

function readPublicEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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
      `Invalid environment variables (${formatConfigError(parsed.error)}). Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and NEXT_PUBLIC_SITE_URL in .env.local, then restart the dev server.`,
    );
  }
  return parsed.data;
}
