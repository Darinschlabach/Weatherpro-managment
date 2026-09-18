import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/dashboard",
    "/invoices",
    "/quotes",
    "/contacts",
    "/contacts/:path*",
    "/calendar",
    "/inventory",
    "/schedule",
    "/catalogue",
    "/admin",
    "/admin/:path*",
    "/auth/callback",
  ],
};
