"use client";

import { useState, useTransition } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { updatePasswordAction } from "@/app/actions/auth";

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-brand-600 focus:ring-2";

export function ResetPasswordForm() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-5 space-y-4"
      action={(formData) => {
        setError("");
        startTransition(async () => {
          const result = await updatePasswordAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          New password
        </label>
        <PasswordInput id="password" name="password" required autoComplete="new-password" className={inputClassName} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
          className={inputClassName}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
