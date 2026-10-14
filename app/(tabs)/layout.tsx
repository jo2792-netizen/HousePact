"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHouse } from "@/lib/store";

const TABS = [
  ["/", "Home"],
  ["/pact", "Pact"],
  ["/chores", "Chores"],
  ["/bills", "Bills"],
  ["/calendar", "Calendar"],
];

// Wraps every screen except Setup: sends first-time visitors to Setup and shows the bottom tabs.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const house = useHouse();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (house === null) router.replace("/setup");
  }, [house, router]);

  return (
    <>
      <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pt-8 pb-28 print:max-w-none print:p-0">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] print:hidden">
        <div className="mx-auto flex max-w-md">
          {TABS.map(([href, label]) => {
            const active = href === "/" ? path === "/" || path === "/info" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-1 items-center justify-center border-t-2 text-[15px] ${active ? "border-ink font-bold" : "border-transparent text-muted"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
