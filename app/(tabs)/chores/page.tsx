"use client";

import { useState } from "react";
import { Choice, Dot, DotPicker, Field, Sheet } from "@/components/ui";
import { isDone, when } from "@/lib/house";
import { update, useHouse, type Chore, type House } from "@/lib/store";

export default function Chores() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  // Done chores move to the bottom
  const list = h.chores.map((c, i) => ({ c, i, done: isDone(c) })).sort((a, b) => Number(a.done) - Number(b.done));

  // Checking logs who did it and when; unchecking undoes it
  const toggle = (i: number, done: boolean) =>
    update({
      chores: h.chores.map((c, j) =>
        j !== i ? c : done ? { ...c, doneBy: undefined, doneAt: undefined } : { ...c, doneBy: h.me, doneAt: new Date().toISOString() },
      ),
    });

  return (
    <>
      <h1>Chores</h1>
      {!h.chores.length && <p className="text-muted">No chores yet</p>}
      <ul className="flex flex-col gap-3">
        {list.map(({ c, i, done }) => (
          <li key={i} className="card flex items-center gap-3">
            <Dot i={c.who} name={h.mates[c.who]} />
            <div className="min-w-0 flex-1">
              <p className={done ? "text-muted line-through" : ""}>{c.name}</p>
              <p className="text-sm text-muted">
                {done ? `Done ✓ ${h.mates[c.doneBy!]} · ${when(c.doneAt!)}` : c.often}
              </p>
            </div>
            <button
              aria-label={done ? `Undo ${c.name}` : `Mark ${c.name} done`}
              onClick={() => toggle(i, done)}
              className={`size-12 shrink-0 rounded-full border-2 text-xl ${done ? "border-ink bg-ink text-white" : "border-line"}`}
            >
              {done && "✓"}
            </button>
          </li>
        ))}
      </ul>
      <button className="btn" onClick={() => setAdding(true)}>
        Add chore
      </button>
      {adding && <AddChore h={h} onClose={() => setAdding(false)} />}
    </>
  );
}

function AddChore({ h, onClose }: { h: House; onClose: () => void }) {
  const [name, setName] = useState("");
  const [who, setWho] = useState(h.me);
  const [often, setOften] = useState<Chore["often"]>("Weekly");

  return (
    <Sheet
      title="Add chore"
      canSave={!!name.trim()}
      onSave={() => update({ chores: [...h.chores, { name: name.trim(), who, often }] })}
      onClose={onClose}
    >
      <input autoFocus className="field" placeholder="Take out trash" aria-label="Chore" value={name} onChange={(e) => setName(e.target.value)} />
      <Field label="Who">
        <DotPicker mates={h.mates} value={who} onChange={setWho} />
      </Field>
      <Field label="How often">
        <div className="grid grid-cols-2 gap-2">
          {(["Daily", "Weekly"] as const).map((o) => (
            <Choice key={o} on={often === o} onClick={() => setOften(o)}>
              {o}
            </Choice>
          ))}
        </div>
      </Field>
    </Sheet>
  );
}
