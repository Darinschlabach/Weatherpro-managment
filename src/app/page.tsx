import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getEnvConfigurationHint, getPublicEnvOrNull } from "@/lib/env";
import { MissingConfig } from "@/components/setup/MissingConfig";

export default async function HomePage() {
  if (!getPublicEnvOrNull()) {
    return <MissingConfig hint={getEnvConfigurationHint()} />;
  }

  const { user } = await getSessionUser();
  redirect(user ? "/dashboard" : "/login");
}
