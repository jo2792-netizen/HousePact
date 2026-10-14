// The one place that saves data. Everything lives in this browser's localStorage.
import { useSyncExternalStore } from "react";
import type { Answers, Household } from "./agreement";

export type Chore = { name: string; who: number; often: "Daily" | "Weekly"; doneBy?: number; doneAt?: string };
export type Bill = {
  amount: number;
  paidBy: number;
  category: string;
  at: string;
  note?: string;
  paidTo?: number; // set for a payment between roommates
  splitWith?: number[]; // who shares the cost; everyone if not set (one person = an individual charge)
  repairId?: string; // the repair this cost came from
};
export type CalEvent = { kind: string; start: string; end: string; by: number; note?: string };
export type Note = { text: string; at: string; room?: string; photos?: string[] }; // a condition note, with photos as image data URLs
export type RepairStatus = "Reported" | "Scheduled" | "In Progress" | "Fixed";
export type Repair = {
  id: string;
  title: string;
  room: string;
  status: RepairStatus;
  fixer: "Landlord" | "Roommates"; // the landlord's repairs cost the house nothing
  reportedBy: number;
  at: string;
  note?: string;
  // Group costs are split equally; an individual cost is charged to one roommate. Either way it's added to Bills.
  cost?: { amount: number; split: "Group" | "Individual"; responsible: number; paidBy: number };
};

export type House = {
  name: string;
  mates: string[]; // a roommate's number is their place in this list
  me: number; // which roommate is using the app
  since: string; // setup date, starts the monthly Housepact bill
  info: Record<string, string>; // WiFi, trash days, contacts, emergency info
  notes: Note[]; // condition notes and before photos
  // the Roommate Agreement made during onboarding; signatures hold when each roommate signed
  agreement: { household: Household; answers: Answers; signatures: (string | null)[] };
  chores: Chore[];
  bills: Bill[];
  events: CalEvent[];
  photo?: string; // the apartment photo, as an image data URL
  repairs?: Repair[];
  rentPaid?: Record<string, number[]>; // roommates who paid their rent share, by month ("2026-11")
};

const KEY = "housepact-v4"; // change when the data shape changes, so old saves are ignored
const listeners = new Set<() => void>();
let current: House | null | undefined; // undefined = not read yet
let beforeReset: House | null = null;

function read() {
  if (current === undefined) {
    try {
      current = JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {
      current = null;
    }
  }
  return current;
}

export function save(house: House | null) {
  current = house;
  try {
    if (house) localStorage.setItem(KEY, JSON.stringify(house));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage is full (e.g. a very large photo); keep working in memory
  }
  listeners.forEach((listener) => listener());
}

/** Change some fields of the saved house. */
export function update(changes: Partial<House>) {
  save({ ...read()!, ...changes });
}

export function reset() {
  beforeReset = read() ?? null;
  save(null);
}

export function undoReset() {
  save(beforeReset);
  beforeReset = null;
}

export const canUndoReset = () => beforeReset !== null;

/** The saved house: undefined while loading, null if there isn't one yet. */
export function useHouse() {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
