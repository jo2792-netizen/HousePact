"use client";

import Link from "next/link";
import { useState } from "react";
import { DotPicker } from "@/components/ui";
import { EVENTS, debts, headsUp, isDone, money, time, upcoming, when } from "@/lib/house";
import { reset, update, useHouse } from "@/lib/store";

export default function Home() {
  const h = useHouse();
  const [copied, setCopied] = useState(false);
  if (!h) return null;

  const myChores = h.chores.filter((c) => c.who === h.me && !isDone(c)).length;
  const owed = debts(h);
  const iOwe = owed.filter((d) => d.from === h.me).reduce((sum, d) => sum + d.amount, 0);
  const owedToMe = owed.filter((d) => d.to === h.me).reduce((sum, d) => sum + d.amount, 0);
  const next = upcoming(h.events)[0];
  const quiet = headsUp(h.events);
  const article = (kind: string) => (/^[aeiou]/i.test(kind) ? "an" : "a");

  const copyWifi = () =>
    navigator.clipboard.writeText(h.info.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  return (
    <>
      <p className="-mb-4 text-muted">Hi, {h.mates[h.me]} 👋</p>
      <h1>{h.name}</h1>
      {/* Tap a dot to switch whose dashboard this is */}
      <DotPicker mates={h.mates} value={h.me} onChange={(me) => update({ me })} />

      {/* Heads-up when someone needs quiet in the next day, e.g. an interview */}
      {quiet && (
        <Link href="/calendar" className="card flex items-center gap-4 border-2 border-ink">
          <span className="text-3xl">{EVENTS[quiet.kind].emoji}</span>
          <div>
            <p className="font-semibold">
              {quiet.by === h.me ? "Hey, you have" : `${h.mates[quiet.by]} has`} {article(quiet.kind)} {quiet.kind.toLowerCase()}
            </p>
            <p className="text-sm text-muted">
              {when(quiet.start)}–{time(quiet.end)} · Keep it quiet
            </p>
          </div>
        </Link>
      )}

      <div className="divide-y divide-line rounded-xl bg-white px-4">
        {h.info.password ? (
          <div className="flex h-16 items-center gap-3">
            <span>WiFi</span>
            <span className="flex-1 text-right tracking-widest text-muted">••••••</span>
            <button onClick={copyWifi} className="h-10 rounded-full bg-paper px-4 font-semibold">
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        ) : (
          <Row label="WiFi" value="Add" href="/info" />
        )}
        <Row label="Trash" value={h.info.trash || "Add"} href="/info" />
        <Row
          label="Pact"
          value={h.agreed.length === h.mates.length ? "Signed ✓" : `${h.agreed.length}/${h.mates.length} agreed`}
          href="/pact"
        />
        <Row label="Your chores" value={myChores || "Done ✓"} href="/chores" />
        {iOwe ? (
          <Row label="You owe" value={money(iOwe)} href="/bills" alert />
        ) : (
          <Row label={owedToMe ? "You're owed" : "Bills"} value={owedToMe ? money(owedToMe) : "All settled"} href="/bills" />
        )}
        <Row label="Next" value={next ? `${EVENTS[next.kind].emoji} ${when(next.start)}` : "Nothing"} href="/calendar" />
        <Row label="Apartment info" value="›" href="/info" />
      </div>

      <button onClick={reset} className="self-center px-4 py-3 text-sm text-muted">
        Reset
      </button>
    </>
  );
}

function Row({ label, value, href, alert }: { label: string; value: string | number; href: string; alert?: boolean }) {
  return (
    <Link href={href} className="flex h-16 items-center justify-between gap-3">
      <span>{label}</span>
      <span className={alert ? "text-xl font-bold text-alert" : "font-semibold"}>{value}</span>
    </Link>
  );
}
