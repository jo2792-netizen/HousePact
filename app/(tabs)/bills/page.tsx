"use client";

import { useState } from "react";
import { Choice, Dot, DotPicker, Field, Sheet } from "@/components/ui";
import { CATEGORIES, HOUSEPACT, allBills, day, debts, money } from "@/lib/house";
import { update, useHouse, type House } from "@/lib/store";

export default function Bills() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  const owed = debts(h);
  const who = (i: number, you: string) => (i === h.me ? you : <Dot i={i} name={h.mates[i]} />);

  return (
    <>
      <h1>Bills</h1>
      <section className="card flex flex-col gap-3">
        {!owed.length && <p className="text-2xl font-bold">All settled ✓</p>}
        {owed.map(({ from, to, amount }) => (
          <div key={`${from}-${to}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              {who(from, "You")} {from === h.me ? "owe" : "owes"} {who(to, "you")}
            </span>
            <span className={`text-3xl font-bold ${from === h.me ? "text-alert" : ""}`}>{money(amount)}</span>
          </div>
        ))}
      </section>

      <ul className="divide-y divide-line rounded-xl bg-white px-4">
        {allBills(h).map((b, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p>{b.note || b.category}</p>
              <p className="text-sm text-muted">
                {b.category === HOUSEPACT ? "Monthly" : b.category} · {day(b.at)}
              </p>
            </div>
            <Dot i={b.paidBy} name={h.mates[b.paidBy]} />
            <span className="w-20 text-right font-semibold">{money(b.amount)}</span>
          </li>
        ))}
      </ul>
      <button className="btn" onClick={() => setAdding(true)}>
        Add bill
      </button>
      {adding && <AddBill h={h} onClose={() => setAdding(false)} />}
    </>
  );
}

function AddBill({ h, onClose }: { h: House; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(h.me);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const value = Number(amount);

  return (
    <Sheet
      title="Add bill"
      canSave={value > 0}
      onSave={() =>
        update({ bills: [...h.bills, { amount: value, paidBy, category, note: note.trim(), at: new Date().toISOString() }] })
      }
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
      {value > 0 && <p className="-mt-3 text-sm text-muted">{money(value / h.mates.length)} each</p>}
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
