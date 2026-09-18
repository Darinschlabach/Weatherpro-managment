"use client";

import { useMemo } from "react";
import { firstNameFromDisplay, greetingForHour } from "@/lib/greeting";

type DashboardGreetingProps = {
  name: string;
};

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const firstName = firstNameFromDisplay(name);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
        {greeting}, {firstName}.
      </h1>
      <p className="mt-2 text-sm text-slate-500">Here&apos;s what&apos;s happening today.</p>
    </div>
  );
}
