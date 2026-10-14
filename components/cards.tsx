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
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="btn h-11 w-auto gap-2 px-5" onClick={onClick}>
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
    <section className={`rounded-2xl border border-line bg-white p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg">
          <Icon name={icon} className="size-5 text-muted" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ViewAll({ href, label = "View all" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
      {label}
      <Icon name="chevron" className="size-4" />
    </Link>
  );
}

/** A summary number at the top of a page. */
export function Stat({ label, value, sub, href, alert }: { label: string; value: string; sub: string; href?: string; alert?: boolean }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${alert ? "text-alert" : ""}`}>{value}</p>
      <p className="mt-0.5 truncate text-sm text-muted">{sub}</p>
    </>
  );
  const style = "block rounded-2xl border border-line bg-white p-4";
  return href ? (
    <Link href={href} className={`${style} transition hover:border-ink`}>
      {body}
    </Link>
  ) : (
    <div className={style}>{body}</div>
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
      ? `Pay the landlord directly by ${shortDate(r.payBy)}`
      : collector === h.me
        ? `You collect everyone's share and pay the landlord ${money(r.total)}`
        : `Pay ${h.mates[collector]} by ${shortDate(r.payBy)}`;

  return (
    <Card
      title={`${r.due.toLocaleDateString("en-US", { month: "long" })} rent`}
      icon="dollar"
      action={<span className="text-sm font-semibold text-muted">Due {shortDate(r.due)}</span>}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold">{money(r.shares[h.me])}</p>
          <p className="text-sm text-muted">Your share. {instruction}.</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold">{r.days === 0 ? "Today" : `${r.days} day${r.days === 1 ? "" : "s"}`}</p>
          <p className="text-sm text-muted">until due</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-[#2BB673] transition-all" style={{ width: `${(collected / r.total) * 100}%` }} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {money(collected)} of {money(r.total)} paid · {r.paid.length} of {h.mates.length} roommates
        </p>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {h.mates.map((name, i) => (
          <li key={i} className="flex items-center gap-3 py-2">
            <Dot i={i} name={name} />
            <span className="flex-1">{i === h.me ? `${name} (you)` : name}</span>
            <span className="font-semibold tabular-nums">{money(r.shares[i])}</span>
            <span
              className={`w-14 rounded-full py-0.5 text-center text-sm font-semibold ${r.paid.includes(i) ? "bg-[#E3F6EC] text-[#17784A]" : "bg-paper text-muted"}`}
            >
              {r.paid.includes(i) ? "Paid" : "Due"}
            </span>
          </li>
        ))}
      </ul>

      <button
        className={`btn mt-3 h-12 ${mePaid ? "border border-line bg-white text-ink" : ""}`}
        onClick={() => update({ rentPaid: { ...h.rentPaid, [r.month]: toggleIn(r.paid, h.me) } })}
      >
        {mePaid ? "Undo: mark my share unpaid" : "Mark my share paid"}
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
    <li className="flex items-center gap-3 py-3">
      <button
        aria-label={done ? `Undo ${c.name}` : `Mark ${c.name} done`}
        onClick={toggle}
        className={`flex size-11 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-[#2BB673] bg-[#2BB673] text-white" : "border-line hover:border-ink"}`}
      >
        {done && <Icon name="check" className="size-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={done ? "text-muted line-through" : "font-semibold"}>{c.name}</p>
        <p className="text-sm text-muted">
          {done
            ? `Done by ${c.doneBy === h.me ? "you" : h.mates[c.doneBy!]} · ${when(c.doneAt!)}`
            : `${who} · ${c.often === "Daily" ? "Due today" : "Due this week"}`}
        </p>
      </div>
      <Dot i={c.who} name={h.mates[c.who]} />
    </li>
  );
}

/** One calendar event: time, what it is, who added it, and any clash. */
export function EventRow({ h, e, events, compact }: { h: House; e: CalEvent; events: CalEvent[]; compact?: boolean }) {
  const type = EVENTS[e.kind];
  const clash = clashWith(e, events);
  const long = new Date(e.end).getTime() - new Date(e.start).getTime() > DAY; // e.g. away for the weekend

  return (
    <li className="flex gap-4 py-3">
      <div className="w-20 shrink-0 text-sm">
        <p className="font-semibold">{long ? "All day" : time(e.start)}</p>
        <p className="text-muted">{long ? `until ${day(e.end).split(", ")[1]}` : `to ${time(e.end)}`}</p>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{e.note || e.kind}</p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{e.kind}</span>
          {type.mood !== "info" && (
            <span className={`rounded-full px-2 py-0.5 font-semibold ${type.mood === "quiet" ? "bg-[#E8EEFF] text-[#3155C7]" : "bg-[#FFF1E3] text-[#A4520F]"}`}>
              {MOODS[type.mood]}
            </span>
          )}
          <span>· {e.by === h.me ? "You" : h.mates[e.by]}</span>
        </p>
        {clash && (
          <p className="flex items-center gap-1 text-sm font-semibold text-alert">
            <Icon name="alert" className="size-4" />
            Clashes with {clash.by === h.me ? "your" : `${h.mates[clash.by]}'s`} {clash.kind.toLowerCase()}
          </p>
        )}
        {!compact && (
          <a href={googleCalendarLink(e, h.name)} target="_blank" rel="noreferrer" className="self-start text-sm font-semibold text-muted underline hover:text-ink">
            Add to Google Calendar
          </a>
        )}
      </div>
      <Dot i={e.by} name={h.mates[e.by]} />
    </li>
  );
}

/** One expense, or a payment between roommates. */
export function BillRow({ h, b }: { h: House; b: Bill }) {
  const payment = b.paidTo !== undefined;
  const name = (i: number) => (i === h.me ? "You" : h.mates[i]);
  return (
    <li className="flex items-center gap-3 py-3">
      <Dot i={b.paidBy} name={h.mates[b.paidBy]} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{payment ? `${name(b.paidBy)} paid ${name(b.paidTo!).replace("You", "you")}` : b.note || b.category}</p>
        <p className="text-sm text-muted">
          {payment ? "Payment" : b.category === HOUSEPACT ? "Monthly subscription" : `${b.category} · paid by ${name(b.paidBy).replace("You", "you")}`} · {day(b.at)}
        </p>
      </div>
      <span className={`font-semibold tabular-nums ${payment ? "text-muted" : ""}`}>{money(b.amount)}</span>
    </li>
  );
}
