# Weatherpro Management

Internal business management software for Weatherpro.

This repository currently contains the **core foundation** plus the **Contacts** directory. Quotes, Invoices, Calendar, Inventory, Schedule, Catalogue, and the full Dashboard remain placeholders for later prompts.

## 1. Install dependencies

From the project root:

```bash
npm install
```

Requires Node.js 18 or newer.

## 2. Configure Supabase

In the [Supabase Dashboard](https://supabase.com/dashboard):

1. Open your Weatherpro project (or create one).
2. Go to **Project Settings → API**.
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public / publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Key distinction:

| Value | Environment variable | Where it may be used |
| --- | --- | --- |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Browser and server |
| anon / publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` | **Server and local bootstrap script only** |

**Never** put the service role key in a `NEXT_PUBLIC_` variable. That would expose it to the browser and allow anyone to administer your project.

Also in Supabase:

1. Go to **Authentication → Providers** and keep **Email** enabled.
2. Keep **Confirm email** enabled in production so invite and reset links are required.
3. Under **Authentication → URL Configuration**:
   - **Site URL:** `https://dashboard.weatherproinsulation.com`
   - **Redirect URLs:**
     - `https://dashboard.weatherproinsulation.com/**`
     - `http://localhost:3000/**`
4. Update the **Invite user** and **Reset password** email templates if needed (see the token_hash links in the implementation notes). Local development still uses `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

## 3. Set environment variables

Copy the example file:

```bash
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then add these **local-only bootstrap values** to `.env.local` (not to Git, not to `.env.example`):

```env
BOOTSTRAP_ADMIN_EMAIL=Darin@shipshewanawoodworks.com
BOOTSTRAP_ADMIN_PASSWORD=the-password-you-choose
BOOTSTRAP_ADMIN_FIRST_NAME=Darin
BOOTSTRAP_ADMIN_LAST_NAME=
```

`.env.local` is gitignored. Do not commit it.

## 4. Run migration 0001

The first migration file is:

`supabase/migrations/0001_initial_core.sql`

It creates the `profiles` table, role enum (`admin` / `user`), `updated_at` trigger, profile-creation trigger on `auth.users`, last-admin protection, and Row Level Security.

### Option A: Supabase SQL Editor

1. Open **SQL Editor** in your Supabase project.
2. Paste the full contents of `supabase/migrations/0001_initial_core.sql`.
3. Run it.

### Option B: Supabase CLI

If the CLI is installed and the project is linked:

```bash
npx supabase db push
```

Confirm in **Table Editor** that `profiles` exists and that RLS is enabled.

## 4b. Run migration 0002 (Contacts)

The Contacts module uses:

`supabase/migrations/0002_contacts.sql`

Run it the same way as 0001 (SQL Editor or `npx supabase db push`). Then confirm the `contacts` table exists.

## 4c. Run migration 0003 (Contact people)

The contact detail page uses date of birth and associated people:

`supabase/migrations/0003_contact_people.sql`

Run it the same way as 0001 and 0002. Then confirm `contacts.date_of_birth` and the `contact_people` table exist.

## 5. Securely create the initial Darin admin account

Do **not** put the password in SQL, seed files, or Git.

With `.env.local` populated as shown above, run:

```bash
npm run bootstrap:admin
```

This script:

- Reads the email/password from `.env.local`
- Uses the **server-only** service role key
- Creates the Auth user if it does not already exist
- Upserts an application profile with `role = admin` and `is_active = true`
- Does not print the password

If the Auth user already exists and you need to reset the password, add this temporary line to `.env.local` and run the script again:

```env
BOOTSTRAP_RESET_PASSWORD=true
```

Remove `BOOTSTRAP_RESET_PASSWORD` afterward.

## 6. Start the local development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated visitors are sent to `/login`.

## 7. Sign into Weatherpro

1. Go to `/login`.
2. Sign in with `Darin@shipshewanawoodworks.com` and the password you set during bootstrap.
3. You should land on `/dashboard` and see a greeting such as **Good evening, Darin.**

## 8. Verify the Admin module

1. Open **Admin** in the sidebar (or go to `/admin`).
2. Confirm your account appears in the user list with role **Admin** and status **Active**.
3. Confirm a non-admin cannot open `/admin` (they are redirected).

## 9. Add another test user

1. On `/admin`, click **+ Add User**.
2. Enter first name, last name, email, role (`User` or `Admin`), and a temporary password.
3. Save. The new user should appear in the table.
4. Sign out and sign in as the test user to confirm a normal user can use the app but cannot access Admin.

User creation runs on the server through a privileged server action. The service role key never ships to the browser.

## 10. Connect / push to GitHub

If this folder is not a Git repository yet:

```bash
git init
git add .
git commit -m "Add Weatherpro core foundation"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Use your actual GitHub repository URL. Confirm `.env.local` is not included in `git status`.

## Useful commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run bootstrap:admin
```

## Project notes

- Protected routes are enforced in middleware and again in server layouts/pages.
- Admin routes require `profiles.role = 'admin'`.
- The last remaining active administrator cannot be deactivated or demoted.
- Passwords are stored only by Supabase Auth, never in `profiles`.
