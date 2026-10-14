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
};

// Calendar event types. "quiet" events clash with "busy" ones that overlap them.
export type Mood = "quiet" | "busy" | "info";
export const MOODS: Record<Mood, string> = { quiet: "Needs quiet", busy: "Busy house", info: "Heads-up" };
export const EVENTS: Record<string, { emoji: string; mood: Mood; from: string; to: string }> = {
  Interview: { emoji: "💼", mood: "quiet", from: "10:00", to: "11:00" },
  "Study session": { emoji: "📚", mood: "quiet", from: "14:00", to: "18:00" },
  "Work call": { emoji: "💻", mood: "quiet", from: "09:00", to: "10:00" },
  "Early night": { emoji: "😴", mood: "quiet", from: "22:00", to: "07:00" },
  "Quiet time": { emoji: "🤫", mood: "quiet", from: "23:00", to: "07:00" },
  Party: { emoji: "🎉", mood: "busy", from: "20:00", to: "23:00" },
  Dinner: { emoji: "🍽️", mood: "busy", from: "19:00", to: "21:00" },
  Breakfast: { emoji: "🥞", mood: "busy", from: "09:00", to: "10:30" },
  Lunch: { emoji: "🥪", mood: "busy", from: "12:00", to: "13:30" },
  "Club meeting": { emoji: "👥", mood: "busy", from: "18:00", to: "20:00" },
  "Game night": { emoji: "🎮", mood: "busy", from: "20:00", to: "23:00" },
  "Overnight guest": { emoji: "🛏️", mood: "busy", from: "20:00", to: "10:00" },
  "Repair visit": { emoji: "🔧", mood: "busy", from: "09:00", to: "12:00" },
  "House meeting": { emoji: "🏠", mood: "info", from: "19:00", to: "20:00" },
  Away: { emoji: "🧳", mood: "info", from: "09:00", to: "21:00" },
  Delivery: { emoji: "📦", mood: "info", from: "12:00", to: "16:00" },
};
const OPPOSITE: Record<Mood, Mood | null> = { quiet: "busy", busy: "quiet", info: null };
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

/** The event this one clashes with, if any: something that needs quiet overlapping a busy house. */
export const clashWith = (event: CalEvent, events: CalEvent[]) =>
  events.find((e) => EVENTS[e.kind].mood === OPPOSITE[EVENTS[event.kind].mood] && e.start < event.end && event.start < e.end);

/** The next event in the coming day that needs quiet, so the house gets a heads-up. */
export const headsUp = (events: CalEvent[]) =>
  upcoming(events).find(
    (e) => EVENTS[e.kind].mood === "quiet" && e.start < new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  );

export function googleCalendarLink(event: CalEvent, houseName: string) {
  const title = `${EVENTS[event.kind].emoji} ${event.note || event.kind} · ${houseName}`;
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
  // The example interview is about 2 hours from now, kept to daytime (otherwise tomorrow at 10am)
  const soon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 2);
  if (soon.getHours() > 18) soon.setDate(soon.getDate() + 1);
  if (soon.getHours() > 18 || soon.getHours() < 9) soon.setHours(10);

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
      { kind: "Interview", start: soon.toISOString(), end: new Date(soon.getTime() + 60 * 60 * 1000).toISOString(), by: m(3), note: "Video interview for a summer internship" },
      { kind: "Early night", start: at(0, 22), end: at(1, 7), by: m(2), note: "Early exam tomorrow" },
      { kind: "Repair visit", start: at(1, 13), end: at(1, 16), by: m(0), note: "Super is fixing the bathroom fan" },
      { kind: "Study session", start: at(2, 14), end: at(2, 18), by: m(2), note: "Midterm prep" },
      { kind: "Club meeting", start: at(3, 18), end: at(3, 20), by: m(1), note: "Photography club" },
      { kind: "Dinner", start: at(4, 19), end: at(4, 21), by: m(1), note: "Birthday dinner with friends" },
      { kind: "Away", start: at(5, 9), end: at(7, 21), by: m(3), note: "Visiting family for the weekend" },
      { kind: "Breakfast", start: at(6, 10), end: at(6, 12), by: m(0), note: "Pancakes for the house" },
    ],
  };
}
