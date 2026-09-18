import { createClient } from "@supabase/supabase-js";

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local (never commit this file).`);
    process.exit(1);
  }
  return value;
}

const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "Darin@shipshewanawoodworks.com").trim().toLowerCase();
const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim() ?? "";
const firstName = (process.env.BOOTSTRAP_ADMIN_FIRST_NAME ?? "Darin").trim();
const lastName = (process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? "").trim();
const displayName = [firstName, lastName].filter(Boolean).join(" ");
const resetPassword = process.env.BOOTSTRAP_RESET_PASSWORD === "true";

if (serviceRoleKey.startsWith("NEXT_PUBLIC_") || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
  console.error("The service role key must never be exposed through a NEXT_PUBLIC_ variable.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }
    const users = data?.users ?? [];
    const match = users.find((user) => (user.email ?? "").trim().toLowerCase() === email);
    if (match) {
      return match;
    }
    if (users.length < perPage) {
      return null;
    }
    page += 1;
  }
}

async function bootstrapAdmin() {
  const existing = await findUserByEmail(adminEmail);
  let user = existing;

  if (!user) {
    if (adminPassword.length < 8) {
      console.error("BOOTSTRAP_ADMIN_PASSWORD is required (min 8 characters) to create the first admin.");
      process.exit(1);
    }

    const created = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
      },
    });

    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Failed to create admin user.");
    }

    user = created.data.user;
    console.log("Created Weatherpro admin Auth user.");
  } else {
    console.log("Admin Auth user already exists. Profile will be verified/updated.");

    if (resetPassword) {
      if (adminPassword.length < 8) {
        console.error("BOOTSTRAP_RESET_PASSWORD=true requires BOOTSTRAP_ADMIN_PASSWORD (min 8 characters).");
        process.exit(1);
      }
      const updated = await supabase.auth.admin.updateUserById(user.id, { password: adminPassword });
      if (updated.error) {
        throw new Error(updated.error.message);
      }
      console.log("Admin password was reset because BOOTSTRAP_RESET_PASSWORD=true.");
    }
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: adminEmail,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName || firstName,
    role: "admin",
    is_active: true,
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  console.log("Weatherpro admin profile is ready.");
  console.log(`Email: ${adminEmail}`);
  console.log("Role: admin");
  console.log("Password was not written to the database or printed.");
}

bootstrapAdmin().catch((error) => {
  console.error(`Bootstrap failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
