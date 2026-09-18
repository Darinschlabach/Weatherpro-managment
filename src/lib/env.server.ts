import "server-only";

import { z } from "zod";
import { getPublicEnv, type PublicEnv } from "@/lib/env";

function trimEnvString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(trimEnvString, z.string().min(1)),
});

export type ServerEnv = PublicEnv & z.infer<typeof serverSchema>;

export function getServerEnv(): ServerEnv {
  const publicEnv = getPublicEnv();
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for privileged server operations. Add it to .env.local and never prefix it with NEXT_PUBLIC_.",
    );
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("The service role key must never be exposed through NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    ...publicEnv,
    SUPABASE_SERVICE_ROLE_KEY: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  };
}
