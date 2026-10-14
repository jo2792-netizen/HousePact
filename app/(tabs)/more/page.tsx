"use client";

import Link from "next/link";
import { PageHeader } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { reset, useHouse } from "@/lib/store";

// Phones show five tabs; everything else lives here (larger screens list it all in the sidebar).
const LINKS: [string, string, string, IconName][] = [
  ["/calendar", "Calendar", "Plans that affect the house", "calendar"],
  ["/condition", "Condition", "Before photos and notes by room", "camera"],
  ["/repairs", "Repairs", "What needs fixing and what it costs", "wrench"],
  ["/info", "Apartment Info", "WiFi, contacts, and emergency info", "info"],
];

export default function More() {
  const h = useHouse();
  if (!h) return null;

  return (
    <>
      <PageHeader title="More" />
      <nav aria-label="More" className="overflow-hidden rounded-2xl bg-surface">
        <ul className="divide-y divide-separator">
          {LINKS.map(([href, label, help, icon]) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-4 px-4 py-2 hover:bg-fill">
                <Icon name={icon} className="size-6 shrink-0 text-secondary" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-subhead text-secondary">{help}</span>
                </span>
                <Icon name="chevron" className="size-5 shrink-0 text-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button onClick={reset} className="flex h-11 items-center gap-2 self-center px-4 text-subhead text-secondary">
        <Icon name="reset" className="size-4" />
        Reset Demo
      </button>
    </>
  );
}
