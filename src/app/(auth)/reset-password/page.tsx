import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-6">
      <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <div className="text-center">
          <p className="text-[28px] font-semibold leading-none tracking-tight text-brand-800">Weatherpro</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Management</p>
        </div>
        <h1 className="mt-6 text-lg font-semibold text-slate-800">Reset password</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a new password for your Weatherpro account.</p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
