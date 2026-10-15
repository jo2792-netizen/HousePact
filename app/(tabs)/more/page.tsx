"use client";

import Link from "next/link";
import { PageHeader } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { Logo } from "@/components/ui";
import { reset, useHouse } from "@/lib/store";

// Everything that isn't one of the four main tabs.
export default function More() {
  const h = useHouse();
  if (!h) return null;

  const signed = h.agreement.signatures.filter(Boolean).length;
  const openRepairs = (h.repairs ?? []).filter((r) => r.status !== "Fixed").length;
  const links: [string, string, string, IconName][] = [
    ["/pact", "Agreement", signed === h.mates.length ? "Fully executed" : `${signed} of ${h.mates.length} signed`, "agreement"],
    ["/condition", "Condition", openRepairs ? `${openRepairs} open repair${openRepairs === 1 ? "" : "s"} · Before photos` : "Before photos and repairs", "camera"],
    ["/info", "Apartment Info", "WiFi, contacts, and emergency info", "info"],
  ];

  return (
    <>
      <PageHeader title="More" />
      <nav aria-label="More" className="overflow-hidden rounded-2xl bg-surface">
        <ul className="divide-y divide-separator">
          {links.map(([href, label, detail, icon]) => (
            <li key={href}>
              <Link href={href} className="flex min-h-16 items-center gap-4 px-4 py-2 active:bg-fill">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-wash text-accent-ink">
                  <Icon name={icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{label}</span>
                  <span className="block truncate text-subhead text-secondary">{detail}</span>
                </span>
                <Icon name="chevron" className="size-5 shrink-0 text-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <button onClick={reset} className="flex min-h-14 items-center gap-4 rounded-2xl bg-surface px-4 text-left active:bg-fill">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-fill text-secondary">
          <Icon name="reset" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Reset Demo</span>
          <span className="block text-subhead text-secondary">Start over from the welcome screen</span>
        </span>
      </button>

      <div className="flex flex-col items-center gap-2 pt-4 text-center">
        <Logo />
        <p className="text-subhead text-secondary">No awkward conversations, just agree once.</p>
      </div>
    </>
  );
}
