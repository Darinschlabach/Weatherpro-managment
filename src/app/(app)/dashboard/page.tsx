import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { requireUser } from "@/lib/auth";
import { profileDisplayName } from "@/lib/roles";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { profile, user } = await requireUser();
  const params = (await searchParams) ?? {};
  const error = typeof params.error === "string" ? params.error : "";
  const name = profileDisplayName({ ...profile, email: user.email ?? profile.email });

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <DashboardGreeting name={name} />
    </div>
  );
}
