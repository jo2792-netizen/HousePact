"use client";

import { useState } from "react";
import { Card, PageHeader } from "@/components/cards";
import type { IconName } from "@/components/icons";
import { day } from "@/lib/house";
import { update, useHouse } from "@/lib/store";

const SECTIONS: { title: string; icon: IconName; fields: string[][] }[] = [
  { title: "Basics", icon: "wifi", fields: [["wifi", "WiFi name"], ["password", "WiFi password"], ["trash", "Trash days"]] },
  { title: "Contacts", icon: "phone", fields: [["super", "Super"], ["hoa", "HOA"]] },
  { title: "Emergency", icon: "alert", fields: [["emergency", "Contact"], ["water", "Water shutoff"], ["breaker", "Breaker box"]] },
];

export default function Info() {
  const h = useHouse();
  const [note, setNote] = useState("Small scratch on the bedroom door"); // pre-filled for the demo
  if (!h) return null;

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    update({ notes: [...h.notes, { text: note.trim(), at: new Date().toISOString() }] });
    setNote("");
  };

  return (
    <>
      <PageHeader title="Apartment Info" subtitle={`${h.agreement.household.address}. Tap any field to edit it; changes save automatically.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map(({ title, icon, fields }) => (
          <Card key={title} title={title} icon={icon}>
            <div className="divide-y divide-separator">
              {fields.map(([key, label]) => (
                <label key={key} className="flex min-h-14 flex-col justify-center py-2">
                  <span className="text-subhead text-secondary">{label}</span>
                  <input
                    value={h.info[key] ?? ""}
                    placeholder="Add"
                    aria-label={label}
                    onChange={(e) => update({ info: { ...h.info, [key]: e.target.value } })}
                    className="min-h-11 bg-transparent outline-none placeholder:text-secondary"
                  />
                </label>
              ))}
            </div>
          </Card>
        ))}

        <Card title="Condition Notes" icon="camera">
          <div className="divide-y divide-separator">
            {h.notes.map((n, i) => (
              <div key={i} className="py-2">
                <p>{n.text}</p>
                <p className="text-subhead text-secondary">{day(n.at)}</p>
              </div>
            ))}
            <form onSubmit={addNote} className="flex items-center gap-2 py-2">
              <input
                value={note}
                placeholder="Add a note"
                aria-label="Condition note"
                onChange={(e) => setNote(e.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent outline-none placeholder:text-secondary"
              />
              <button disabled={!note.trim()} className="btn w-auto">
                Add Note
              </button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
