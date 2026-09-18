import { jsonError, nullableFormValue, readFormPayload, requireApiUser } from "@/lib/api-route";
import { isContactType, mapContactsSchemaError } from "@/lib/contacts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.error || !auth.supabase) return auth.error;

  const { payload } = await readFormPayload(request);
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const contactType = typeof payload.contactType === "string" ? payload.contactType.trim() : "";
  const contactId = typeof payload.contactId === "string" ? payload.contactId.trim() : "";

  if (!name) {
    return jsonError("Contact name is required.");
  }
  if (!isContactType(contactType)) {
    return jsonError("Select a valid contact type.");
  }

  const record: {
    name: string;
    email: string | null;
    phone: string | null;
    fax: string | null;
    address: string | null;
    contact_type: typeof contactType;
    date_of_birth?: string | null;
  } = {
    name,
    email: nullableFormValue(typeof payload.email === "string" ? payload.email.trim() : ""),
    phone: nullableFormValue(typeof payload.phone === "string" ? payload.phone.trim() : ""),
    fax: nullableFormValue(typeof payload.fax === "string" ? payload.fax.trim() : ""),
    address: nullableFormValue(typeof payload.address === "string" ? payload.address.trim() : ""),
    contact_type: contactType,
  };

  if (typeof payload.dateOfBirth === "string") {
    record.date_of_birth = nullableFormValue(payload.dateOfBirth.trim());
  }

  if (contactId) {
    const { error } = await auth.supabase.from("contacts").update(record).eq("id", contactId);
    if (error) {
      return jsonError(mapContactsSchemaError(error.message));
    }
    return NextResponse.json({ ok: true, id: contactId });
  }

  const { data, error } = await auth.supabase.from("contacts").insert(record).select("id").maybeSingle();
  if (error) {
    return jsonError(mapContactsSchemaError(error.message));
  }
  return NextResponse.json({ ok: true, id: data && typeof data.id === "string" ? data.id : undefined });
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.error || !auth.supabase) return auth.error;

  const { payload } = await readFormPayload(request);
  const contactId = typeof payload.contactId === "string" ? payload.contactId.trim() : "";
  if (!contactId) {
    return jsonError("Missing contact ID.");
  }

  const { error } = await auth.supabase.from("contacts").delete().eq("id", contactId);
  if (error) {
    return jsonError(mapContactsSchemaError(error.message));
  }
  return NextResponse.json({ ok: true });
}
