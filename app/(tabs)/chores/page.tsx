"use client";

import { useState } from "react";
import { AddButton, Card, ChoreRow, PageHeader, Stat } from "@/components/cards";
import { AddChore } from "@/components/sheets";
import { ZONES, label, MAKEUP } from "@/lib/agreement";
import { isDone } from "@/lib/house";
import { useHouse } from "@/lib/store";

export default function Chores() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  const all = h.chores.map((c, i) => ({ c, i, done: isDone(c) }));
  const mine = all.filter(({ c, done }) => !done && c.who === h.me);
  const others = all.filter(({ c, done }) => !done && c.who !== h.me);
  const done = all.filter(({ done }) => done);
  const sections = [
    { title: "Your Chores", items: mine, empty: "You're all caught up." },
    { title: "Housemates' Chores", items: others, empty: "Nothing open for your housemates." },
    { title: "Done", items: done, empty: "Nothing checked off yet. Daily chores reset each day, weekly chores after 7 days." },
  ];
  const { chores: system, makeup } = h.agreement.answers;

  return (
    <>
      <PageHeader
        title="Chores"
        subtitle={`${system === "rotation" ? "Weekly rotation" : system === "fixed" ? "Fixed assignments" : "Weekly sign-up"} across ${ZONES.length} zones. Missed chores are made up ${label(MAKEUP, makeup).toLowerCase()}.`}
        action={<AddButton label="Add Chore" onClick={() => setAdding(true)} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Yours to do" value={String(mine.length)} sub="Assigned to you" />
        <Stat label="House to do" value={String(mine.length + others.length)} sub="Still open" />
        <Stat label="Done" value={String(done.length)} sub="This period" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} title={s.title} icon="chores" className={s.title === "Done" ? "lg:col-span-2" : ""}>
            {s.items.length ? (
              <ul className="divide-y divide-separator">
                {s.items.map(({ i }) => (
                  <ChoreRow key={i} h={h} i={i} />
                ))}
              </ul>
            ) : (
              <p className="text-secondary">{s.empty}</p>
            )}
          </Card>
        ))}
      </div>

      {adding && <AddChore h={h} onClose={() => setAdding(false)} />}
    </>
  );
}
