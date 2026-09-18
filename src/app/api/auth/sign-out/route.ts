import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!origin || origin !== requestUrl.origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Continue to login even if the session is already invalid.
  }

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
