"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Logo, NavBar } from "@/components/ui";
import { reset, useHouse } from "@/lib/store";

const TABS: [string, string, IconName][] = [
  ["/", "Home", "home"],
  ["/pact", "Agreement", "agreement"],
  ["/chores", "Chores", "chores"],
  ["/bills", "Bills", "bills"],
  ["/calendar", "Calendar", "calendar"],
];

// Wraps every screen except Setup: sends first-time visitors to Setup. Phones get a top
// navigation bar and a bottom tab bar; larger screens get a sidebar.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const house = useHouse();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (house === null) router.replace("/setup");
  }, [house, router]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      {/* Phones: navigation bar with the logo */}
      <div className="md:hidden">
        <NavBar />
      </div>

      {/* Tablets and laptops: sidebar with the logo at the top */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col gap-6 border-r border-separator bg-surface p-4 md:flex print:hidden">
        <div className="flex h-11 items-center px-2">
          <Logo />
        </div>
        {house && (
          <div className="px-2">
            <p className="font-semibold">{house.name}</p>
            <p className="text-subhead text-secondary">{house.mates.length} roommates</p>
          </div>
        )}
        <nav aria-label="Main" className="flex flex-col gap-1">
          {[...TABS, ["/info", "Apartment Info", "info"] as [string, string, IconName]].map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex h-11 items-center gap-4 rounded-xl px-2 ${isActive(href) ? "bg-accent-wash font-semibold text-label" : "text-secondary hover:bg-fill hover:text-label"}`}
            >
              <Icon name={icon} className={isActive(href) ? "size-5 text-accent-ink" : "size-5"} />
              {label}
            </Link>
          ))}
        </nav>
        <button onClick={reset} className="mt-auto flex h-11 items-center gap-4 rounded-xl px-2 text-subhead text-secondary hover:bg-fill hover:text-label">
          <Icon name="reset" />
          Reset Demo
        </button>
      </aside>

      <div className="md:pl-64 print:pl-0">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 pb-32 md:px-8 md:pt-8 md:pb-16 print:max-w-none print:p-0">{children}</main>
      </div>

      {/* Phones: tab bar, above the home indicator */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-separator bg-bg/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden print:hidden"
      >
        <div className="flex px-[env(safe-area-inset-left)]">
          {TABS.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex h-14 min-w-11 flex-1 flex-col items-center justify-center gap-1 text-caption ${isActive(href) ? "font-semibold text-accent-ink" : "text-secondary"}`}
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
