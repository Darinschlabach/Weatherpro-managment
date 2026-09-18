"use server";

import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeRole, wouldLeaveNoActiveAdmin, type AppRole } from "@/lib/roles";

export type ActionResult = { ok: true } | { ok: false; error: string };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function displayNameFrom(firstName: string, lastName: string, fallback = "") {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || fallback;
}

async function getActiveAdminIds() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("profiles").select("id").eq("role", "admin").eq("is_active", true);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map((row) => row.id);
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();

  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const email = getString(formData, "email").toLowerCase();
  const temporaryPassword = getString(formData, "temporaryPassword");
  const role = normalizeRole(getString(formData, "role"));

  if (!firstName || !lastName) {
    return { ok: false, error: "First name and last name are required." };
  }
  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (temporaryPassword.length < 8) {
    return { ok: false, error: "Temporary password must be at least 8 characters." };
  }

  const displayName = displayNameFrom(firstName, lastName, email);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
    },
  });

  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Failed to create user." };
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    role,
    is_active: true,
  });

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const userId = getString(formData, "userId");
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const role = normalizeRole(getString(formData, "role"));
  const isActive = getString(formData, "isActive") === "true";

  if (!userId) {
    return { ok: false, error: "Missing user ID." };
  }
  if (!firstName || !lastName) {
    return { ok: false, error: "First name and last name are required." };
  }

  if (userId === user.id && !isActive) {
    return { ok: false, error: "You cannot deactivate your own administrator account." };
  }

  const activeAdminIds = await getActiveAdminIds();
  if (
    wouldLeaveNoActiveAdmin({
      targetUserId: userId,
      nextRole: role,
      nextIsActive: isActive,
      activeAdminIds,
    })
  ) {
    return { ok: false, error: "This change would leave Weatherpro without an active administrator." };
  }

  const displayName = displayNameFrom(firstName, lastName);
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      role,
      is_active: isActive,
    })
    .eq("id", userId);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? "none" : "876000h",
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
    },
  });

  if (authError) {
    return { ok: false, error: authError.message };
  }

  return { ok: true };
}

export async function setUserActiveAction(formData: FormData): Promise<ActionResult> {
  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();
  const userId = getString(formData, "userId");
  const isActive = getString(formData, "isActive") === "true";

  if (!userId) {
    return { ok: false, error: "Missing user ID." };
  }
  if (userId === user.id && !isActive) {
    return { ok: false, error: "You cannot deactivate your own administrator account." };
  }

  const { data: target, error: targetError } = await admin
    .from("profiles")
    .select("id, role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !target) {
    return { ok: false, error: targetError?.message ?? "User not found." };
  }

  const activeAdminIds = await getActiveAdminIds();
  if (
    wouldLeaveNoActiveAdmin({
      targetUserId: userId,
      nextRole: target.role as AppRole,
      nextIsActive: isActive,
      activeAdminIds,
    })
  ) {
    return { ok: false, error: "This change would leave Weatherpro without an active administrator." };
  }

  const { error: profileError } = await admin.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: isActive ? "none" : "876000h",
  });
  if (authError) {
    return { ok: false, error: authError.message };
  }

  return { ok: true };
}
