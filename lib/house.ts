import type { Bill, CalEvent, Chore, House } from "./store";

export const COLORS = ["#4F7CFF", "#2BB673", "#F28C38", "#A66CFF", "#EC5FA0", "#20B2C4"];
export const CATEGORIES = ["Groceries", "Utilities", "Repairs", "Furniture"];
export const HOUSEPACT = "Housepact";
export const EMOJI: Record<string, string> = {
  Groceries: "🛒",
  Utilities: "💡",
  Repairs: "🔧",
  Furniture: "🛋️",
  Housepact: "🏠",
  Quiet: "🤫",
  Hosting: "🎉",
};
const PRICE = 8; // Housepact subscription per house, per month

// Pact quiz: one question per topic. The picked answer fills in the {} of the rule.
export const QUIZ = [
  { topic: "🍽️ Kitchen", q: "Dishes get washed", options: ["Right away", "By bedtime", "Within 2 days"], rule: "Dishes get washed {}." },
  { topic: "🛋️ Shared stuff", q: "Borrowing food or stuff", options: ["Ask first", "Basics are fine", "Anything goes"], rule: "Borrowing food or stuff: {}." },
  { topic: "🛏️ Guests", q: "Overnight guests", options: ["Give a heads-up", "Max 2 nights a week", "Ask everyone first"], rule: "Overnight guests: {}." },
  { topic: "🌙 Quiet hours", q: "Quiet hours start at", options: ["10pm", "11pm", "Midnight"], rule: "Quiet hours start at {}." },
  { topic: "🔑 Sublets", q: "Subletting your room", options: ["Not allowed", "Allowed if all agree", "Allowed with notice"], rule: "Subletting is {}." },
  { topic: "⚖️ Breaking the pact", q: "If someone breaks the pact", options: ["We talk it out", "We hold a house meeting", "They restock supplies"], rule: "If someone breaks the pact, {}." },
];

export const pactRules = (answers: number[]) =>
  QUIZ.map(({ options, rule }, i) => {
    const answer = options[answers[i]];
    return rule.replace("{}", answer[0].toLowerCase() + answer.slice(1));
  });

/** Add a roommate to a list, or take them off if they're already on it. */
export const toggle = (list: number[], i: number) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);

/** Daily chores stay done for the day, weekly chores for 7 days. */
export function isDone(chore: Chore) {
  if (!chore.doneAt) return false;
  const done = new Date(chore.doneAt);
  if (chore.often === "Daily") return done.toDateString() === new Date().toDateString();
  return Date.now() - done.getTime() < 7 * 24 * 60 * 60 * 1000;
}

/** Every bill, newest first, including the Housepact subscription for each month since setup. */
export function allBills(house: House): Bill[] {
  const bills = [...house.bills];
  // The main tenant pays the subscription; it's split like any other bill.
  for (const d = new Date(house.since); d <= new Date(); d.setMonth(d.getMonth() + 1)) {
    bills.push({ amount: PRICE, paidBy: 0, category: HOUSEPACT, at: d.toISOString() });
  }
  return bills.sort((a, b) => b.at.localeCompare(a.at));
}

/** Who owes whom, with every bill split equally. */
export function debts(house: House) {
  const net = house.mates.map(() => 0); // above 0: is owed money, below 0: owes money
  for (const bill of allBills(house)) {
    net[bill.paidBy] += bill.amount;
    for (let i = 0; i < net.length; i++) net[i] -= bill.amount / net.length;
  }
  // Settle the biggest debt with the biggest credit until everyone is even
  const list: { from: number; to: number; amount: number }[] = [];
  while (true) {
    const from = net.indexOf(Math.min(...net));
    const to = net.indexOf(Math.max(...net));
    const amount = Math.min(-net[from], net[to]);
    if (amount < 0.01) return list;
    list.push({ from, to, amount });
    net[from] += amount;
    net[to] -= amount;
  }
}

/** Events that haven't ended yet, soonest first. */
export const upcoming = (events: CalEvent[]) =>
  events.filter((e) => e.end > new Date().toISOString()).sort((a, b) => a.start.localeCompare(b.start));

/** Quiet time and hosting can't overlap. */
export const clashes = (event: CalEvent, events: CalEvent[]) =>
  events.some((e) => e.kind !== event.kind && e.start < event.end && event.start < e.end);

export function googleCalendarLink(event: CalEvent, houseName: string) {
  const title = `${event.note || (event.kind === "Quiet" ? "Quiet time" : "Hosting")} · ${houseName}`;
  const utc = (iso: string) => iso.replace(/[-:]|\.\d+/g, ""); // 20261015T180000Z
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${utc(event.start)}/${utc(event.end)}`;
}

export const money = (n: number) => "$" + n.toFixed(2).replace(".00", "");
export const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(":00", "").replace(/\s/g, "").toLowerCase();
export const when = (iso: string) => `${new Date(iso).toLocaleDateString("en-US", { weekday: "short" })} ${time(iso)}`;

/**
 * The house made at the end of onboarding. It comes with realistic example
 * info, chores, bills, and events (dated around today) so every tab has something to show.
 */
export function newHouse(name: string, mates: string[], answers: number[], agreed: number[]): House {
  const now = new Date();
  const at = (days: number, hour = 12) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, hour).toISOString();
  const moveIn = new Date(now.getFullYear(), now.getMonth() - 1, 1, 9).toISOString();
  const m = (i: number) => i % mates.length; // works for any number of roommates

  return {
    name,
    mates,
    me: 0,
    since: moveIn,
    answers,
    agreed,
    info: {
      wifi: `${name.replace(/\s/g, "")}-5G`,
      password: "sunnyside42",
      trash: "Tue & Fri",
      super: "Mike · (212) 555-0142",
      hoa: "Greenpoint Mgmt · (212) 555-0199",
      emergency: "Building security · (212) 555-0110",
      water: "Under the kitchen sink",
      breaker: "Hall closet, top shelf",
    },
    notes: [
      { text: "Scratch on kitchen counter, move-in", at: moveIn },
      { text: "Small stain on living room carpet", at: moveIn },
      { text: "Bathroom fan is loud", at: at(-12) },
    ],
    chores: [
      { name: "Wash dishes", who: m(0), often: "Daily" },
      { name: "Take out trash", who: m(1), often: "Weekly" },
      { name: "Clean bathroom", who: m(2), often: "Weekly", doneBy: m(2), doneAt: at(-1, 18) },
      { name: "Vacuum living room", who: m(3), often: "Weekly" },
      { name: "Wipe kitchen counters", who: m(0), often: "Daily" },
    ],
    bills: [
      { amount: 132, paidBy: m(1), category: "Utilities", note: "Con Ed electric", at: at(-20) },
      { amount: 60, paidBy: m(2), category: "Repairs", note: "Plumber, kitchen sink", at: at(-9) },
      { amount: 86.4, paidBy: m(3), category: "Groceries", note: "Trader Joe's run", at: at(-6) },
      { amount: 31.6, paidBy: m(0), category: "Groceries", note: "Paper towels & dish soap", at: at(-2) },
    ],
    events: [
      { kind: "Quiet", start: at(0, 22), end: at(1, 7), by: m(3), note: "Early exam tomorrow" },
      { kind: "Quiet", start: at(2, 14), end: at(2, 18), by: m(2), note: "Study session" },
      { kind: "Hosting", start: at(4, 19), end: at(4, 23), by: m(1), note: "Birthday dinner" },
    ],
  };
}
