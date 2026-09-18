import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminUsersManager, type AdminUserRow } from "@/components/admin/AdminUsersManager";
import { profileDisplayName } from "@/lib/roles";
import type { AppRole } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const admin = createSupabaseAdminClient();
  let error = "";
  let rows: AdminUserRow[] = [];

  const { data, error: queryError } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name, display_name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  if (queryError) {
    error = `Failed to load users: ${queryError.message}`;
  } else {
    rows = (data ?? []).map((profile) => ({
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      displayName: profileDisplayName(profile),
      email: profile.email,
      role: profile.role as AppRole,
      isActive: profile.is_active,
      createdAt: profile.created_at,
    }));
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <AdminUsersManager rows={rows} currentUserId={user.id} />
    </div>
  );
}
