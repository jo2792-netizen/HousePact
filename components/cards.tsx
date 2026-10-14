"use client";

// Dashboard building blocks shared by Home and the tabs.
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Dot } from "@/components/ui";
import { EVENTS, HOUSEPACT, MOODS, clashWith, day, googleCalendarLink, isDone, money, rentStatus, time, when } from "@/lib/house";
import { update, type Bill, type CalEvent, type House } from "@/lib/store";

const DAY = 24 * 60 * 60 * 1000;
const toggleIn = (list: number[], i: number) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);
const shortDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1>{title}</h1>
        {subtitle && <p className="mt-1 text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="btn w-auto" onClick={onClick}>
      <Icon name="plus" />
      {label}
    </button>
  );
}

export function Card({ title, icon, action, children, className = "" }: {
  title: string;
  icon: IconName;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-2 flex min-h-11 items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-body font-semibold">
          <Icon name={icon} className="size-5 text-secondary" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SeeAll({ href, label = "See All" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="link shrink-0 text-subhead">
      {label}
      <Icon name="chevron" className="size-4" />
    </Link>
  );
}

/** A summary number. */
export function Stat({ label, value, sub, href, alert }: { label: string; value: string; sub: string; href?: string; alert?: boolean }) {
  const body = (
    <>
      <p className="text-subhead text-secondary">{label}</p>
      <p className={`mt-1 text-title2 font-bold ${alert ? "text-danger" : ""}`}>{value}</p>
      <p className="truncate text-subhead text-secondary">{sub}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-2xl bg-surface p-4 transition hover:bg-fill">
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl bg-surface p-4">{body}</div>
  );
}

/** A green "Paid" or "Done" tag with a checkmark, or a gray "Due" tag. Never color alone. */
function StatusTag({ done, doneLabel, todoLabel }: { done: boolean; doneLabel: string; todoLabel: string }) {
  return done ? (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-success-wash px-2 py-1 text-subhead font-semibold text-success">
      <Icon name="check" className="size-4" />
      {doneLabel}
    </span>
  ) : (
    <span className="shrink-0 rounded-md bg-fill px-2 py-1 text-subhead font-semibold text-secondary">{todoLabel}</span>
  );
}

/** This month's rent: your share, when it's due, and who has paid. */
export function RentCard({ h }: { h: House }) {
  const r = rentStatus(h);
  const collector = r.collector >= 0 ? r.collector : null;
  const collected = r.paid.reduce((sum, i) => sum + r.shares[i], 0);
  const mePaid = r.paid.includes(h.me);
  const instruction =
    collector === null
      ? `Pay the landlord directly by ${shortDate(r.payBy)}.`
      : collector === h.me
        ? `You collect everyone's share and pay the landlord ${money(r.total)}.`
        : `Pay ${h.mates[collector]} by ${shortDate(r.payBy)}.`;

  return (
    <Card
      title={`${r.due.toLocaleDateString("en-US", { month: "long" })} Rent`}
      icon="dollar"
      action={<span className="text-subhead text-secondary">Due {shortDate(r.due)}</span>}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-title1 font-bold">{money(r.shares[h.me])}</p>
          <p className="text-subhead text-secondary">Your share. {instruction}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-title3 font-semibold">{r.days === 0 ? "Today" : `${r.days} day${r.days === 1 ? "" : "s"}`}</p>
          <p className="text-subhead text-secondary">until due</p>
        </div>
      </div>

      <div className="mt-4">
        <div
          className="h-2 rounded-full bg-fill"
          role="progressbar"
          aria-label="Rent collected"
          aria-valuemin={0}
          aria-valuemax={r.total}
          aria-valuenow={collected}
        >
          <div className="h-2 rounded-full bg-success transition-all" style={{ width: `${(collected / r.total) * 100}%` }} />
        </div>
        <p className="mt-2 text-subhead text-secondary">
          {money(collected)} of {money(r.total)} paid · {r.paid.length} of {h.mates.length} roommates
        </p>
      </div>

      <ul className="mt-2 divide-y divide-separator">
        {h.mates.map((name, i) => (
          <li key={i} className="flex min-h-14 items-center gap-4 py-2">
            <Dot name={name} />
            <span className="min-w-0 flex-1 truncate">{i === h.me ? `${name} (You)` : name}</span>
            <span className="font-semibold tabular-nums">{money(r.shares[i])}</span>
            <StatusTag done={r.paid.includes(i)} doneLabel="Paid" todoLabel="Due" />
          </li>
        ))}
      </ul>

      <button
        className={`mt-4 ${mePaid ? "btn-secondary" : "btn"}`}
        onClick={() => update({ rentPaid: { ...h.rentPaid, [r.month]: toggleIn(r.paid, h.me) } })}
      >
        {mePaid ? "Mark Share as Unpaid" : "Mark Share as Paid"}
      </button>
    </Card>
  );
}

/** One chore with a checkbox. Checking logs who did it and when; unchecking undoes it. */
export function ChoreRow({ h, i }: { h: House; i: number }) {
  const c = h.chores[i];
  const done = isDone(c);
  const toggle = () =>
    update({
      chores: h.chores.map((x, j) =>
        j !== i ? x : done ? { ...x, doneBy: undefined, doneAt: undefined } : { ...x, doneBy: h.me, doneAt: new Date().toISOString() },
      ),
    });
  const who = c.who === h.me ? "You" : h.mates[c.who];

  return (
    <li className="flex min-h-14 items-center gap-4 py-2">
      <button
        role="checkbox"
        aria-checked={done}
        aria-label={c.name}
        onClick={toggle}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-success bg-success text-surface" : "border-separator hover:border-accent-ink"}`}
      >
        {done && <Icon name="check" className="size-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={done ? "text-secondary line-through" : "font-semibold"}>{c.name}</p>
        <p className="text-subhead text-secondary">
          {done
            ? `Done by ${c.doneBy === h.me ? "you" : h.mates[c.doneBy!]} · ${when(c.doneAt!)}`
            : `${who} · ${c.often === "Daily" ? "Due today" : "Due this week"}`}
        </p>
      </div>
      <Dot name={h.mates[c.who]} />
    </li>
  );
}

/** One calendar event: time, what it is, who added it, and any clash. */
export function EventRow({ h, e, events, compact }: { h: House; e: CalEvent; events: CalEvent[]; compact?: boolean }) {
  const type = EVENTS[e.kind];
  const clash = clashWith(e, events);
  const long = new Date(e.end).getTime() - new Date(e.start).getTime() > DAY; // e.g. away for the weekend

  return (
    <li className="flex gap-4 py-4">
      <div className="w-20 shrink-0 text-subhead">
        <p className="font-semibold">{long ? "All day" : time(e.start)}</p>
        <p className="text-secondary">{long ? `until ${day(e.end).split(", ")[1]}` : `to ${time(e.end)}`}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{e.note || e.kind}</p>
        <p className="flex flex-wrap items-center gap-2 text-subhead text-secondary">
          <span>{e.kind}</span>
          {type.mood !== "info" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-fill px-2 py-1 font-semibold">
              <Icon name={type.mood === "quiet" ? "moon" : "users"} className="size-4" />
              {MOODS[type.mood]}
            </span>
          )}
          <span>{e.by === h.me ? "You" : h.mates[e.by]}</span>
        </p>
        {clash && (
          <p className="flex items-center gap-1 text-subhead font-semibold text-danger">
            <Icon name="alert" className="size-4 shrink-0" />
            Clashes with {clash.by === h.me ? "your" : `${h.mates[clash.by]}'s`} {clash.kind.toLowerCase()}
          </p>
        )}
        {!compact && (
          <a href={googleCalendarLink(e, h.name)} target="_blank" rel="noreferrer" className="link self-start text-subhead">
            <Icon name="calendar" className="size-4" />
            Add to Google Calendar
          </a>
        )}
      </div>
      <Dot name={h.mates[e.by]} />
    </li>
  );
}

/** One expense, or a payment between roommates. */
export function BillRow({ h, b }: { h: House; b: Bill }) {
  const payment = b.paidTo !== undefined;
  const name = (i: number) => (i === h.me ? "You" : h.mates[i]);
  return (
    <li className="flex min-h-14 items-center gap-4 py-2">
      <Dot name={h.mates[b.paidBy]} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{payment ? `${name(b.paidBy)} paid ${name(b.paidTo!).replace("You", "you")}` : b.note || b.category}</p>
        <p className="text-subhead text-secondary">
          {payment ? "Payment" : b.category === HOUSEPACT ? "Monthly subscription" : `${b.category} · paid by ${name(b.paidBy).replace("You", "you")}`} · {day(b.at)}
        </p>
      </div>
      <span className={`font-semibold tabular-nums ${payment ? "text-secondary" : ""}`}>{money(b.amount)}</span>
    </li>
  );
}
