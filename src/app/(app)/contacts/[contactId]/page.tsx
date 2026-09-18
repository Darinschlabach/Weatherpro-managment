import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ContactDetail } from "@/components/contacts/ContactDetail";
import { mapContactsSchemaError, parseContactPersonRow, parseContactRow } from "@/lib/contacts";

export const dynamic = "force-dynamic";

type ContactDetailPageProps = {
  params: Promise<{ contactId: string }>;
};

const CONTACT_SELECT_WITH_DOB =
  "id, name, email, phone, fax, address, date_of_birth, contact_type, created_at, updated_at";
const CONTACT_SELECT_WITHOUT_DOB = "id, name, email, phone, fax, address, contact_type, created_at, updated_at";

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  await requireUser();
  const { contactId } = await params;
  const supabase = await createSupabaseServerClient();

  let contactQuery = await supabase
    .from("contacts")
    .select(CONTACT_SELECT_WITH_DOB)
    .eq("id", contactId)
    .maybeSingle();

  if (contactQuery.error && /date_of_birth/i.test(contactQuery.error.message)) {
    contactQuery = await supabase
      .from("contacts")
      .select(CONTACT_SELECT_WITHOUT_DOB)
      .eq("id", contactId)
      .maybeSingle();
  }

  const { data: peopleRows } = await supabase
    .from("contact_people")
    .select("id, contact_id, name, phone, email, positions, created_at, updated_at")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });

  const { data: contactRow, error: contactError } = contactQuery;

  if (contactError) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {mapContactsSchemaError(contactError.message)}
      </p>
    );
  }
  if (!contactRow) {
    notFound();
  }

  const contact = parseContactRow(contactRow as Record<string, unknown>);
  if (!contact) {
    notFound();
  }

  const people = ((peopleRows ?? []) as Array<Record<string, unknown>>).flatMap((row) => {
    const person = parseContactPersonRow(row);
    return person ? [person] : [];
  });

  return (
    <ContactDetail
      contact={contact}
      people={people}
    />
  );
}
