"use client";

import Link from "next/link";
import { useState } from "react";
import { AddButton, Card, PageHeader, Stat } from "@/components/cards";
import { Icon, type IconName } from "@/components/icons";
import { AddRepairCost, ReportRepair } from "@/components/sheets";
import { day, money } from "@/lib/house";
import { update, useHouse, type House, type Repair, type RepairStatus } from "@/lib/store";

const STATUSES: RepairStatus[] = ["Reported", "Scheduled", "In Progress", "Fixed"];
const STATUS_ICON: Record<RepairStatus, IconName> = { Reported: "alert", Scheduled: "calendar", "In Progress": "clock", Fixed: "check" };

export default function Repairs() {
  const h = useHouse();
  const [reporting, setReporting] = useState(false);
  const [costFor, setCostFor] = useState<Repair | null>(null);
  if (!h) return null;

  const repairs = h.repairs ?? [];
  const open = repairs.filter((r) => r.status !== "Fixed");
  const fixed = repairs.filter((r) => r.status === "Fixed");
  const spent = repairs.reduce((sum, r) => sum + (r.cost?.amount ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Repairs"
        subtitle="Report what needs fixing, track it until it's done, and send any cost to Bills."
        action={<AddButton label="Report Repair" onClick={() => setReporting(true)} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Open" value={String(open.length)} sub="Not fixed yet" />
        <Stat label="Fixed" value={String(fixed.length)} sub="All time" />
        <Stat label="Repair costs" value={money(spent)} sub="Added to Bills" href="/bills" />
      </div>

      {[
        { title: "Needs Attention", list: open, empty: "Nothing needs fixing right now." },
        { title: "Fixed", list: fixed, empty: "No repairs finished yet." },
      ].map(({ title, list, empty }) => (
        <Card key={title} title={title} icon="wrench">
          {list.length ? (
            <ul className="divide-y divide-separator">
              {list.map((r) => (
                <RepairRow key={r.id} h={h} r={r} onAddCost={() => setCostFor(r)} />
              ))}
            </ul>
          ) : (
            <p className="text-secondary">{empty}</p>
          )}
        </Card>
      ))}

      {reporting && <ReportRepair h={h} onClose={() => setReporting(false)} />}
      {costFor && <AddRepairCost h={h} repair={costFor} onClose={() => setCostFor(null)} />}
    </>
  );
}

function RepairRow({ h, r, onAddCost }: { h: House; r: Repair; onAddCost: () => void }) {
  const name = (i: number) => (i === h.me ? "you" : h.mates[i]);
  const setStatus = (status: RepairStatus) => update({ repairs: (h.repairs ?? []).map((x) => (x.id === r.id ? { ...x, status } : x)) });
  const next = STATUSES[STATUSES.indexOf(r.status) + 1]; // Reported, then Scheduled, In Progress, Fixed

  return (
    <li className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-semibold">{r.title}</p>
        <p className="text-subhead text-secondary">
          {r.room} · Reported by {name(r.reportedBy)} · {day(r.at)}
        </p>
        {r.note && <p className="text-subhead">{r.note}</p>}

        {/* Who pays */}
        {r.fixer === "Landlord" ? (
          <p className="flex items-center gap-2 text-subhead text-secondary">
            <Icon name="home" className="size-4 shrink-0" />
            The landlord&apos;s repair. No cost to the house.
          </p>
        ) : r.cost ? (
          <div className="flex gap-2 text-subhead">
            <Icon name="bills" className="mt-0.5 size-4 shrink-0 text-secondary" />
            <div>
              <p>
                <span className="font-semibold">{money(r.cost.amount)}</span>{" "}
                {r.cost.split === "Group"
                  ? `split ${h.mates.length} ways (${money(r.cost.amount / h.mates.length)} each)`
                  : `charged to ${name(r.cost.responsible)}`}
                , paid by {name(r.cost.paidBy)}.
              </p>
              <Link href="/bills" className="link">
                View in Bills
                <Icon name="chevron" className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-subhead text-secondary">
            No cost added yet.
            <button className="link" onClick={onAddCost}>
              <Icon name="plus" className="size-4" />
              Add Cost
            </button>
          </div>
        )}
      </div>

      {/* Status: icon and label, plus one button for the next step */}
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <span
          className={`inline-flex items-center gap-1 self-start rounded-md sm:self-end px-2 py-1 text-subhead font-semibold ${r.status === "Fixed" ? "bg-success-wash text-success" : "bg-fill text-secondary"}`}
        >
          <Icon name={STATUS_ICON[r.status]} className="size-4" />
          {r.status}
        </span>
        {next && (
          <button className="btn-secondary w-auto px-4 text-subhead" onClick={() => setStatus(next)}>
            <Icon name={STATUS_ICON[next]} className="size-4" />
            Mark as {next}
          </button>
        )}
      </div>
    </li>
  );
}
