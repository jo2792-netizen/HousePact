"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { AddButton, Card, PageHeader, Stat } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { AddNote, AddRepairCost, ReportRepair } from "@/components/sheets";
import { longDate, toYMD } from "@/lib/agreement";
import { day, money } from "@/lib/house";
import { ROOMS, compressPhoto } from "@/lib/photos";
import { update, useHouse, type House, type Note, type Repair, type RepairStatus } from "@/lib/store";

const WEEK = 7 * 24 * 60 * 60 * 1000;
const STATUSES: RepairStatus[] = ["Reported", "Scheduled", "In Progress", "Fixed"];
const STATUS_ICON: Record<RepairStatus, IconName> = { Reported: "alert", Scheduled: "calendar", "In Progress": "clock", Fixed: "check" };

export default function Condition() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  const [repairFrom, setRepairFrom] = useState<{ title: string; room: string } | null>(null);
  const [reporting, setReporting] = useState(false);
  const [costFor, setCostFor] = useState<Repair | null>(null);
  const [viewing, setViewing] = useState<{ src: string; caption: string } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoFor = useRef<number | null>(null); // which note the next photo is for
  if (!h) return null;

  // Anything noted in the first week after move-in counts as the "before" record
  const isBefore = (n: Note) => new Date(n.at).getTime() <= new Date(h.since).getTime() + WEEK;
  const before = h.notes.flatMap((n) => (isBefore(n) ? (n.photos ?? []).map((src) => ({ src, caption: `${n.room ?? "Other"}: ${n.text}` })) : []));
  const photoCount = h.notes.reduce((sum, n) => sum + (n.photos?.length ?? 0), 0);
  const repairs = h.repairs ?? [];
  const open = repairs.filter((r) => r.status !== "Fixed");
  const fixed = repairs.filter((r) => r.status === "Fixed");
  const repairCosts = repairs.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0);
  const byRoom = ROOMS.map((room) => ({ room, notes: h.notes.map((n, i) => ({ n, i })).filter(({ n }) => (n.room ?? "Other") === room) })).filter((r) => r.notes.length);

  const addPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || photoFor.current === null) return;
    const src = await compressPhoto(file);
    const i = photoFor.current;
    update({ notes: h.notes.map((n, j) => (j === i ? { ...n, photos: [...(n.photos ?? []), src] } : n)) });
  };

  return (
    <>
      <PageHeader
        title="Condition"
        subtitle="Before photos, what needs fixing, and what it costs. Repair costs go straight to Bills."
        action={<AddButton label="Report Repair" onClick={() => setReporting(true)} />}
      />

      {h.agreement.answers.photos && (
        <p className="flex gap-2 rounded-2xl bg-surface p-4 text-subhead text-secondary">
          <Icon name="agreement" className="mt-0.5 size-4 shrink-0" />
          Your agreement asks everyone to photograph the apartment within 7 days of moving in (Section 7.6).
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Before photos" value={String(before.length)} sub={`${photoCount} photos in all`} />
        <Stat label="Open repairs" value={String(open.length)} sub={`${fixed.length} fixed`} alert={open.length > 0} />
        <Stat label="Repair costs" value={money(repairCosts)} sub="Added to Bills" href="/bills" />
      </div>

      <Card title="Before Photos" icon="image" action={<span className="text-subhead text-secondary">Move-in, {longDate(toYMD(new Date(h.since)))}</span>}>
        {before.length ? (
          <ul className="grid grid-cols-2 gap-4">
            {before.map((p, i) => (
              <li key={i}>
                <button onClick={() => setViewing(p)} className="block w-full text-left" aria-label={`View photo: ${p.caption}`}>
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-fill">
                    <Image src={p.src} alt="" fill unoptimized className="object-cover" />
                  </span>
                  <span className="mt-2 block text-subhead text-secondary">{p.caption}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-secondary">No move-in photos yet. Add a note with photos to start the record.</p>
        )}
      </Card>

      <section id="repairs" className="flex scroll-mt-24 flex-col gap-6">
        {[
          { title: "Repairs: Needs Attention", list: open, empty: "Nothing needs fixing right now." },
          { title: "Repairs: Fixed", list: fixed, empty: "No repairs finished yet." },
        ].map(({ title, list, empty }) => (
          <Card key={title} title={title} icon="wrench">
            {list.length ? (
              <ul className="divide-y divide-separator">
                {list.map((r) => (
                  <RepairRow key={r.id} h={h} r={r} onAddCost={() => setCostFor(r)} />
                ))}
              </ul>
            ) : (
              <p className="text-secondary">{empty}</p>
            )}
          </Card>
        ))}
      </section>

      <div className="mt-2 flex items-center justify-between gap-4">
        <h2>Notes by Room</h2>
        <AddButton label="Add Note" icon="camera" onClick={() => setAdding(true)} />
      </div>
      <div className="flex flex-col gap-6">
        {byRoom.map(({ room, notes }) => (
          <Card key={room} title={room} icon="home">
            <ul className="divide-y divide-separator">
              {notes.map(({ n, i }) => (
                <li key={i} className="flex flex-col gap-2 py-4">
                  <div>
                    <p className="font-semibold">{n.text}</p>
                    <p className="text-subhead text-secondary">
                      {isBefore(n) ? "Move-in" : "Added"} · {day(n.at)}
                    </p>
                  </div>
                  {!!n.photos?.length && (
                    <div className="flex flex-wrap gap-2">
                      {n.photos.map((src, k) => (
                        <button
                          key={k}
                          onClick={() => setViewing({ src, caption: `${room}: ${n.text}` })}
                          aria-label={`View photo ${k + 1} of ${n.text}`}
                          className="relative size-20 overflow-hidden rounded-xl bg-fill"
                        >
                          <Image src={src} alt="" fill unoptimized className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="link text-subhead"
                      onClick={() => {
                        photoFor.current = i;
                        photoInput.current?.click();
                      }}
                    >
                      <Icon name="camera" className="size-4" />
                      Add Photo
                    </button>
                    <button className="link text-subhead" onClick={() => setRepairFrom({ title: n.text, room })}>
                      <Icon name="wrench" className="size-4" />
                      Report Repair
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <input ref={photoInput} type="file" accept="image/*" className="hidden" aria-label="Choose a photo" onChange={addPhoto} />

      {/* Full-size photo */}
      {viewing && (
        <div role="dialog" aria-modal="true" aria-label={viewing.caption} className="fixed inset-0 z-40 flex flex-col bg-black/90 p-4" onClick={() => setViewing(null)}>
          <div className="flex justify-end pt-[env(safe-area-inset-top)]">
            <button onClick={() => setViewing(null)} className="flex h-11 items-center gap-2 rounded-xl px-4 font-semibold text-white">
              <Icon name="xmark" />
              Close
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={viewing.src} alt={viewing.caption} fill unoptimized className="object-contain" />
          </div>
          <p className="pt-4 pb-[env(safe-area-inset-bottom)] text-center text-white">{viewing.caption}</p>
        </div>
      )}

      {adding && <AddNote h={h} onClose={() => setAdding(false)} />}
      {repairFrom && <ReportRepair h={h} preset={repairFrom} onClose={() => setRepairFrom(null)} />}
      {reporting && <ReportRepair h={h} onClose={() => setReporting(false)} />}
      {costFor && <AddRepairCost h={h} repair={costFor} onClose={() => setCostFor(null)} />}
    </>
  );
}

function RepairRow({ h, r, onAddCost }: { h: House; r: Repair; onAddCost: () => void }) {
  const name = (i: number) => (i === h.me ? "you" : h.mates[i]);
  const setStatus = (status: RepairStatus) => update({ repairs: (h.repairs ?? []).map((x) => (x.id === r.id ? { ...x, status } : x)) });
  const next = STATUSES[STATUSES.indexOf(r.status) + 1]; // Reported, then Scheduled, In Progress, Fixed

  return (
    <li className="flex flex-col gap-4 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{r.title}</p>
        <p className="text-subhead text-secondary">
          {r.room} · Reported by {name(r.reportedBy)} · {day(r.at)}
        </p>
        {r.note && <p className="text-subhead">{r.note}</p>}

        {/* Who pays */}
        {r.fixer === "Landlord" ? (
          <p className="flex items-center gap-2 text-subhead text-secondary">
            <Icon name="home" className="size-4 shrink-0" />
            The landlord&apos;s repair. No cost to the house.
          </p>
        ) : r.cost ? (
          <div className="flex gap-2 text-subhead">
            <Icon name="bills" className="mt-0.5 size-4 shrink-0 text-secondary" />
            <div>
              <p>
                <span className="font-semibold">{money(r.cost.amount)}</span>{" "}
                {r.cost.split === "Group"
                  ? `split ${h.mates.length} ways (${money(r.cost.amount / h.mates.length)} each)`
                  : `charged to ${name(r.cost.responsible)}`}
                , paid by {name(r.cost.paidBy)}.
              </p>
              <Link href="/bills" className="link">
                View in Bills
                <Icon name="chevron" className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-subhead text-secondary">
            No cost added yet.
            <button className="link" onClick={onAddCost}>
              <Icon name="plus" className="size-4" />
              Add Cost
            </button>
          </div>
        )}
      </div>

      {/* Status: icon and label, plus one button for the next step */}
      <div className="flex shrink-0 flex-col gap-2">
        <span
          className={`inline-flex items-center gap-1 self-start rounded-md px-2 py-1 text-subhead font-semibold ${r.status === "Fixed" ? "bg-success-wash text-success" : "bg-fill text-secondary"}`}
        >
          <Icon name={STATUS_ICON[r.status]} className="size-4" />
          {r.status}
        </span>
        {next && (
          <button className="btn-secondary w-auto px-4 text-subhead" onClick={() => setStatus(next)}>
            <Icon name={STATUS_ICON[next]} className="size-4" />
            Mark as {next}
          </button>
        )}
      </div>
    </li>
  );
}
