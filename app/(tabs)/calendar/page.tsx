"use client";

import { useState } from "react";
import { Choice, Dot, Field, Sheet } from "@/components/ui";
import { EMOJI, clashes, day, googleCalendarLink, time, upcoming } from "@/lib/house";
import { update, useHouse, type CalEvent, type House } from "@/lib/store";

const DEFAULT_TIMES = { Quiet: ["23:00", "07:00"], Hosting: ["20:00", "23:00"] };

export default function Calendar() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  const events = upcoming(h.events);

  return (
    <>
      <h1>Calendar</h1>
      {!events.length && <p className="text-muted">Nothing planned</p>}
      <ul className="flex flex-col gap-3">
        {events.map((e, i) => {
          const clash = clashes(e, events);
          return (
            <li key={i} className={`card flex flex-col gap-1 border-2 ${clash ? "border-alert" : "border-transparent"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {EMOJI[e.kind]} {e.kind}
                </p>
                <Dot i={e.by} name={h.mates[e.by]} />
              </div>
              {e.note && <p>{e.note}</p>}
              <p className="text-muted">
                {day(e.start)} · {time(e.start)}–{time(e.end)}
              </p>
              {clash && <p className="font-semibold text-alert">⚠️ Overlaps {e.kind === "Quiet" ? "hosting" : "quiet time"}</p>}
              <a href={googleCalendarLink(e, h.name)} target="_blank" rel="noreferrer" className="self-start py-2 text-[15px] underline">
                Add to Google Calendar
              </a>
            </li>
          );
        })}
      </ul>
      <button className="btn" onClick={() => setAdding(true)}>
        Add event
      </button>
      {adding && <AddEvent h={h} onClose={() => setAdding(false)} />}
    </>
  );
}

function AddEvent({ h, onClose }: { h: House; onClose: () => void }) {
  const [kind, setKind] = useState<CalEvent["kind"]>("Quiet");
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(DEFAULT_TIMES.Quiet[0]);
  const [to, setTo] = useState(DEFAULT_TIMES.Quiet[1]);
  const [note, setNote] = useState("");

  const pickKind = (k: CalEvent["kind"]) => {
    setKind(k);
    setFrom(DEFAULT_TIMES[k][0]);
    setTo(DEFAULT_TIMES[k][1]);
  };

  const save = () => {
    const start = new Date(`${date}T${from}`);
    const end = new Date(`${date}T${to}`);
    if (end <= start) end.setDate(end.getDate() + 1); // ends after midnight
    update({ events: [...h.events, { kind, start: start.toISOString(), end: end.toISOString(), by: h.me, note: note.trim() }] });
  };

  return (
    <Sheet title="Add event" canSave={!!(date && from && to)} onSave={save} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {(["Quiet", "Hosting"] as const).map((k) => (
          <Choice key={k} on={kind === k} onClick={() => pickKind(k)}>
            {EMOJI[k]} {k}
          </Choice>
        ))}
      </div>
      <input className="field" placeholder="What's happening? (optional)" aria-label="What's happening" value={note} onChange={(e) => setNote(e.target.value)} />
      <Field label="Day">
        <input type="date" aria-label="Day" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <input type="time" aria-label="From" className="field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <input type="time" aria-label="To" className="field" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  );
}

/** Today's date as YYYY-MM-DD, the format date inputs use. */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
