import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-6">
      <div className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-sm">
        <div className="text-center">
          <p className="text-[28px] font-semibold leading-none tracking-tight text-brand-800">Weatherpro</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Management</p>
        </div>
        <h1 className="mt-6 text-lg font-semibold text-slate-800">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email and we will send a password reset link.</p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
