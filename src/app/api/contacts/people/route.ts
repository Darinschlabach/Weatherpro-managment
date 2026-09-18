import { jsonError, nullableFormValue, readFormPayload, requireApiUser } from "@/lib/api-route";
import { isPersonPosition, mapContactsSchemaError, type PersonPosition } from "@/lib/contacts";
import { NextResponse } from "next/server";

function readPositions(formData: FormData) {
  return formData
    .getAll("positions")
    .map((value) => (typeof value === "string" ? value : ""))
    .filter(isPersonPosition);
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.error || !auth.supabase) return auth.error;

  const { formData, payload } = await readFormPayload(request);
  const contactId = typeof payload.contactId === "string" ? payload.contactId.trim() : "";
  const personId = typeof payload.personId === "string" ? payload.personId.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const positions: PersonPosition[] = readPositions(formData);

  if (!contactId) {
    return jsonError("Missing contact ID.");
  }
  if (!name) {
    return jsonError("Person name is required.");
  }

  const record = {
    contact_id: contactId,
    name,
    phone: nullableFormValue(typeof payload.phone === "string" ? payload.phone.trim() : ""),
    email: nullableFormValue(typeof payload.email === "string" ? payload.email.trim() : ""),
    positions,
  };

  if (personId) {
    const { error } = await auth.supabase.from("contact_people").update(record).eq("id", personId).eq("contact_id", contactId);
    if (error) {
      return jsonError(mapContactsSchemaError(error.message));
    }
    return NextResponse.json({ ok: true });
  }

  const { error } = await auth.supabase.from("contact_people").insert(record);
  if (error) {
    return jsonError(mapContactsSchemaError(error.message));
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.error || !auth.supabase) return auth.error;

  const { payload } = await readFormPayload(request);
  const contactId = typeof payload.contactId === "string" ? payload.contactId.trim() : "";
  const personId = typeof payload.personId === "string" ? payload.personId.trim() : "";
  if (!contactId || !personId) {
    return jsonError("Missing person ID.");
  }

  const { error } = await auth.supabase.from("contact_people").delete().eq("id", personId).eq("contact_id", contactId);
  if (error) {
    return jsonError(mapContactsSchemaError(error.message));
  }
  return NextResponse.json({ ok: true });
}
