import { contactAvatarPalette, contactInitials } from "@/lib/contacts";

export function ContactAvatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const palette = contactAvatarPalette(name);
  const sizeClass = size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} ${palette.bg} ${palette.text}`}
      aria-hidden="true"
    >
      {contactInitials(name)}
    </span>
  );
}
