import { LoginForm } from "@/components/auth/LoginForm";
import { MissingConfig } from "@/components/setup/MissingConfig";
import { getEnvConfigurationHint, getPublicEnvOrNull } from "@/lib/env";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (!getPublicEnvOrNull()) {
    return <MissingConfig hint={getEnvConfigurationHint()} />;
  }

  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : "";
  const success = typeof params.success === "string" ? params.success : "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-6">
      <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <div className="text-center">
          <p className="text-[28px] font-semibold leading-none tracking-tight text-brand-800">Weatherpro</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Management</p>
        </div>
        <LoginForm initialError={error} initialSuccess={success} />
      </div>
    </main>
  );
}
