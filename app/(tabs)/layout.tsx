"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/agreement";
import { Icon, type IconName } from "@/components/icons";
import { reset, useHouse } from "@/lib/store";

const TABS: [string, string, IconName][] = [
  ["/", "Home", "home"],
  ["/pact", "Agreement", "agreement"],
  ["/chores", "Chores", "chores"],
  ["/bills", "Bills", "bills"],
  ["/calendar", "Calendar", "calendar"],
];

// Wraps every screen except Setup: sends first-time visitors to Setup, and shows a
// sidebar on larger screens or a bottom tab bar on phones.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const house = useHouse();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (house === null) router.replace("/setup");
  }, [house, router]);

  const isActive = (href: string) => (href === "/" ? path === "/" || path === "/info" : path.startsWith(href));

  return (
    <>
      {/* Sidebar (tablet and up) */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-line bg-white p-4 md:flex print:hidden">
        <div className="flex items-center gap-2 px-2 py-2 font-heading text-lg font-semibold">
          <Logo />
          Housepact
        </div>
        {house && (
          <div className="mt-4 rounded-xl bg-paper px-3 py-3">
            <p className="font-semibold">{house.name}</p>
            <p className="text-sm text-muted">{house.mates.length} roommates</p>
          </div>
        )}
        <nav className="mt-4 flex flex-col gap-1">
          {TABS.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex h-11 items-center gap-3 rounded-xl px-3 ${isActive(href) ? "bg-ink font-semibold text-white" : "text-muted hover:bg-paper hover:text-ink"}`}
            >
              <Icon name={icon} />
              {label}
            </Link>
          ))}
          <Link
            href="/info"
            className={`flex h-11 items-center gap-3 rounded-xl px-3 ${path === "/info" ? "bg-paper font-semibold" : "text-muted hover:bg-paper hover:text-ink"}`}
          >
            <Icon name="info" />
            Apartment info
          </Link>
        </nav>
        <button onClick={reset} className="mt-auto flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-paper hover:text-ink">
          <Icon name="reset" />
          Reset demo
        </button>
      </aside>

      <div className="md:pl-60 print:pl-0">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-12 print:max-w-none print:p-0">{children}</main>
      </div>

      {/* Bottom tabs (phones) */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden print:hidden">
        <div className="flex">
          {TABS.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-sm ${isActive(href) ? "font-semibold text-ink" : "text-muted"}`}
            >
              <Icon name={icon} className="size-6" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
