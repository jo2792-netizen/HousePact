// The one place that saves data. Everything lives in this browser's localStorage.
import { useSyncExternalStore } from "react";

export type Chore = { name: string; who: number; often: "Daily" | "Weekly"; doneBy?: number; doneAt?: string };
export type Bill = { amount: number; paidBy: number; category: string; at: string };
export type CalEvent = { kind: "Quiet" | "Hosting"; start: string; end: string; by: number };

export type House = {
  name: string;
  mates: string[]; // a roommate's number is their place in this list
  me: number; // which roommate is using the app
  since: string; // setup date, starts the monthly Housepact bill
  info: Record<string, string>; // WiFi, trash days, contacts, emergency info
  notes: { text: string; at: string }[]; // condition tracker
  answers: number[] | null; // pact quiz answers, null until the quiz is done
  agreed: number[]; // roommates who agreed to the pact
  chores: Chore[];
  bills: Bill[];
  events: CalEvent[];
};

const KEY = "housepact";
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
  if (house) localStorage.setItem(KEY, JSON.stringify(house));
  else localStorage.removeItem(KEY);
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
