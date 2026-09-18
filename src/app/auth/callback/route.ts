import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";
import { safeAuthNext, type PasswordSetupPath } from "@/lib/auth-urls";
import type { Database } from "@/types/database";

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
  };
};

const OTP_TYPES = new Set(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

function defaultNext(type: string | null): PasswordSetupPath {
  return type === "invite" ? "/set-password" : "/reset-password";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const type = url.searchParams.get("type");
  const nextPath = safeAuthNext(url.searchParams.get("next"), defaultNext(type));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash") ?? url.searchParams.get("token");
  const authError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (authError) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("This authentication link is invalid or has expired.")}`, request.url));
  }

  const redirectResponse = NextResponse.redirect(new URL(nextPath, request.url));
  const env = getPublicEnv();
  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let errorMessage = "";

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      errorMessage = error.message;
    }
  } else if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change" | "email",
      token_hash: tokenHash,
    });
    if (error) {
      errorMessage = error.message;
    }
  } else if (tokenHash) {
    errorMessage = "Missing verification type.";
  } else {
    return new NextResponse(
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Weatherpro</title>
  </head>
  <body>
    <p>Continuing to Weatherpro...</p>
    <script>location.replace(${JSON.stringify(nextPath)} + location.hash);</script>
  </body>
</html>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  if (errorMessage) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("This authentication link is invalid or has expired.")}`, request.url),
    );
  }

  return redirectResponse;
}
