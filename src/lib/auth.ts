import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

const LOGIN_PATH = "/login";

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();

  let authResult: Awaited<ReturnType<typeof supabase.auth.getUser>>;
  try {
    authResult = await supabase.auth.getUser();
  } catch {
    return { user: null, profile: null };
  }

  const user = (authResult.data.user as User | null) ?? null;
  if (!user || authResult.error) {
    return { user: null, profile: null };
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = data as Profile | null;

  if (!profile || !profile.is_active) {
    return { user: null, profile: null };
  }

  return { user, profile };
}

export async function requireUser() {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    redirect(LOGIN_PATH);
  }
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireUser();
  if (profile.role !== "admin") {
    redirect("/dashboard?error=Access%20denied");
  }
  return { user, profile };
}
