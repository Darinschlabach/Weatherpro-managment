export function MissingConfig({ hint }: { hint?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-6">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <p className="text-[28px] font-semibold leading-none tracking-tight text-brand-800">Weatherpro</p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Management</p>
        <h1 className="mt-6 text-xl font-semibold text-slate-800">Missing server configuration</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This live site needs Supabase keys in Vercel. Open the project, go to Settings → Environment Variables, add
          these for Production and Preview, then Redeploy:
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
          <li>
            <code>SUPABASE_SERVICE_ROLE_KEY</code> (server-only, never <code>NEXT_PUBLIC_</code>)
          </li>
          <li>
            <code>NEXT_PUBLIC_SITE_URL</code> (optional on Vercel; defaults to this deployment URL)
          </li>
        </ul>
        {hint ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{hint}</p>
        ) : null}
      </div>
    </main>
  );
}
