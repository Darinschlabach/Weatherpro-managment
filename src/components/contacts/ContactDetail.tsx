"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContactAvatar } from "@/components/contacts/ContactAvatar";
import { contactInputClassName } from "@/components/contacts/ContactFormDialog";
import {
  contactTypes,
  displayValue,
  formatBirthDate,
  formatPositions,
  personPositions,
  positionLabel,
  type Contact,
  type ContactPerson,
} from "@/lib/contacts";

type ContactDetailProps = {
  contact: Contact;
  people: ContactPerson[];
};

async function postForm(url: string, formData: FormData, method: "POST" | "DELETE" = "POST") {
  const response = await fetch(url, { method, body: formData });
  const result = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Unable to save.");
  }
}

export function ContactDetail({ contact, people }: ContactDetailProps) {
  const router = useRouter();
  const [editingDetails, setEditingDetails] = useState(false);
  const [personForm, setPersonForm] = useState<"create" | ContactPerson | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function run(task: () => Promise<void>) {
    startTransition(async () => {
      try {
        await task();
        setError("");
        router.refresh();
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to save.");
      }
    });
  }

  return (
    <div>
      <Link href="/contacts" className="text-sm text-slate-500 hover:text-slate-700">
        ← All contacts
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ContactAvatar name={contact.name} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">{contact.name}</h1>
            <p className="text-sm text-slate-500">{contact.contact_type}</p>
          </div>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
            const formData = new FormData();
            formData.set("contactId", contact.id);
            run(async () => {
              await postForm("/api/contacts", formData, "DELETE");
              router.push("/contacts");
            });
          }}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-70"
        >
          Delete contact
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          {editingDetails ? (
            <ContactDetailsForm
              contact={contact}
              pending={isPending}
              onCancel={() => setEditingDetails(false)}
              onSubmit={(formData) => {
                formData.set("contactId", contact.id);
                run(async () => {
                  await postForm("/api/contacts", formData);
                  setEditingDetails(false);
                });
              }}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact details</h2>
                <button
                  type="button"
                  onClick={() => setEditingDetails(true)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  Edit
                </button>
              </div>
              <dl className="space-y-4">
                <DetailField label="Contact name" value={displayValue(contact.name)} />
                <DetailField label="Email" value={displayValue(contact.email)} />
                <DetailField label="Phone" value={displayValue(contact.phone)} />
                <DetailField label="Date of birth" value={formatBirthDate(contact.date_of_birth)} />
                <DetailField label="Fax" value={displayValue(contact.fax)} />
                <DetailField label="Address" value={displayValue(contact.address)} />
                <DetailField label="Contact type" value={contact.contact_type} />
              </dl>
            </>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          {personForm ? (
            <PersonForm
              contactId={contact.id}
              person={personForm === "create" ? null : personForm}
              pending={isPending}
              onCancel={() => setPersonForm(null)}
              onSubmit={(formData) => {
                formData.set("contactId", contact.id);
                run(async () => {
                  await postForm("/api/contacts/people", formData);
                  setPersonForm(null);
                });
              }}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Associated people</h2>
                <button
                  type="button"
                  onClick={() => setPersonForm("create")}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  + Add person
                </button>
              </div>
              {people.length === 0 ? (
                <p className="text-sm text-slate-500">No associated people yet. Click &quot;+ Add person&quot; to add one.</p>
              ) : (
                <ul className="space-y-3">
                  {people.map((person) => (
                    <li key={person.id} className="rounded-lg border border-slate-100 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{person.name}</p>
                          <p className="mt-0.5 text-sm text-slate-500">{contactSubtitleLine(person)}</p>
                          {person.positions.length > 0 ? (
                            <p className="mt-1 text-xs text-slate-500">{formatPositions(person.positions)}</p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPersonForm(person)}
                            className="text-sm font-medium text-brand-700 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const formData = new FormData();
                              formData.set("contactId", contact.id);
                              formData.set("personId", person.id);
                              run(async () => {
                                await postForm("/api/contacts/people", formData, "DELETE");
                              });
                            }}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function contactSubtitleLine(person: ContactPerson) {
  return [person.phone, person.email].filter(Boolean).join(" · ") || "—";
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function ContactDetailsForm({
  contact,
  pending,
  onCancel,
  onSubmit,
}: {
  contact: Contact;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Contact details</h2>
      <Field id="detail-name" name="name" label="Contact Name" defaultValue={contact.name} required />
      <Field id="detail-email" name="email" label="Email" type="email" defaultValue={contact.email ?? ""} />
      <Field id="detail-phone" name="phone" label="Phone" defaultValue={contact.phone ?? ""} />
      <Field
        id="detail-dob"
        name="dateOfBirth"
        label="Date of Birth"
        type="date"
        defaultValue={contact.date_of_birth?.slice(0, 10) ?? ""}
      />
      <Field id="detail-fax" name="fax" label="Fax" defaultValue={contact.fax ?? ""} />
      <Field id="detail-address" name="address" label="Address" defaultValue={contact.address ?? ""} />
      <div>
        <label htmlFor="detail-type" className="mb-1.5 block text-sm font-medium text-slate-800">
          Contact Type
        </label>
        <select id="detail-type" name="contactType" defaultValue={contact.contact_type} className={contactInputClassName}>
          {contactTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PersonForm({
  contactId,
  person,
  pending,
  onCancel,
  onSubmit,
}: {
  contactId: string;
  person: ContactPerson | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Associated people</h2>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-4 text-sm font-medium text-slate-800">{person ? "Edit person" : "New person"}</p>
        {person ? <input type="hidden" name="personId" value={person.id} /> : null}
        <input type="hidden" name="contactId" value={contactId} />
        <div className="space-y-4">
          <Field id="person-name" name="name" label="Name" defaultValue={person?.name ?? ""} required />
          <Field id="person-phone" name="phone" label="Phone" defaultValue={person?.phone ?? ""} />
          <Field id="person-email" name="email" label="Email" type="email" defaultValue={person?.email ?? ""} />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-800">Position</legend>
            <div className="space-y-2">
              {personPositions.map((position) => (
                <label key={position} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="positions"
                    value={position}
                    defaultChecked={person?.positions.includes(position) ?? false}
                    className="h-4 w-4 rounded border-slate-300 accent-brand-700"
                  />
                  {positionLabel(position)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
          >
            {pending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
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
