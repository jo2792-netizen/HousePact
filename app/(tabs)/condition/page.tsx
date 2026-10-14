"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { AddButton, Card, PageHeader, Stat } from "@/components/cards";
import { Icon } from "@/components/icons";
import { AddNote, ReportRepair } from "@/components/sheets";
import { longDate, toYMD } from "@/lib/agreement";
import { day } from "@/lib/house";
import { ROOMS, compressPhoto } from "@/lib/photos";
import { update, useHouse, type Note } from "@/lib/store";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function Condition() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  const [repairFrom, setRepairFrom] = useState<{ title: string; room: string } | null>(null);
  const [viewing, setViewing] = useState<{ src: string; caption: string } | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoFor = useRef<number | null>(null); // which note the next photo is for
  if (!h) return null;

  // Anything noted in the first week after move-in counts as the "before" record
  const isBefore = (n: Note) => new Date(n.at).getTime() <= new Date(h.since).getTime() + WEEK;
  const before = h.notes.flatMap((n) => (isBefore(n) ? (n.photos ?? []).map((src) => ({ src, caption: `${n.room ?? "Other"}: ${n.text}` })) : []));
  const photoCount = h.notes.reduce((sum, n) => sum + (n.photos?.length ?? 0), 0);
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
        subtitle="Before photos and notes from move-in protect everyone's deposit when you move out."
        action={<AddButton label="Add Note" onClick={() => setAdding(true)} />}
      />

      {h.agreement.answers.photos && (
        <p className="flex gap-2 rounded-2xl bg-surface p-4 text-subhead text-secondary">
          <Icon name="agreement" className="mt-0.5 size-4 shrink-0" />
          Your agreement asks everyone to photograph the apartment within 7 days of moving in (Section 7.6).
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Notes" value={String(h.notes.length)} sub="Across all rooms" />
        <Stat label="Photos" value={String(photoCount)} sub={`${before.length} from move-in`} />
        <Stat label="Rooms" value={String(byRoom.length)} sub="Documented" />
      </div>

      <Card title="Before Photos" icon="image" action={<span className="text-subhead text-secondary">Move-in, {longDate(toYMD(new Date(h.since)))}</span>}>
        {before.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
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
    </>
  );
}
