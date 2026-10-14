"use client";

// The "Add" panels, shared by Home's quick actions and each tab.
import { useState } from "react";
import { Choice, DotPicker, Field, Sheet } from "@/components/ui";
import { toYMD } from "@/lib/agreement";
import { CATEGORIES, EVENTS, MOODS, money, type Mood } from "@/lib/house";
import { update, type Chore, type House } from "@/lib/store";

type Props = { h: House; onClose: () => void };

export function AddChore({ h, onClose }: Props) {
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
      <input autoFocus className="field" placeholder="e.g. Take out trash" aria-label="Chore" value={name} onChange={(e) => setName(e.target.value)} />
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

export function AddBill({ h, onClose }: Props) {
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(h.me);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const value = Number(amount);

  return (
    <Sheet
      title="Add bill"
      canSave={value > 0}
      onSave={() => update({ bills: [...h.bills, { amount: value, paidBy, category, note: note.trim(), at: new Date().toISOString() }] })}
      onClose={onClose}
    >
      <label className="field flex h-16 items-center gap-1 text-3xl font-bold">
        $
        <input
          autoFocus
          inputMode="decimal"
          placeholder="0"
          aria-label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          className="min-w-0 flex-1 outline-none"
        />
      </label>
      {value > 0 && (
        <p className="-mt-3 text-sm text-muted">
          Split {h.mates.length} ways: {money(value / h.mates.length)} each
        </p>
      )}
      <input className="field" placeholder="What for? (optional)" aria-label="What for" value={note} onChange={(e) => setNote(e.target.value)} />
      <Field label="Paid by">
        <DotPicker mates={h.mates} value={paidBy} onChange={setPaidBy} />
      </Field>
      <Field label="Category">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <Choice key={c} on={category === c} onClick={() => setCategory(c)}>
              {c}
            </Choice>
          ))}
        </div>
      </Field>
    </Sheet>
  );
}

export function AddEvent({ h, onClose }: Props) {
  const [kind, setKind] = useState("Interview");
  const [date, setDate] = useState(() => toYMD(new Date()));
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
              .map(([k]) => (
                <Choice key={k} on={kind === k} onClick={() => pickKind(k)}>
                  {k}
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
