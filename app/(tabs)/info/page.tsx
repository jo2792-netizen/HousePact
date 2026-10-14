"use client";

import { useState } from "react";
import { day } from "@/lib/house";
import { update, useHouse } from "@/lib/store";

const SECTIONS = [
  { title: "Basics", fields: [["wifi", "WiFi name"], ["password", "WiFi password"], ["trash", "Trash days"]] },
  { title: "Contacts", fields: [["super", "Super"], ["hoa", "HOA"]] },
  { title: "Emergency", fields: [["emergency", "Contact"], ["water", "Water shutoff"], ["breaker", "Breaker box"]] },
];

export default function Info() {
  const h = useHouse();
  const [note, setNote] = useState("");
  if (!h) return null;

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    update({ notes: [...h.notes, { text: note.trim(), at: new Date().toISOString() }] });
    setNote("");
  };

  return (
    <>
      <h1>Apartment</h1>
      {SECTIONS.map(({ title, fields }) => (
        <section key={title} className="flex flex-col gap-2">
          <h2>{title}</h2>
          <div className="divide-y divide-line rounded-xl bg-white px-4">
            {fields.map(([key, label]) => (
              <label key={key} className="flex flex-col py-3">
                <span className="text-sm text-muted">{label}</span>
                <input
                  value={h.info[key] ?? ""}
                  placeholder="Add"
                  aria-label={label}
                  onChange={(e) => update({ info: { ...h.info, [key]: e.target.value } })}
                  className="bg-transparent outline-none"
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2>Condition</h2>
        <div className="divide-y divide-line rounded-xl bg-white px-4">
          {h.notes.map((n, i) => (
            <div key={i} className="py-3">
              <p>{n.text}</p>
              <p className="text-sm text-muted">{day(n.at)}</p>
            </div>
          ))}
          <form onSubmit={addNote} className="flex items-center gap-2 py-2">
            <input
              value={note}
              placeholder="Add a note"
              aria-label="Condition note"
              onChange={(e) => setNote(e.target.value)}
              className="h-12 min-w-0 flex-1 bg-transparent outline-none"
            />
            <button disabled={!note.trim()} className="btn h-12 w-auto">
              Add
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
