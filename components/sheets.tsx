"use client";

// The "Add" panels, shared by Home's quick actions and each tab.
import { useState } from "react";
import { Choice, Field, NamePicker, Sheet } from "@/components/ui";
import { toYMD } from "@/lib/agreement";
import { CATEGORIES, EVENTS, MOODS, money, type Mood } from "@/lib/house";
import { update, type Chore, type House } from "@/lib/store";

type Props = { h: House; onClose: () => void };

// Example details for each event type, so the demo needs no typing
const EXAMPLES: Record<string, string> = {
  Interview: "Video interview for a summer internship",
  "Study session": "Studying for midterms",
  "Work call": "Weekly team meeting",
  "Early night": "Early shift tomorrow",
  "Quiet time": "Reading night",
  Party: "Birthday party",
  Dinner: "Dinner with friends",
  Breakfast: "Weekend pancakes",
  Lunch: "Lunch with coworkers",
  "Club meeting": "Book club",
  "Game night": "Board game night",
  "Overnight guest": "Friend visiting from Boston",
  "Repair visit": "Plumber fixing the kitchen sink",
  "House meeting": "Monthly check-in",
  Away: "Weekend trip home",
  Delivery: "New couch arriving",
};

const MOOD_HELP: Record<Mood, string> = {
  quiet: "You need the house quiet. Overlapping busy events get flagged.",
  busy: "Guests, noise, or the kitchen in use.",
  info: "Just letting everyone know.",
};

export function AddChore({ h, onClose }: Props) {
  const [name, setName] = useState("Clean out the fridge"); // pre-filled for the demo
  const [who, setWho] = useState(h.me);
  const [often, setOften] = useState<Chore["often"]>("Weekly");

  return (
    <Sheet
      title="New Chore"
      action="Add Chore"
      canSave={!!name.trim()}
      onSave={() => update({ chores: [...h.chores, { name: name.trim(), who, often }] })}
      onClose={onClose}
    >
      <Field label="Chore">
        <input autoFocus className="field" placeholder="For example, Take out trash" aria-label="Chore" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Assigned To">
        <NamePicker label="Assigned to" mates={h.mates} value={who} onChange={setWho} />
      </Field>
      <Field label="Repeats" help="Daily chores reset each day. Weekly chores reset after 7 days.">
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
  const [amount, setAmount] = useState("45"); // pre-filled for the demo
  const [paidBy, setPaidBy] = useState(h.me);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("Paper towels and dish soap");
  const value = Number(amount);

  return (
    <Sheet
      title="New Bill"
      action="Add Bill"
      canSave={value > 0}
      onSave={() => update({ bills: [...h.bills, { amount: value, paidBy, category, note: note.trim(), at: new Date().toISOString() }] })}
      onClose={onClose}
    >
      <label className="field flex h-16 items-center gap-1 text-title1 font-bold">
        $
        <input
          autoFocus
          inputMode="decimal"
          placeholder="0"
          aria-label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
          className="h-full min-w-0 flex-1 bg-transparent outline-none"
        />
      </label>
      {value > 0 && (
        <p className="-mt-4 text-subhead text-secondary">
          Split {h.mates.length} ways: {money(value / h.mates.length)} each
        </p>
      )}
      <Field label="Description" help="Optional. Shown in the bills list.">
        <input className="field" placeholder="For example, Con Ed electric" aria-label="Description" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <Field label="Paid By">
        <NamePicker label="Paid by" mates={h.mates} value={paidBy} onChange={setPaidBy} />
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
  const [note, setNote] = useState(EXAMPLES.Interview);

  // Picking a type fills in its usual times and example details (unless you wrote your own)
  const pickKind = (k: string) => {
    if (!note.trim() || note === EXAMPLES[kind]) setNote(EXAMPLES[k]);
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
    <Sheet title="New Event" action="Add Event" canSave={!!(date && from && to)} onSave={save} onClose={onClose}>
      {(Object.keys(MOODS) as Mood[]).map((mood) => (
        <Field key={mood} label={MOODS[mood]} help={MOOD_HELP[mood]}>
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
      <Field label="Details" help="Optional. Shown on the calendar.">
        <input className="field" aria-label="Details" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
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
