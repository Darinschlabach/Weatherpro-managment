import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ContactsBoard } from "@/components/contacts/ContactsBoard";
import { parseContactRow } from "@/lib/contacts";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  let loadError: string | undefined;
  let rows: Array<Record<string, unknown>> = [];

  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, name, email, phone, fax, address, contact_type, created_at, updated_at")
      .order("name", { ascending: true });

    if (error) {
      const message = error.message.toLowerCase();
      loadError =
        message.includes("schema cache") || message.includes("could not find the table") || message.includes("does not exist")
          ? "The contacts table is missing. Run supabase/migrations/0002_contacts.sql in the Supabase SQL Editor, then refresh."
          : `Failed to load contacts: ${error.message}`;
    } else {
      rows = (data ?? []) as Array<Record<string, unknown>>;
    }
  } catch (caughtError) {
    loadError = caughtError instanceof Error ? caughtError.message : "Failed to load contacts.";
  }

  const contacts = rows.flatMap((row) => {
    const contact = parseContactRow(row);
    return contact ? [contact] : [];
  });

  return (
    <ContactsBoard
      contacts={contacts}
      loadError={loadError}
    />
  );
}
