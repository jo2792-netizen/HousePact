"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { ApartmentArt } from "@/components/apartment-art";
import { BillRow, Card, ChoreRow, EventRow, RentCard, Stat, ViewAll } from "@/components/cards";
import { Icon } from "@/components/icons";
import { AddBill, AddChore, AddEvent } from "@/components/sheets";
import { DotPicker } from "@/components/ui";
import { DISHES, GUEST_NOTICE, PARTIES, clock, label, longDate } from "@/lib/agreement";
import { allBills, debts, greeting, headsUp, isDone, money, rentStatus, time, upcoming, when } from "@/lib/house";
import { reset, update, useHouse } from "@/lib/store";

export default function Home() {
  const h = useHouse();
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState<"bill" | "chore" | "event" | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  if (!h) return null;

  const { household, answers, signatures } = h.agreement;
  const me = h.mates[h.me];
  const rent = rentStatus(h);
  const owed = debts(h);
  const iOwe = owed.filter((d) => d.from === h.me).reduce((sum, d) => sum + d.amount, 0);
  const owedToMe = owed.filter((d) => d.to === h.me).reduce((sum, d) => sum + d.amount, 0);
  const signed = signatures.filter(Boolean).length;
  const unsigned = h.mates.filter((_, i) => !signatures[i]);
  const events = upcoming(h.events);
  const quiet = headsUp(h.events);

  // Open chores, yours first
  const openChores = h.chores
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => !isDone(c))
    .sort((a, b) => Number(b.c.who === h.me) - Number(a.c.who === h.me));
  const myOpen = openChores.filter(({ c }) => c.who === h.me);

  // Key terms from the agreement; Friday and Saturday nights use weekend quiet hours
  const tonight = [5, 6].includes(new Date().getDay()) ? answers.weekend : answers.weeknight;
  const rules = [
    ["Quiet hours tonight", `${clock(tonight[0])} to ${clock(tonight[1])}`],
    ["Overnight guests", `${label(GUEST_NOTICE, answers.guestNotice)} notice, up to ${answers.nights} nights in a row`],
    ["Parties", label(PARTIES, answers.parties)],
    ["Dishes", `Washed ${label(DISHES, answers.dishes).toLowerCase()}`],
  ];

  const copyWifi = () =>
    navigator.clipboard.writeText(h.info.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  // Shrink the photo so it fits comfortably in browser storage
  const uploadPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    update({ photo: canvas.toDataURL("image/jpeg", 0.8) });
  };

  return (
    <>
      {/* Greeting and whose dashboard this is */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1>
            {greeting()}, {me}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Viewing as</span>
          <DotPicker mates={h.mates} value={h.me} onChange={(i) => update({ me: i })} />
        </div>
      </div>

      {/* The apartment */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="relative h-44 bg-paper sm:h-60 lg:h-72">
          {h.photo ? (
            <Image src={h.photo} alt={`Photo of ${h.name}`} fill unoptimized className="object-cover" />
          ) : (
            <ApartmentArt className="size-full" />
          )}
          <div className="absolute right-3 bottom-3 flex gap-2">
            {h.photo && (
              <button onClick={() => update({ photo: undefined })} className="h-10 rounded-full bg-white/90 px-4 text-sm font-semibold">
                Remove
              </button>
            )}
            <button onClick={() => photoInput.current?.click()} className="flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-semibold">
              <Icon name="camera" className="size-4" />
              {h.photo ? "Change photo" : "Add a photo"}
            </button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Apartment photo" onChange={uploadPhoto} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-0">
            <h2 className="text-2xl">{h.name}</h2>
            <p className="text-muted">{household.address}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Icon name="users" className="size-4" />
              {h.mates.length} roommates · Lease {longDate(household.leaseStart)} to {longDate(household.leaseEnd)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["bill", "chore", "event"] as const).map((kind) => (
              <button key={kind} onClick={() => setAdding(kind)} className="flex h-11 items-center gap-2 rounded-full border border-line px-4 font-semibold hover:border-ink">
                <Icon name="plus" className="size-4" />
                Add {kind}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Heads-up when someone needs quiet in the next day, e.g. an interview */}
      {quiet && (
        <Link href="/calendar" className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-white p-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8EEFF] text-[#3155C7]">
            <Icon name="moon" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {quiet.by === h.me ? "Hey, you have" : `${h.mates[quiet.by]} has`} {/^[aeiou]/i.test(quiet.kind) ? "an" : "a"} {quiet.kind.toLowerCase()}
              {quiet.note ? `: ${quiet.note}` : ""}
            </p>
            <p className="text-sm text-muted">
              {when(quiet.start)} to {time(quiet.end)} · Please keep the house quiet
            </p>
          </div>
          <Icon name="chevron" className="size-5 shrink-0 text-muted" />
        </Link>
      )}

      {/* At a glance */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Your rent share"
          value={money(rent.shares[h.me])}
          sub={`Due ${rent.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${rent.paid.includes(h.me) ? "paid" : `in ${rent.days} days`}`}
          href="/bills"
        />
        {iOwe ? (
          <Stat label="You owe" value={money(iOwe)} sub="Settle up in Bills" href="/bills" alert />
        ) : (
          <Stat label={owedToMe ? "You're owed" : "Balance"} value={owedToMe ? money(owedToMe) : "Settled"} sub={owedToMe ? "From your roommates" : "Nobody owes anything"} href="/bills" />
        )}
        <Stat
          label="Your chores"
          value={myOpen.length ? `${myOpen.length} to do` : "All done"}
          sub={myOpen.length ? `Next: ${myOpen[0].c.name}` : "Nice work"}
          href="/chores"
        />
        <Stat
          label="Agreement"
          value={`${signed} of ${h.mates.length} signed`}
          sub={unsigned.length ? `Waiting on ${unsigned.join(", ")}` : "Fully executed"}
          href="/pact"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RentCard h={h} />

          <Card title="Upcoming chores" icon="chores" action={<ViewAll href="/chores" />}>
            {openChores.length ? (
              <ul className="divide-y divide-line">
                {openChores.slice(0, 5).map(({ i }) => (
                  <ChoreRow key={i} h={h} i={i} />
                ))}
              </ul>
            ) : (
              <p className="text-muted">Every chore is done for now.</p>
            )}
          </Card>

          <Card title="Recent bills" icon="bills" action={<ViewAll href="/bills" />}>
            <ul className="divide-y divide-line">
              {allBills(h)
                .slice(0, 4)
                .map((b, i) => (
                  <BillRow key={i} h={h} b={b} />
                ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Coming up" icon="calendar" action={<ViewAll href="/calendar" />}>
            {events.length ? (
              <ul className="divide-y divide-line">
                {events.slice(0, 4).map((e, i) => (
                  <EventRow key={i} h={h} e={e} events={events} compact />
                ))}
              </ul>
            ) : (
              <p className="text-muted">Nothing planned.</p>
            )}
          </Card>

          <Card title="House info" icon="info" action={<ViewAll href="/info" label="All info" />}>
            <ul className="divide-y divide-line">
              <li className="flex items-center gap-3 py-3">
                <Icon name="wifi" className="size-5 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{h.info.wifi || "WiFi"}</p>
                  <p className="text-sm tracking-widest text-muted">••••••••</p>
                </div>
                {h.info.password && (
                  <button onClick={copyWifi} className="flex h-9 items-center gap-1 rounded-full bg-paper px-3 text-sm font-semibold">
                    <Icon name={copied ? "check" : "copy"} className="size-4" />
                    {copied ? "Copied" : "Copy password"}
                  </button>
                )}
              </li>
              {(
                [
                  ["trash", "Trash pickup", h.info.trash],
                  ["phone", "Super", h.info.super],
                  ["alert", "Emergency", h.info.emergency],
                  ["key", "Water shutoff", h.info.water],
                ] as const
              ).map(([icon, title, value]) => (
                <li key={title} className="flex items-center gap-3 py-3">
                  <Icon name={icon} className="size-5 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted">{title}</p>
                    <p className="truncate">{value || "Not added yet"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="House rules" icon="agreement" action={<ViewAll href="/pact" label="Agreement" />}>
            <dl className="flex flex-col gap-3">
              {rules.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-sm text-muted">{term}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <button onClick={reset} className="flex items-center gap-2 self-center px-4 py-3 text-sm text-muted md:hidden">
        <Icon name="reset" className="size-4" />
        Reset demo
      </button>

      {adding === "bill" && <AddBill h={h} onClose={() => setAdding(null)} />}
      {adding === "chore" && <AddChore h={h} onClose={() => setAdding(null)} />}
      {adding === "event" && <AddEvent h={h} onClose={() => setAdding(null)} />}
    </>
  );
}
