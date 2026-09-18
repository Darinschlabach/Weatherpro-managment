export const contactTypes = ["Contractors", "Customers", "Employees", "Vendors"] as const;
export const personPositions = ["owner", "designer", "receptionist", "accounting", "installation"] as const;

export type ContactType = (typeof contactTypes)[number];
export type PersonPosition = (typeof personPositions)[number];

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  fax: string | null;
  address: string | null;
  date_of_birth: string | null;
  contact_type: ContactType;
  created_at: string;
  updated_at: string;
};

export type ContactPerson = {
  id: string;
  contact_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  positions: PersonPosition[];
  created_at: string;
  updated_at: string;
};

export const contactTypeFilters = ["All", ...contactTypes] as const;
export type ContactTypeFilter = (typeof contactTypeFilters)[number];

export function isContactType(value: string): value is ContactType {
  return (contactTypes as readonly string[]).includes(value);
}

export function isPersonPosition(value: string): value is PersonPosition {
  return (personPositions as readonly string[]).includes(value);
}

export function contactInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

const avatarPalettes = [
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-emerald-100", text: "text-emerald-800" },
  { bg: "bg-violet-100", text: "text-violet-800" },
  { bg: "bg-rose-100", text: "text-rose-800" },
  { bg: "bg-cyan-100", text: "text-cyan-800" },
] as const;

export function contactAvatarPalette(name: string) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarPalettes[hash % avatarPalettes.length] ?? avatarPalettes[0];
}

export function contactSubtitle(contact: Pick<Contact, "email" | "phone">) {
  return [contact.email, contact.phone].filter(Boolean).join(" · ");
}

export function googleMapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : "—";
}

export function formatBirthDate(value: string | null | undefined) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return displayValue(value);
  return `${Number(match[2])}/${Number(match[3])}/${match[1]}`;
}

export function positionLabel(position: PersonPosition) {
  return position.charAt(0).toUpperCase() + position.slice(1);
}

export function formatPositions(positions: PersonPosition[]) {
  return positions.map(positionLabel).join(" / ");
}

export function parseContactRow(row: Record<string, unknown>): Contact | null {
  const contactType = typeof row.contact_type === "string" ? row.contact_type : "";
  if (!isContactType(contactType) || row.id == null) {
    return null;
  }
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: typeof row.email === "string" ? row.email : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    fax: typeof row.fax === "string" ? row.fax : null,
    address: typeof row.address === "string" ? row.address : null,
    date_of_birth: typeof row.date_of_birth === "string" ? row.date_of_birth : null,
    contact_type: contactType,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function parseContactPersonRow(row: Record<string, unknown>): ContactPerson | null {
  if (row.id == null || row.contact_id == null) return null;
  const positions = Array.isArray(row.positions)
    ? row.positions.filter((value): value is PersonPosition => typeof value === "string" && isPersonPosition(value))
    : [];
  return {
    id: String(row.id),
    contact_id: String(row.contact_id),
    name: String(row.name ?? ""),
    phone: typeof row.phone === "string" ? row.phone : null,
    email: typeof row.email === "string" ? row.email : null,
    positions,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function mapContactsSchemaError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("contact_people") && (lower.includes("schema cache") || lower.includes("does not exist"))) {
    return "The associated people table is missing. Run supabase/migrations/0003_contact_people.sql in the Supabase SQL Editor, then refresh.";
  }
  if (lower.includes("date_of_birth") && (lower.includes("column") || lower.includes("schema cache") || lower.includes("does not exist"))) {
    return "A contacts update is missing. Run supabase/migrations/0003_contact_people.sql in the Supabase SQL Editor, then refresh.";
  }
  if (lower.includes("schema cache") || lower.includes("could not find the table") || lower.includes("does not exist")) {
    return "The contacts table is missing. Run supabase/migrations/0002_contacts.sql in the Supabase SQL Editor, then refresh.";
  }
  return message;
}
