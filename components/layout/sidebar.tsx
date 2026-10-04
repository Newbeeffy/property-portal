"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/estimator", label: "Property Estimator", icon: Calculator },
  { href: "/analysis", label: "Market Analysis", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Home className="h-5 w-5" />
        <span className="text-sm font-semibold">Property Portal</span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
