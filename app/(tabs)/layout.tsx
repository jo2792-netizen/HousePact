"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon, type IconName } from "@/components/icons";
import { NavBar } from "@/components/ui";
import { useHouse } from "@/lib/store";

const TABS: [string, string, IconName][] = [
  ["/", "Home", "home"],
  ["/bills", "Bills", "bills"],
  ["/chores", "Chores", "chores"],
  ["/calendar", "Calendar", "calendar"],
  ["/more", "More", "more"],
];
// Screens reached from More, so the More tab stays selected on them
const UNDER_MORE = ["/more", "/pact", "/condition", "/info"];

// Every screen except Setup: a navigation bar with the logo, the screen, and a tab bar at the bottom of the phone.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const house = useHouse();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (house === null) router.replace("/setup");
  }, [house, router]);

  const isActive = (href: string) =>
    href === "/" ? path === "/" : href === "/more" ? UNDER_MORE.some((p) => path.startsWith(p)) : path.startsWith(href);

  return (
    <>
      <NavBar />
      <main className="flex flex-col gap-6 px-4 pt-4 pb-32 print:p-0">{children}</main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-separator bg-bg/85 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl print:hidden"
      >
        <div className="flex">
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
