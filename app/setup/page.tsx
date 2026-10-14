"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dot } from "@/components/ui";
import { demoHouse, newHouse } from "@/lib/house";
import { canUndoReset, save, undoReset, useHouse } from "@/lib/store";

export default function Setup() {
  const house = useHouse();
  const router = useRouter();
  const [name, setName] = useState("");
  const [mates, setMates] = useState(["", ""]);

  // Once a house exists, go Home
  useEffect(() => {
    if (house) router.replace("/");
  }, [house, router]);

  if (house !== null) return null;

  const names = mates.map((m) => m.trim()).filter(Boolean);

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-10">
      <h1>Housepact</h1>
      <p className="-mt-2 mb-4 text-muted">No awkward conversations, just agree once.</p>

      <input className="field" placeholder="House name" aria-label="House name" value={name} onChange={(e) => setName(e.target.value)} />
      {mates.map((mate, i) => (
        <div key={i} className="flex items-center gap-3">
          <Dot i={i} name={mate} />
          <input
            className="field"
            placeholder={i === 0 ? "Your name" : "Roommate"}
            aria-label={i === 0 ? "Your name" : "Roommate"}
            value={mate}
            onChange={(e) => setMates(mates.map((m, j) => (j === i ? e.target.value : m)))}
          />
        </div>
      ))}
      {mates.length < 6 && (
        <button className="self-start py-3 font-semibold" onClick={() => setMates([...mates, ""])}>
          + Add roommate
        </button>
      )}

      <button className="btn mt-4" disabled={!name.trim() || names.length < 2} onClick={() => save(newHouse(name.trim(), names))}>
        Start
      </button>
      <button className="btn border border-line bg-white text-ink" onClick={() => save(demoHouse())}>
        Load demo house
      </button>
      {canUndoReset() && (
        <button className="self-center px-4 py-3 text-sm text-muted" onClick={undoReset}>
          Undo reset
        </button>
      )}
    </main>
  );
}
