"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { RequireAdmin } from "@/features/auth";
import { cn } from "@/lib/utils";

/** Remembers the rail state per browser; a per-viewer convenience, nothing more. */
const COLLAPSE_KEY = "qb:admin:sidebarCollapsed";

/**
 * The admin shell: a fixed sidebar from `lg`, an icon rail when collapsed, and
 * the whole thing inside a sheet on smaller screens.
 *
 * RequireAdmin wraps the content rather than the chrome, so an admin who lacks
 * one module's permission gets the 403 inside the panel — still able to reach
 * everything else — instead of being thrown back to a login screen.
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      setIsCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Private windows can refuse storage; the default is fine.
    }
  }, []);

  const toggle = () => {
    setIsCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // Not worth telling anybody about.
      }
      return next;
    });
  };

  return (
    <div className="min-h-dvh bg-cream">
      <AdminTopbar isCollapsed={isCollapsed} onToggleCollapsed={toggle} />

      <div className="flex">
        {/* Tablet and up: a persistent rail, icon-only when collapsed. */}
        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 border-r border-hairline bg-surface transition-[width] duration-150 lg:block",
            isCollapsed ? "w-14" : "w-56",
          )}
        >
          <AdminSidebar isCollapsed={isCollapsed} onToggle={toggle} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <RequireAdmin>{children}</RequireAdmin>
        </main>
      </div>
    </div>
  );
}
