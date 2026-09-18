export const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/invoices", label: "Invoices", icon: "invoices" },
  { href: "/quotes", label: "Quotes", icon: "quotes" },
  { href: "/contacts", label: "Contacts", icon: "contacts" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/inventory", label: "Inventory", icon: "inventory" },
  { href: "/schedule", label: "Schedule", icon: "schedule" },
] as const;

export const settingsNavItems = [
  { href: "/catalogue", label: "Catalogue", icon: "catalogue" },
  { href: "/admin", label: "Admin", icon: "admin" },
] as const;

export type NavIconName =
  | (typeof mainNavItems)[number]["icon"]
  | (typeof settingsNavItems)[number]["icon"];

export function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
