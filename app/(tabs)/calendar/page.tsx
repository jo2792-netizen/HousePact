"use client";

import { useState } from "react";
import { AddButton, Card, EventRow, PageHeader, Stat } from "@/components/cards";
import { AddEvent } from "@/components/sheets";
import { EVENTS, clashWith, dayLabel, upcoming } from "@/lib/house";
import { useHouse } from "@/lib/store";

export default function Calendar() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  const events = upcoming(h.events);
  const clashes = events.filter((e) => clashWith(e, events)).length;
  const quiet = events.filter((e) => EVENTS[e.kind].mood === "quiet").length;
  const busy = events.filter((e) => EVENTS[e.kind].mood === "busy").length;

  // Group by day: Today, Tomorrow, then dates
  const days = new Map<string, typeof events>();
  for (const e of events) days.set(dayLabel(e.start), [...(days.get(dayLabel(e.start)) ?? []), e]);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Plans that affect the house. Anything that needs quiet is flagged if it overlaps a busy event."
        action={<AddButton label="Add Event" onClick={() => setAdding(true)} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Needs quiet" value={String(quiet)} sub="Interviews, studying, sleep" />
        <Stat label="Busy house" value={String(busy)} sub="Guests, meals, parties" />
        <Stat label="Conflicts" value={String(clashes)} sub={clashes ? "Check the red warnings" : "No overlaps"} alert={clashes > 0} />
      </div>

      {events.length ? (
        <div className="flex flex-col gap-6">
          {[...days].map(([label, list]) => (
            <Card key={label} title={label} icon="calendar">
              <ul className="divide-y divide-separator">
                {list.map((e, i) => (
                  <EventRow key={i} h={h} e={e} events={events} />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-secondary">Nothing planned.</p>
      )}

      {adding && <AddEvent h={h} onClose={() => setAdding(false)} />}
    </>
  );
}
