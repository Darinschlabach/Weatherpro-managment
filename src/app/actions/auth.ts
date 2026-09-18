"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicEnv } from "@/lib/env";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(formData: FormData): Promise<{ error: string } | void> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("invalid login") || message.includes("invalid credentials") || message.includes("email not confirmed")) {
      return { error: "The email or password is incorrect." };
    }
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unable to complete sign-in." };
  }

  const { data } = await supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle();
  const profile = data as { is_active: boolean } | null;
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { error: "This account is inactive. Contact an administrator." };
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(formData: FormData): Promise<{ error?: string; success?: string }> {
  const email = getString(formData, "email");
  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createSupabaseServerClient();
  const env = getPublicEnv();
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  const siteOrigin = new URL(env.NEXT_PUBLIC_SITE_URL).origin;
  const redirectOrigin = origin && /^https?:\/\//i.test(origin) ? origin : siteOrigin;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectOrigin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "If an account exists for that email, a reset link has been sent." };
}

export async function updatePasswordAction(formData: FormData): Promise<{ error?: string } | void> {
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  redirect("/login?success=Password%20updated.%20Sign%20in%20with%20your%20new%20password.");
}
