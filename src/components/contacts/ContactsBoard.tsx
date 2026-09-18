"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Plus, X } from "lucide-react";
import { ContactAvatar } from "@/components/contacts/ContactAvatar";
import { ContactFormDialog, contactInputClassName } from "@/components/contacts/ContactFormDialog";
import {
  contactSubtitle,
  contactTypeFilters,
  contactTypes,
  googleMapsUrl,
  type Contact,
  type ContactTypeFilter,
} from "@/lib/contacts";

type ContactsBoardProps = {
  contacts: Contact[];
  loadError?: string;
};

export function ContactsBoard({ contacts, loadError }: ContactsBoardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ContactTypeFilter>("All");
  const [mapOpen, setMapOpen] = useState(false);
  const [dialog, setDialog] = useState<"create" | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return contacts
      .filter((contact) => (filter === "All" ? true : contact.contact_type === filter))
      .filter((contact) => {
        if (!needle) return true;
        const haystack = [contact.name, contact.email, contact.phone, contact.fax, contact.address]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, filter, query]);

  const mappedContacts = useMemo(
    () => filtered.filter((contact) => Boolean(contact.address?.trim())),
    [filtered],
  );

  function refreshAfterSave(contactId?: string) {
    setError("");
    setDialog(null);
    if (contactId) {
      router.push(`/contacts/${contactId}`);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-800">Contacts</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMapOpen((open) => !open)}
            aria-pressed={mapOpen}
            aria-label={mapOpen ? "Hide contact map" : "Show contact map"}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border text-slate-600 ${
              mapOpen ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <MapPin className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setDialog("create");
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New contact
          </button>
        </div>
      </div>

      <label htmlFor="contact-search" className="sr-only">
        Search contacts
      </label>
      <input
        id="contact-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search contacts..."
        className="mt-5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none ring-brand-600 placeholder:text-slate-400 focus:ring-2"
      />

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Contact types">
        {contactTypeFilters.map((item) => {
          const active = filter === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(item)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                active ? "bg-brand-800 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {loadError ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      ) : null}

      {mapOpen ? (
        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-medium text-slate-800">Addresses</p>
            <button
              type="button"
              onClick={() => setMapOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50"
              aria-label="Close map"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {mappedContacts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No mapped addresses in this view.</p>
          ) : (
            <ul>
              {mappedContacts.map((contact) => (
                <li key={contact.id} className="flex items-start justify-between gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{contact.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{contact.address}</p>
                  </div>
                  <a
                    href={googleMapsUrl(contact.address ?? "")}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-sm font-medium text-brand-700 hover:underline"
                  >
                    Open in Maps
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-5 space-y-3">
          {filtered.map((contact) => {
            const subtitle = contactSubtitle(contact);
            return (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-[0_1px_0_rgba(15,23,42,0.02)] hover:bg-slate-50"
              >
                <ContactAvatar name={contact.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-800">{contact.name}</span>
                  {subtitle ? <span className="mt-0.5 block truncate text-sm text-slate-500">{subtitle}</span> : null}
                </span>
              </Link>
            );
          })}
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              {contacts.length === 0 ? "No contacts yet. Add one to get started." : "No contacts match this search."}
            </p>
          ) : null}
        </section>
      )}

      <ContactEditorDialog
        mode={dialog === "create" ? "create" : null}
        pending={isPending}
        onClose={() => setDialog(null)}
        onSubmit={(formData) => {
          startTransition(async () => {
            const response = await fetch("/api/contacts", {
              method: "POST",
              body: formData,
            });
            const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; id?: string } | null;
            if (!response.ok || !result?.ok) {
              setError(result?.error || "Unable to save this contact.");
              return;
            }
            refreshAfterSave(result.id);
          });
        }}
      />
    </div>
  );
}

function ContactEditorDialog({
  mode,
  pending,
  onClose,
  onSubmit,
}: {
  mode: "create" | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const open = mode !== null;

  return (
    <ContactFormDialog title="New contact" open={open} onClose={onClose}>
      {open ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
        >
          <Field id="contact-name" name="name" label="Contact Name" required />
          <Field id="contact-email" name="email" label="Email" type="email" />
          <Field id="contact-phone" name="phone" label="Phone" />
          <Field id="contact-fax" name="fax" label="Fax" />
          <Field id="contact-address" name="address" label="Address" />
          <div>
            <label htmlFor="contact-type" className="mb-1.5 block text-sm font-medium text-slate-800">
              Contact Type
            </label>
            <select
              id="contact-type"
              name="contactType"
              defaultValue="Customers"
              className={contactInputClassName}
            >
              {contactTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
            >
              {pending ? "Saving..." : "Create contact"}
            </button>
          </div>
        </form>
      ) : null}
    </ContactFormDialog>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={contactInputClassName}
      />
    </div>
  );
}
