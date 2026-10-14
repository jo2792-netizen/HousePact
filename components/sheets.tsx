"use client";

// The "Add" panels, shared by Home's quick actions and each tab.
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/icons";
import { Choice, Field, NamePicker, Sheet } from "@/components/ui";
import { toYMD } from "@/lib/agreement";
import { CATEGORIES, EVENTS, MOODS, money, repairBill, type Mood } from "@/lib/house";
import { ROOMS, compressPhoto } from "@/lib/photos";
import { update, type Chore, type House, type Repair } from "@/lib/store";

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

/* ---------- Condition and repairs ---------- */

/** Thumbnails of chosen photos, each removable, plus a button to add more. */
export function PhotoPicker({ photos, onChange }: { photos: string[]; onChange: (photos: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const add = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    onChange([...photos, ...(await Promise.all(files.map((f) => compressPhoto(f))))]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((src, i) => (
        <div key={i} className="relative size-20 overflow-hidden rounded-xl bg-fill">
          <Image src={src} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" />
          <button
            type="button"
            aria-label={`Remove photo ${i + 1}`}
            onClick={() => onChange(photos.filter((_, j) => j !== i))}
            className="absolute top-0 right-0 flex size-11 items-start justify-end p-1"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white">
              <Icon name="xmark" className="size-4" />
            </span>
          </button>
        </div>
      ))}
      <button type="button" onClick={() => input.current?.click()} className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl bg-fill text-subhead font-semibold text-accent-ink">
        <Icon name="camera" />
        Add
      </button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" aria-label="Choose photos" onChange={add} />
    </div>
  );
}

export function AddNote({ h, onClose }: Props) {
  const [room, setRoom] = useState("Hallway");
  const [text, setText] = useState("Small dent in the hallway wall"); // pre-filled for the demo
  const [photos, setPhotos] = useState<string[]>([]);
  return (
    <Sheet
      title="New Condition Note"
      action="Add Note"
      canSave={!!text.trim()}
      onSave={() => update({ notes: [...h.notes, { text: text.trim(), room, photos, at: new Date().toISOString() }] })}
      onClose={onClose}
    >
      <Field label="Room">
        <RoomPicker value={room} onChange={setRoom} />
      </Field>
      <Field label="What You Noticed">
        <input className="field" aria-label="What you noticed" value={text} onChange={(e) => setText(e.target.value)} />
      </Field>
      <Field label="Photos" help="Clear photos with the date protect everyone's deposit.">
        <PhotoPicker photos={photos} onChange={setPhotos} />
      </Field>
    </Sheet>
  );
}

function RoomPicker({ value, onChange }: { value: string; onChange: (room: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Room" className="flex flex-wrap gap-2">
      {ROOMS.map((r) => (
        <Choice key={r} on={value === r} onClick={() => onChange(r)}>
          {r}
        </Choice>
      ))}
    </div>
  );
}

type Cost = NonNullable<Repair["cost"]>;

/** Amount, who pays, and who paid. Shows exactly what will be added to Bills. */
function CostFields({ h, cost, setCost, amount, setAmount }: { h: House; cost: Cost; setCost: (c: Cost) => void; amount: string; setAmount: (a: string) => void }) {
  const value = Number(amount);
  const name = (i: number) => (i === h.me ? "you" : h.mates[i]);
  return (
    <>
      <Field label="Cost" help="Leave it blank if you don't know yet. You can add it later.">
        <label className="field flex items-center gap-1 text-title3 font-semibold">
          $
          <input
            inputMode="decimal"
            aria-label="Cost"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="h-full min-w-0 flex-1 bg-transparent outline-none"
          />
        </label>
      </Field>
      <Field label="Who Pays">
        <div className="grid grid-cols-2 gap-2">
          {(["Group", "Individual"] as const).map((split) => (
            <Choice key={split} on={cost.split === split} onClick={() => setCost({ ...cost, split })}>
              {split === "Group" ? "Split Equally" : "One Roommate"}
            </Choice>
          ))}
        </div>
      </Field>
      {cost.split === "Individual" && (
        <Field label="Charged To" help="For damage one person caused.">
          <NamePicker label="Charged to" mates={h.mates} value={cost.responsible} onChange={(responsible) => setCost({ ...cost, responsible })} />
        </Field>
      )}
      <Field label="Paid By" help="Who paid the repair person or bought the parts.">
        <NamePicker label="Paid by" mates={h.mates} value={cost.paidBy} onChange={(paidBy) => setCost({ ...cost, paidBy })} />
      </Field>
      {value > 0 && (
        <p className="flex gap-2 rounded-xl bg-fill p-4 text-subhead">
          <Icon name="bills" className="mt-0.5 size-4 shrink-0 text-secondary" />
          {cost.split === "Group"
            ? `Adds ${money(value)} to Bills, split ${h.mates.length} ways (${money(value / h.mates.length)} each).`
            : `Adds a ${money(value)} charge to Bills for ${name(cost.responsible)}${cost.responsible === cost.paidBy ? ", who already paid it." : `, owed to ${name(cost.paidBy)}.`}`}
        </p>
      )}
    </>
  );
}

export function ReportRepair({ h, onClose, preset }: Props & { preset?: { title: string; room: string } }) {
  const [title, setTitle] = useState(preset?.title ?? "Running toilet"); // pre-filled for the demo
  const [room, setRoom] = useState(preset?.room ?? "Bathroom");
  const [fixer, setFixer] = useState<Repair["fixer"]>("Roommates");
  const [amount, setAmount] = useState(preset ? "" : "85");
  const [cost, setCost] = useState<Cost>({ amount: 0, split: "Group", responsible: h.me, paidBy: h.me });
  const [note, setNote] = useState("");

  const save = () => {
    const value = Number(amount);
    const repair: Repair = {
      id: `r${Date.now().toString(36)}`,
      title: title.trim(),
      room,
      status: "Reported",
      fixer,
      reportedBy: h.me,
      at: new Date().toISOString(),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(fixer === "Roommates" && value > 0 ? { cost: { ...cost, amount: value } } : {}),
    };
    update({ repairs: [...(h.repairs ?? []), repair], ...(repair.cost ? { bills: [...h.bills, repairBill(repair)] } : {}) });
  };

  return (
    <Sheet title="New Repair" action="Report Repair" canSave={!!title.trim()} onSave={save} onClose={onClose}>
      <Field label="What Needs Fixing">
        <input className="field" aria-label="What needs fixing" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Room">
        <RoomPicker value={room} onChange={setRoom} />
      </Field>
      <Field label="Who Fixes It" help="Landlords usually cover broken fixtures and normal wear. Roommates cover damage they cause.">
        <div className="grid grid-cols-2 gap-2">
          {(["Landlord", "Roommates"] as const).map((f) => (
            <Choice key={f} on={fixer === f} onClick={() => setFixer(f)}>
              {f}
            </Choice>
          ))}
        </div>
      </Field>
      {fixer === "Roommates" && <CostFields h={h} cost={cost} setCost={setCost} amount={amount} setAmount={setAmount} />}
      <Field label="Details" help="Optional.">
        <input className="field" aria-label="Details" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Sheet>
  );
}

/** Add the cost to a repair that didn't have one yet; it goes straight to Bills. */
export function AddRepairCost({ h, repair, onClose }: Props & { repair: Repair }) {
  const [amount, setAmount] = useState("85");
  const [cost, setCost] = useState<Cost>({ amount: 0, split: "Group", responsible: h.me, paidBy: h.me });
  const save = () => {
    const updated: Repair = { ...repair, cost: { ...cost, amount: Number(amount) } };
    update({ repairs: (h.repairs ?? []).map((r) => (r.id === repair.id ? updated : r)), bills: [...h.bills, repairBill(updated)] });
  };
  return (
    <Sheet title={repair.title} action="Add to Bills" canSave={Number(amount) > 0} onSave={save} onClose={onClose}>
      <CostFields h={h} cost={cost} setCost={setCost} amount={amount} setAmount={setAmount} />
    </Sheet>
  );
}
