"use client";

import { useState } from "react";
import { Choice, Dot, Field, Sheet } from "@/components/ui";
import { EVENTS, MOODS, clashWith, day, googleCalendarLink, time, upcoming, type Mood } from "@/lib/house";
import { update, useHouse, type House } from "@/lib/store";

const DAY = 24 * 60 * 60 * 1000;

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
          const type = EVENTS[e.kind];
          const clash = clashWith(e, events);
          // Multi-day events (like being away) show a date range instead of times
          const long = new Date(e.end).getTime() - new Date(e.start).getTime() > DAY;
          return (
            <li key={i} className={`card flex flex-col gap-1 border-2 ${clash ? "border-alert" : "border-transparent"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {type.emoji} {e.kind}
                </p>
                <Dot i={e.by} name={h.mates[e.by]} />
              </div>
              {e.note && <p>{e.note}</p>}
              <p className="text-muted">
                {long ? `${day(e.start)} – ${day(e.end)}` : `${day(e.start)} · ${time(e.start)}–${time(e.end)}`}
                {type.mood !== "info" && ` · ${MOODS[type.mood]}`}
              </p>
              {clash && (
                <p className="font-semibold text-alert">
                  ⚠️ Clashes with {clash.by === h.me ? "your" : `${h.mates[clash.by]}'s`} {clash.kind.toLowerCase()}
                </p>
              )}
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
  const [kind, setKind] = useState("Interview");
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(EVENTS.Interview.from);
  const [to, setTo] = useState(EVENTS.Interview.to);
  const [note, setNote] = useState("");

  // Picking a type fills in its usual times
  const pickKind = (k: string) => {
    setKind(k);
    setFrom(EVENTS[k].from);
    setTo(EVENTS[k].to);
  };

  const save = () => {
    const start = new Date(`${date}T${from}`);
    const end = new Date(`${date}T${to}`);
    if (end <= start) end.setDate(end.getDate() + 1); // ends after midnight
    update({ events: [...h.events, { kind, start: start.toISOString(), end: end.toISOString(), by: h.me, note: note.trim() }] });
  };

  return (
    <Sheet title="Add event" canSave={!!(date && from && to)} onSave={save} onClose={onClose}>
      {(Object.keys(MOODS) as Mood[]).map((mood) => (
        <Field key={mood} label={MOODS[mood]}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENTS)
              .filter(([, type]) => type.mood === mood)
              .map(([k, type]) => (
                <Choice key={k} on={kind === k} onClick={() => pickKind(k)}>
                  {type.emoji} {k}
                </Choice>
              ))}
          </div>
        </Field>
      ))}
      <input className="field" placeholder="Details (optional)" aria-label="Details" value={note} onChange={(e) => setNote(e.target.value)} />
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
