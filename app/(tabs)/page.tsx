"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { ApartmentArt } from "@/components/apartment-art";
import { BillRow, Card, ChoreRow, EventRow, RentCard, SeeAll, Stat } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { AddBill, AddChore, AddEvent, ReportRepair } from "@/components/sheets";
import { Dot } from "@/components/ui";
import { DISHES, GUEST_NOTICE, PARTIES, clock, label, longDate } from "@/lib/agreement";
import { allBills, debts, greeting, headsUp, isDone, money, rentStatus, time, upcoming, when } from "@/lib/house";
import { reset, update, useHouse } from "@/lib/store";

export default function Home() {
  const h = useHouse();
  const [copied, setCopied] = useState(false);
  const [resent, setResent] = useState<number | null>(null); // which roommate's invite was just resent
  const [adding, setAdding] = useState<"Bill" | "Chore" | "Event" | "Repair" | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  if (!h) return null;

  const { household, answers, signatures } = h.agreement;
  const rent = rentStatus(h);
  const owed = debts(h);
  const iOwe = owed.filter((d) => d.from === h.me).reduce((sum, d) => sum + d.amount, 0);
  const owedToMe = owed.filter((d) => d.to === h.me).reduce((sum, d) => sum + d.amount, 0);
  const signed = signatures.filter(Boolean).length;
  const unsigned = h.mates.filter((_, i) => !signatures[i]);
  const events = upcoming(h.events);
  const quiet = headsUp(h.events);
  const openRepairs = (h.repairs ?? []).filter((r) => r.status !== "Fixed");

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

  const info: [IconName, string, string | undefined][] = [
    ["trash", "Trash pickup", h.info.trash],
    ["phone", "Super", h.info.super],
    ["alert", "Emergency", h.info.emergency],
    ["key", "Water shutoff", h.info.water],
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

  const photoButton = "flex h-11 items-center gap-2 rounded-xl bg-surface/80 px-4 text-subhead font-semibold text-accent-ink backdrop-blur-md";

  return (
    <>
      {/* Greeting and whose dashboard this is */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-secondary">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1>
            {greeting()}, {h.mates[h.me]}
          </h1>
        </div>
      </div>

      {/* The apartment */}
      <section className="overflow-hidden rounded-2xl bg-surface">
        <div className="relative h-44 bg-fill sm:h-64">
          {h.photo ? (
            <Image src={h.photo} alt={`Photo of ${h.name}`} fill unoptimized className="object-cover" />
          ) : (
            <ApartmentArt className="size-full" />
          )}
          <div className="absolute right-4 bottom-4 flex gap-2">
            {h.photo && (
              <button onClick={() => update({ photo: undefined })} className={photoButton}>
                Remove Photo
              </button>
            )}
            <button onClick={() => photoInput.current?.click()} className={photoButton}>
              <Icon name="camera" className="size-4" />
              {h.photo ? "Change Photo" : "Add Photo"}
            </button>
          </div>
          <input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Choose an apartment photo" onChange={uploadPhoto} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-title2 font-bold">{h.name}</h2>
            <p className="text-secondary">{household.address}</p>
            <p className="mt-1 text-subhead text-secondary">
              {h.mates.length} roommates · Lease {longDate(household.leaseStart)} to {longDate(household.leaseEnd)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Bill", "Chore", "Event"] as const).map((kind) => (
              <button key={kind} onClick={() => setAdding(kind)} className="btn-secondary w-auto px-4">
                <Icon name="plus" className="size-4" />
                Add {kind}
              </button>
            ))}
            <button onClick={() => setAdding("Repair")} className="btn-secondary w-auto px-4">
              <Icon name="wrench" className="size-4" />
              Report Repair
            </button>
          </div>
        </div>
      </section>

      {/* Heads-up when someone needs quiet in the next day, e.g. an interview */}
      {quiet && (
        <Link href="/calendar" className="flex items-center gap-4 rounded-2xl bg-surface p-4 transition hover:bg-fill">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-fill text-secondary">
            <Icon name="moon" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {quiet.by === h.me ? "Hey, you have" : `${h.mates[quiet.by]} has`} {/^[aeiou]/i.test(quiet.kind) ? "an" : "a"} {quiet.kind.toLowerCase()}
              {quiet.note ? `: ${quiet.note}` : ""}
            </p>
            <p className="text-subhead text-secondary">
              {when(quiet.start)} to {time(quiet.end)} · Please keep the house quiet
            </p>
          </div>
          <Icon name="chevron" className="size-5 shrink-0 text-secondary" />
        </Link>
      )}

      {/* At a glance */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Your rent share"
          value={money(rent.shares[h.me])}
          sub={`Due ${rent.due.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${rent.paid.includes(h.me) ? "Paid" : `in ${rent.days} days`}`}
          href="/bills"
        />
        {iOwe ? (
          <Stat label="You owe" value={money(iOwe)} sub="Settle up in Bills" href="/bills" alert />
        ) : (
          <Stat label={owedToMe ? "You're owed" : "Balance"} value={owedToMe ? money(owedToMe) : "Settled"} sub={owedToMe ? "From your roommates" : "Nobody owes anything"} href="/bills" />
        )}
        <Stat label="Your chores" value={myOpen.length ? `${myOpen.length} to do` : "All done"} sub={myOpen.length ? `Next: ${myOpen[0].c.name}` : "Nice work"} href="/chores" />
        <Stat
          label="Agreement"
          value={`${signed} of ${h.mates.length} signed`}
          sub={unsigned.length ? `Invites out to ${unsigned.join(", ")}` : "Fully executed"}
          href="/pact"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RentCard h={h} />

          <Card title="Upcoming Chores" icon="chores" action={<SeeAll href="/chores" />}>
            {openChores.length ? (
              <ul className="divide-y divide-separator">
                {openChores.slice(0, 5).map(({ i }) => (
                  <ChoreRow key={i} h={h} i={i} />
                ))}
              </ul>
            ) : (
              <p className="text-secondary">Every chore is done for now.</p>
            )}
          </Card>

          <Card title="Recent Bills" icon="bills" action={<SeeAll href="/bills" />}>
            <ul className="divide-y divide-separator">
              {allBills(h)
                .slice(0, 4)
                .map((b, i) => (
                  <BillRow key={i} h={h} b={b} />
                ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Roommates" icon="users">
            <ul className="divide-y divide-separator">
              {h.mates.map((name, i) => (
                <li key={i} className="flex min-h-14 items-center gap-4 py-2">
                  <Dot name={name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{i === h.me ? `${name} (You)` : household.names[i]}</p>
                    <p className="truncate text-subhead text-secondary">
                      {i === h.me ? "Set up the house" : signatures[i] ? "Joined · Signed the agreement" : `Invited · ${household.emails?.[i] ?? "Waiting to join"}`}
                    </p>
                  </div>
                  {i !== h.me && !signatures[i] && (
                    <button
                      onClick={() => {
                        setResent(i);
                        setTimeout(() => setResent(null), 2500);
                      }}
                      className="link shrink-0 text-subhead"
                      aria-label={`Resend invite to ${name}`}
                    >
                      <Icon name={resent === i ? "check" : "reset"} className="size-4" />
                      {resent === i ? "Sent" : "Resend"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Coming Up" icon="calendar" action={<SeeAll href="/calendar" />}>
            {events.length ? (
              <ul className="divide-y divide-separator">
                {events.slice(0, 4).map((e, i) => (
                  <EventRow key={i} h={h} e={e} events={events} compact />
                ))}
              </ul>
            ) : (
              <p className="text-secondary">Nothing planned.</p>
            )}
          </Card>

          <Card title="Open Repairs" icon="wrench" action={<SeeAll href="/repairs" />}>
            {openRepairs.length ? (
              <ul className="divide-y divide-separator">
                {openRepairs.map((r) => (
                  <li key={r.id} className="flex min-h-14 items-center gap-4 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-subhead text-secondary">
                        {r.room} · {r.fixer === "Landlord" ? "Landlord fixing" : r.cost ? `${money(r.cost.amount)} in Bills` : "Cost not added yet"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-fill px-2 py-1 text-subhead font-semibold text-secondary">{r.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-secondary">Nothing needs fixing.</p>
            )}
          </Card>

          <Card title="House Info" icon="info" action={<SeeAll href="/info" />}>
            <ul className="divide-y divide-separator">
              <li className="flex min-h-14 items-center gap-4 py-2">
                <Icon name="wifi" className="size-5 shrink-0 text-secondary" />
                <div className="min-w-0 flex-1">
                  <p className="text-subhead text-secondary">WiFi</p>
                  <p className="break-all">{h.info.wifi || "Not added yet"}</p>
                </div>
                {h.info.password && (
                  <button onClick={copyWifi} className="btn-secondary h-11 w-auto px-4 text-subhead">
                    <Icon name={copied ? "check" : "copy"} className="size-4" />
                    {copied ? "Copied" : "Copy Password"}
                  </button>
                )}
              </li>
              {info.map(([icon, title, value]) => (
                <li key={title} className="flex min-h-14 items-center gap-4 py-2">
                  <Icon name={icon} className="size-5 shrink-0 text-secondary" />
                  <div className="min-w-0">
                    <p className="text-subhead text-secondary">{title}</p>
                    <p className="truncate">{value || "Not added yet"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="House Rules" icon="agreement" action={<SeeAll href="/pact" label="Agreement" />}>
            <dl className="flex flex-col gap-4">
              {rules.map(([term, value]) => (
                <div key={term}>
                  <dt className="text-subhead text-secondary">{term}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <button onClick={reset} className="flex h-11 items-center gap-2 self-center px-4 text-subhead text-secondary md:hidden">
        <Icon name="reset" className="size-4" />
        Reset Demo
      </button>

      {adding === "Bill" && <AddBill h={h} onClose={() => setAdding(null)} />}
      {adding === "Chore" && <AddChore h={h} onClose={() => setAdding(null)} />}
      {adding === "Event" && <AddEvent h={h} onClose={() => setAdding(null)} />}
      {adding === "Repair" && <ReportRepair h={h} onClose={() => setAdding(null)} />}
    </>
  );
}
