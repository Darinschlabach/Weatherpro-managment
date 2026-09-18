"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createUserAction, setUserActiveAction, updateUserAction } from "@/app/actions/admin-users";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AppRole } from "@/types/database";

export type AdminUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
};

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-brand-600 focus:ring-2";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminUsersManager({ rows, currentUserId }: { rows: AdminUserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => a.displayName.localeCompare(b.displayName) || a.email.localeCompare(b.email)),
    [rows],
  );

  function refreshWithMessage(message: string) {
    setSuccess(message);
    setError("");
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="User management"
        subtitle="Invite and manage Weatherpro user accounts."
        action={
          <button
            type="button"
            onClick={() => {
              setAddOpen(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Invite User
          </button>
        }
      />

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date added</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {sortedRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-medium">{row.displayName}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 capitalize">{row.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={row.isActive} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setEditing(row);
                          setError("");
                          setSuccess("");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={isPending || (row.id === currentUserId && row.isActive)}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          const formData = new FormData();
                          formData.set("userId", row.id);
                          formData.set("isActive", String(!row.isActive));
                          startTransition(async () => {
                            const result = await setUserActiveAction(formData);
                            if (!result.ok) {
                              setError(result.error);
                              setSuccess("");
                              return;
                            }
                            refreshWithMessage(row.isActive ? "User deactivated." : "User activated.");
                          });
                        }}
                      >
                        {row.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <AddUserDialog
        open={addOpen}
        pending={isPending}
        onClose={() => setAddOpen(false)}
        onSubmit={(formData) => {
          startTransition(async () => {
            const result = await createUserAction(formData);
            if (!result.ok) {
              setError(result.error);
              setSuccess("");
              return;
            }
            setAddOpen(false);
            refreshWithMessage("Invitation sent.");
          });
        }}
      />

      <EditUserDialog
        user={editing}
        pending={isPending}
        currentUserId={currentUserId}
        onClose={() => setEditing(null)}
        onSubmit={(formData) => {
          startTransition(async () => {
            const result = await updateUserAction(formData);
            if (!result.ok) {
              setError(result.error);
              setSuccess("");
              return;
            }
            setEditing(null);
            refreshWithMessage("User updated.");
          });
        }}
      />
    </div>
  );
}

function AddUserDialog({
  open,
  pending,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <Modal title="Invite User" description="Send a Weatherpro invitation email so the user can set their own password." open={open} onClose={onClose}>
      <form action={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="add-firstName" className="mb-1 block text-sm font-medium text-slate-700">
            First Name
          </label>
          <input id="add-firstName" name="firstName" required className={inputClassName} />
        </div>
        <div>
          <label htmlFor="add-lastName" className="mb-1 block text-sm font-medium text-slate-700">
            Last Name
          </label>
          <input id="add-lastName" name="lastName" required className={inputClassName} />
        </div>
        <div>
          <label htmlFor="add-email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input id="add-email" name="email" type="email" required autoComplete="off" className={inputClassName} />
        </div>
        <div>
          <label htmlFor="add-role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select id="add-role" name="role" defaultValue="user" className={inputClassName}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {pending ? "Sending..." : "Send invitation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditUserDialog({
  user,
  pending,
  currentUserId,
  onClose,
  onSubmit,
}: {
  user: AdminUserRow | null;
  pending: boolean;
  currentUserId: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  if (!user) {
    return <Modal title="Edit user" open={false} onClose={onClose}>{null}</Modal>;
  }

  const editingSelf = user.id === currentUserId;

  return (
    <Modal title="Edit user" description="Update name, role, or account status." open={Boolean(user)} onClose={onClose}>
      <form action={onSubmit} className="space-y-3">
        <input type="hidden" name="userId" value={user.id} />
        <div>
          <label htmlFor="edit-firstName" className="mb-1 block text-sm font-medium text-slate-700">
            First Name
          </label>
          <input id="edit-firstName" name="firstName" required defaultValue={user.firstName} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="edit-lastName" className="mb-1 block text-sm font-medium text-slate-700">
            Last Name
          </label>
          <input id="edit-lastName" name="lastName" required defaultValue={user.lastName} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="edit-role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select id="edit-role" name="role" defaultValue={user.role} className={inputClassName}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <div>
          <label htmlFor="edit-isActive" className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="edit-isActive"
            name="isActive"
            defaultValue={String(user.isActive)}
            disabled={editingSelf}
            className={inputClassName}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {editingSelf ? (
            <>
              <input type="hidden" name="isActive" value="true" />
              <p className="mt-1 text-xs text-slate-500">You cannot deactivate your own administrator account.</p>
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
