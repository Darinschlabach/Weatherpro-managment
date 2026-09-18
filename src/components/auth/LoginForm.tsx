"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { signInAction } from "@/app/actions/auth";

type LoginFormProps = {
  initialError?: string;
  initialSuccess?: string;
};

const inputClassName =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-brand-600 focus:ring-2";

export function LoginForm({ initialError = "", initialSuccess = "" }: LoginFormProps) {
  const [error, setError] = useState(initialError);
  const [success] = useState(initialSuccess);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 space-y-4"
      action={(formData) => {
        setError("");
        startTransition(async () => {
          const result = await signInAction(formData);
          if (result?.error) {
            setError(result.error);
          }
        });
      }}
    >
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" className={inputClassName} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>

      <div className="text-center">
        <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
