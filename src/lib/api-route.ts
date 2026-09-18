import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function sameOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === requestUrl.origin);
}

export function getFormString(form: Record<string, unknown>, key: string) {
  const value = form[key];
  return typeof value === "string" ? value.trim() : "";
}

export function nullableFormValue(value: string) {
  return value ? value : null;
}

export async function readFormPayload(request: Request) {
  const formData = await request.formData();
  const payload: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (payload[key] === undefined) {
      payload[key] = typeof value === "string" ? value : "";
      return;
    }
    const current = payload[key];
    const next = typeof value === "string" ? value : "";
    payload[key] = Array.isArray(current) ? [...current, next] : [String(current), next];
  });
  return { formData, payload };
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function requireApiUser(request: Request) {
  if (!sameOrigin(request)) {
    return { user: null, supabase: null, error: jsonError("Forbidden", 403) };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, supabase: null, error: jsonError("You must be signed in.", 401) };
  }
  return { user, supabase, error: null };
}
