"use client";

import { useState } from "react";
import { AddButton, BillRow, Card, PageHeader, RentCard, Stat } from "@/components/cards";
import { AddBill } from "@/components/sheets";
import { Dot } from "@/components/ui";
import { PAYMENT, allBills, debts, money, spentThisMonth } from "@/lib/house";
import { update, useHouse } from "@/lib/store";

export default function Bills() {
  const h = useHouse();
  const [adding, setAdding] = useState(false);
  if (!h) return null;

  const owed = debts(h);
  const iOwe = owed.filter((d) => d.from === h.me).reduce((sum, d) => sum + d.amount, 0);
  const owedToMe = owed.filter((d) => d.to === h.me).reduce((sum, d) => sum + d.amount, 0);
  const spent = spentThisMonth(h);
  const name = (i: number) => (i === h.me ? "You" : h.mates[i]);

  // Recording a payment settles that debt
  const settle = (from: number, to: number, amount: number) =>
    update({ bills: [...h.bills, { amount: Math.round(amount * 100) / 100, paidBy: from, paidTo: to, category: PAYMENT, at: new Date().toISOString() }] });

  // Expenses grouped by month, newest first
  const months = new Map<string, ReturnType<typeof allBills>>();
  for (const b of allBills(h)) {
    const month = new Date(b.at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.set(month, [...(months.get(month) ?? []), b]);
  }

  return (
    <>
      <PageHeader
        title="Bills"
        subtitle={`Shared costs are split equally ${h.mates.length} ways and tracked here.`}
        action={<AddButton label="Add bill" onClick={() => setAdding(true)} />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Spent this month" value={money(spent)} sub="Shared costs, not rent" />
        <Stat label="Your share this month" value={money(spent / h.mates.length)} sub={`One of ${h.mates.length} equal shares`} />
        {iOwe ? (
          <Stat label="You owe" value={money(iOwe)} sub="See balances below" alert />
        ) : (
          <Stat label={owedToMe ? "You're owed" : "Your balance"} value={owedToMe ? money(owedToMe) : "Settled"} sub={owedToMe ? "From your roommates" : "Nobody owes you"} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Balances" icon="users">
            {owed.length ? (
              <ul className="divide-y divide-line">
                {owed.map(({ from, to, amount }) => (
                  <li key={`${from}-${to}`} className="flex flex-col gap-2 py-3">
                    <div className="flex items-center gap-2">
                      <Dot i={from} name={h.mates[from]} />
                      <p className="min-w-0 flex-1">
                        <span className="font-semibold">{name(from)}</span> {from === h.me ? "owe" : "owes"}{" "}
                        <span className="font-semibold">{to === h.me ? "you" : name(to)}</span>
                      </p>
                      <span className={`text-xl font-bold tabular-nums ${from === h.me ? "text-alert" : ""}`}>{money(amount)}</span>
                    </div>
                    <button onClick={() => settle(from, to, amount)} className="self-end rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">
                      Mark paid
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Everyone is settled up.</p>
            )}
          </Card>
          <RentCard h={h} />
        </div>

        <Card title="Expenses" icon="bills" className="lg:col-span-3">
          {[...months].map(([month, bills]) => (
            <div key={month} className="mt-2 first:mt-0">
              <h3 className="flex justify-between border-b border-line pb-2 text-sm font-semibold text-muted">
                <span>{month}</span>
                <span>{money(bills.filter((b) => b.paidTo === undefined).reduce((sum, b) => sum + b.amount, 0))}</span>
              </h3>
              <ul className="divide-y divide-line">
                {bills.map((b, i) => (
                  <BillRow key={i} h={h} b={b} />
                ))}
              </ul>
            </div>
          ))}
        </Card>
      </div>

      {adding && <AddBill h={h} onClose={() => setAdding(false)} />}
    </>
  );
}
