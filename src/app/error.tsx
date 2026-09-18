"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <p className="text-[28px] font-semibold leading-none tracking-tight text-brand-800">Weatherpro</p>
        <h1 className="mt-6 text-xl font-semibold text-slate-800">The app could not load</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          If this is the live Vercel site, confirm Environment Variables are set for Production and Preview, then
          Redeploy. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.
        </p>
        {error.digest ? <p className="mt-3 text-xs text-slate-400">Digest {error.digest}</p> : null}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
