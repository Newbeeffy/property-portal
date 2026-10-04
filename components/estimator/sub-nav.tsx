"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/estimator", label: "Estimate" },
  { href: "/estimator/history", label: "History" },
  { href: "/estimator/compare", label: "Compare" },
];

export function EstimatorSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b px-6">
      {tabs.map((tab) => {
        const active =
          tab.href === "/estimator"
            ? pathname === "/estimator"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
