import {
  BookOpen,
  Boxes,
  Calendar,
  CalendarClock,
  FilePenLine,
  FileText,
  LayoutDashboard,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName } from "@/lib/navigation";

const icons: Record<NavIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  invoices: FileText,
  quotes: FilePenLine,
  contacts: Users,
  calendar: Calendar,
  inventory: Boxes,
  schedule: CalendarClock,
  catalogue: BookOpen,
  admin: Shield,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon className={className ?? "h-4 w-4"} aria-hidden="true" />;
}
