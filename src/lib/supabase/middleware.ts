import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getEnvConfigurationHint, getPublicEnvOrNull } from "@/lib/env";
import type { AppRole, Database } from "@/types/database";

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

const AUTH_ROUTES = new Set(["/login", "/forgot-password"]);
const PASSWORD_SETUP_ROUTES = new Set(["/reset-password", "/set-password"]);

function redirectWithSessionCookies(request: NextRequest, pathname: string, sessionResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(new URL(pathname, request.url));
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

function signOutRedirect(request: NextRequest, sessionResponse: NextResponse) {
  return redirectWithSessionCookies(request, "/login", sessionResponse);
}

function configurationMissingResponse(hint: string) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Weatherpro configuration</title>
  </head>
  <body style="margin:0;font-family:Arial,sans-serif;background:#f4f6f8;color:#1e293b">
    <main style="max-width:40rem;margin:4rem auto;padding:2rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px">
      <p style="margin:0;font-size:1.75rem;font-weight:700;color:#185c86">Weatherpro</p>
      <h1 style="margin:1.25rem 0 0;font-size:1.25rem">Missing server configuration</h1>
      <p style="line-height:1.6">Add these in Vercel → Settings → Environment Variables for Production and Preview, then Redeploy:</p>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        <li>SUPABASE_SERVICE_ROLE_KEY</li>
        <li>NEXT_PUBLIC_SITE_URL (optional on Vercel)</li>
      </ul>
      <p style="padding:0.75rem 1rem;background:#fffbeb;border:1px solid #fde68a;border-radius:8px">${hint.replace(/[<>&"]/g, "")}</p>
    </main>
  </body>
</html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const env = getPublicEnvOrNull();
  if (!env) {
    const hint = getEnvConfigurationHint() ?? "Supabase environment variables are missing.";
    console.error("[middleware] Supabase env invalid:", hint);
    return configurationMissingResponse(hint);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  let user: { id: string } | null = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      await supabase.auth.signOut();
    } else {
      user = data.user;
    }
  } catch {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const isServerAction = request.headers.has("next-action");
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isPasswordSetupRoute = PASSWORD_SETUP_ROUTES.has(pathname);
  const isRootRoute = pathname === "/";
  const isProtectedRoute = !isAuthRoute && !isPasswordSetupRoute && !isRootRoute && !pathname.startsWith("/auth/");

  if (!user) {
    if (isServerAction) {
      return response;
    }
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (isPasswordSetupRoute) {
    return response;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as { role: AppRole; is_active: boolean } | null;

  if (profileError || !profile || !profile.is_active) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    return signOutRedirect(request, response);
  }

  const role = profile.role as AppRole;

  if (isAuthRoute || isRootRoute) {
    return redirectWithSessionCookies(request, "/dashboard", response);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectWithSessionCookies(request, "/dashboard?error=Access%20denied", response);
  }

  return response;
}
