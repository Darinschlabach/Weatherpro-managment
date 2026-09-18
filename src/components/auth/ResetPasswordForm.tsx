"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { updatePasswordAction } from "@/app/actions/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-brand-600 focus:ring-2";

type ResetPasswordFormProps = {
  flow: "invite" | "reset";
};

export function ResetPasswordForm({ flow }: ResetPasswordFormProps) {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    async function load(final = false) {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (data.user) {
        setReady(true);
        setError("");
        return;
      }
      if (final) {
        setError(
          flow === "invite"
            ? "This invitation link is invalid or has expired. Ask an administrator to send a new invite."
            : "This reset link is invalid or has expired. Request a new password reset email.",
        );
      }
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setReady(true);
        setError("");
      }
    });

    void load();
    const retry = window.setTimeout(() => {
      void load(true);
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(retry);
      subscription.subscription.unsubscribe();
    };
  }, [flow]);

  if (!ready) {
    return (
      <div className="mt-5 space-y-4">
        {error ? (
          <>
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
            <Link href={flow === "reset" ? "/forgot-password" : "/login"} className="inline-block text-sm font-medium text-brand-700 hover:underline">
              {flow === "reset" ? "Request a new reset link" : "Back to sign in"}
            </Link>
          </>
        ) : (
          <p className="text-sm text-slate-500">Verifying your link...</p>
        )}
      </div>
    );
  }

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
      <input type="hidden" name="flow" value={flow} />
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
        {isPending ? "Saving..." : flow === "invite" ? "Save password" : "Update password"}
      </button>
    </form>
  );
}
