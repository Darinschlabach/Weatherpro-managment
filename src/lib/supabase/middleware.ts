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

const AUTH_ROUTES = new Set(["/login", "/forgot-password", "/reset-password"]);

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

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const env = getPublicEnvOrNull();
  if (!env) {
    const hint = getEnvConfigurationHint() ?? "Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local";
    console.error("[middleware] Supabase env invalid:", hint);
    return new NextResponse(
      `Server configuration error\n\n${hint}\n\nFix .env.local, save the file, and restart "npm run dev".`,
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
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
  const isRootRoute = pathname === "/";
  const isProtectedRoute = !isAuthRoute && !isRootRoute && !pathname.startsWith("/auth/");

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
