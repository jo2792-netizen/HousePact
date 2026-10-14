// The Roommate Agreement: question options, sample answers, review summaries,
// and the template that turns answers into the formal agreement text.
// Everything here is plain, deterministic logic: the same answers always produce the same agreement.

export type Household = {
  address: string;
  names: string[];
  leaseStart: string; // YYYY-MM-DD
  leaseEnd: string;
  effective: string;
};

export type Answers = {
  // 1. Cleanliness
  clean: number; // 1 (Relaxed) to 5 (Spotless)
  dishes: "now" | "day" | "24h";
  // 2. Chores
  chores: "rotation" | "fixed" | "signup";
  owners: number[]; // roommate responsible for each zone (fixed assignments)
  makeup: "24h" | "48h" | "next";
  // 3. Rent, utilities, and groceries
  rent: number;
  split: "equal" | "custom";
  percents: number[];
  payer: number; // roommate who pays the landlord, or -1 if everyone pays directly
  due: "5" | "3" | "0";
  utilities: "equal" | "rent" | "included";
  groceries: "separate" | "staples" | "shared";
  // 4. Food and belongings
  borrowing: "ask" | "staples" | "open";
  items: "24h" | "48h" | "7d";
  joint: "buyout" | "sell";
  // 5. Guests
  guestNotice: "day" | "24h" | "48h";
  nights: number; // 1 to 7 consecutive nights
  cap: number; // nights per month, 0 = no cap
  parties: "notice" | "majority" | "none";
  // 6. Quiet hours
  quiet: "early" | "standard" | "late" | "custom";
  weeknight: [string, string]; // HH:MM start, end
  weekend: [string, string];
  headphones: boolean;
  // 7. Damage
  report: "24h" | "48h" | "7d";
  unattributed: "equal" | "rent";
  insurance: "required" | "recommended" | "none";
  photos: boolean;
  // 8. Sublets, move-out, and disagreements
  sublet: "none" | "unanimous" | "majority";
  notice: 30 | 60 | 90;
  disputes: "direct" | "meeting" | "mediator";
  meetings: "weekly" | "biweekly" | "monthly" | "asneeded";
};

export type Option<T> = { value: T; label: string; help: string; rec?: boolean };

/* ---------- Question options ---------- */

export const CLEAN_LEVELS = [
  {
    label: "Relaxed",
    help: "Lived-in is fine. Clean up when it starts to bother someone.",
    clause: "the Common Areas may appear lived-in, provided that they remain sanitary, free of food waste, and safe to use",
    freq: "at least once every two (2) weeks",
  },
  {
    label: "Easygoing",
    help: "Clutter can sit for a day or two. Cleaning happens weekly.",
    clause: "clutter in the Common Areas is cleared within two (2) days and the Common Areas remain sanitary at all times",
    freq: "at least once each week",
  },
  {
    label: "Balanced",
    help: "Shared spaces are reset every evening and cleaned weekly.",
    clause: "the Common Areas are returned to a tidy condition by the end of each day, with personal items put away and surfaces clear",
    freq: "at least once each week",
  },
  {
    label: "Tidy",
    help: "Shared spaces stay guest-ready most of the time.",
    clause: "the Common Areas are kept in a guest-ready condition at all times, with items put away promptly after use",
    freq: "at least twice each week",
  },
  {
    label: "Spotless",
    help: "Everything is put away right after use, with frequent cleaning.",
    clause: "every item used in the Common Areas is cleaned and put away immediately after use, and the Common Areas are kept spotless at all times",
    freq: "at least three (3) times each week",
  },
];
export const CLEAN_DEFAULT = 3;

export const DISHES: Option<Answers["dishes"]>[] = [
  { value: "now", label: "Right after use", help: "Nothing sits in the sink." },
  { value: "day", label: "Same day", help: "Washed before bed.", rec: true },
  { value: "24h", label: "Within 24 hours", help: "Flexibility for busy days." },
];

export const ZONES = [
  {
    name: "Kitchen",
    tasks: [
      "wiping down the counters, stovetop, and dining table",
      "cleaning the sink and the exterior of all appliances",
      "cleaning the inside of the microwave",
      "sweeping and mopping the floor",
    ],
  },
  {
    name: "Bathrooms",
    tasks: [
      "cleaning the toilet, sink, and mirror",
      "scrubbing the shower or tub",
      "emptying the wastebasket",
      "sweeping and mopping the floor",
    ],
  },
  {
    name: "Living Areas",
    tasks: [
      "vacuuming or sweeping all floors",
      "dusting surfaces and shelves",
      "returning shared items to their proper place",
      "wiping door handles and light switches",
    ],
  },
  {
    name: "Trash and Supplies",
    tasks: [
      "taking trash and recycling to the curb on collection days",
      "replacing trash and recycling liners",
      "monitoring the Shared Supplies and restocking them when low",
      "recording supply purchases in Housepact",
    ],
  },
];

export const CHORE_SYSTEMS: Option<Answers["chores"]>[] = [
  { value: "rotation", label: "Weekly rotation", help: "Everyone takes a turn at every zone.", rec: true },
  { value: "fixed", label: "Fixed assignments", help: "Each person keeps the same zone." },
  { value: "signup", label: "Weekly sign-up", help: "Claim zones each week in the app." },
];

export const MAKEUP: Option<Answers["makeup"]>[] = [
  { value: "24h", label: "Within 24 hours", help: "Fast catch-up keeps things fair." },
  { value: "48h", label: "Within 48 hours", help: "Room to recover from a busy day.", rec: true },
  { value: "next", label: "Before the next rotation", help: "Finish it before the week resets." },
];

export const SPLITS: Option<Answers["split"]>[] = [
  { value: "equal", label: "Split equally", help: "Everyone pays the same share.", rec: true },
  { value: "custom", label: "Custom percentages", help: "For different room sizes or features." },
];

export const DUE: Option<Answers["due"]>[] = [
  { value: "5", label: "5 days before rent is due", help: "A buffer so rent is never late.", rec: true },
  { value: "3", label: "3 days before rent is due", help: "A shorter buffer." },
  { value: "0", label: "On the rent due date", help: "Works only if everyone pays on time." },
];

export const UTILITIES: Option<Answers["utilities"]>[] = [
  { value: "equal", label: "Split equally", help: "Everyone uses roughly the same.", rec: true },
  { value: "rent", label: "Same split as rent", help: "Bigger shares of rent pay bigger shares of utilities." },
  { value: "included", label: "Included in rent", help: "The landlord covers utilities." },
];

export const GROCERIES: Option<Answers["groceries"]>[] = [
  { value: "separate", label: "Separate", help: "Everyone buys their own food." },
  { value: "staples", label: "Share staples", help: "Split basics like oil, spices, and coffee.", rec: true },
  { value: "shared", label: "Fully shared", help: "Shop and cook together, split it all." },
];

export const BORROWING: Option<Answers["borrowing"]>[] = [
  { value: "ask", label: "Ask first", help: "Always ask before using someone's food.", rec: true },
  { value: "staples", label: "Staples are fair game", help: "Basics are free to use; ask for the rest." },
  { value: "open", label: "Help yourself", help: "Use what you need, replace what you finish." },
];

export const ITEMS: Option<Answers["items"]>[] = [
  { value: "24h", label: "24 hours", help: "Keeps shared spaces clear.", rec: true },
  { value: "48h", label: "48 hours", help: "A little more slack." },
  { value: "7d", label: "One week", help: "The most relaxed option." },
];

export const JOINT: Option<Answers["joint"]>[] = [
  { value: "buyout", label: "Buyout", help: "Staying roommates can buy the departing roommate's share.", rec: true },
  { value: "sell", label: "Sell and split", help: "Sell the item and divide the money." },
];

export const GUEST_NOTICE: Option<Answers["guestNotice"]>[] = [
  { value: "day", label: "Same day", help: "A heads-up before the guest arrives." },
  { value: "24h", label: "24 hours", help: "Time for roommates to plan.", rec: true },
  { value: "48h", label: "48 hours", help: "The most notice." },
];

export const NIGHTS_DEFAULT = 3;

export const CAPS: Option<number>[] = [
  { value: 4, label: "4 nights per month", help: "" },
  { value: 6, label: "6 nights per month", help: "" },
  { value: 8, label: "8 nights per month", help: "", rec: true },
  { value: 10, label: "10 nights per month", help: "" },
  { value: 12, label: "12 nights per month", help: "" },
  { value: 0, label: "No monthly cap", help: "" },
];

export const PARTIES: Option<Answers["parties"]>[] = [
  { value: "notice", label: "Notice and no objections", help: "48 hours' notice, and anyone can object.", rec: true },
  { value: "majority", label: "Majority approval", help: "Most of the house has to say yes." },
  { value: "none", label: "Not permitted", help: "No parties at the apartment." },
];

export const QUIET_PRESETS: (Option<Answers["quiet"]> & { weeknight?: [string, string]; weekend?: [string, string] })[] = [
  { value: "early", label: "Early", help: "", weeknight: ["21:00", "07:00"], weekend: ["23:00", "09:00"] },
  { value: "standard", label: "Standard", help: "", weeknight: ["22:00", "07:00"], weekend: ["00:00", "09:00"], rec: true },
  { value: "late", label: "Late", help: "", weeknight: ["00:00", "08:00"], weekend: ["01:00", "10:00"] },
  { value: "custom", label: "Custom", help: "Set your own times." },
];

export const REPORT: Option<Answers["report"]>[] = [
  { value: "24h", label: "Within 24 hours", help: "Small problems stay small.", rec: true },
  { value: "48h", label: "Within 48 hours", help: "A little more time." },
  { value: "7d", label: "Within one week", help: "The most relaxed option." },
];

export const UNATTRIBUTED: Option<Answers["unattributed"]>[] = [
  { value: "equal", label: "Split equally", help: "Shared space, shared cost.", rec: true },
  { value: "rent", label: "Same split as rent", help: "Matches each person's share of rent." },
];

export const INSURANCE: Option<Answers["insurance"]>[] = [
  { value: "required", label: "Required", help: "Everyone carries their own policy.", rec: true },
  { value: "recommended", label: "Recommended", help: "Encouraged but optional." },
  { value: "none", label: "Not addressed", help: "Each person bears their own risk." },
];

export const SUBLET: Option<Answers["sublet"]>[] = [
  { value: "none", label: "Not allowed", help: "No sublets for any length of time." },
  { value: "unanimous", label: "Unanimous approval", help: "Everyone must approve the subtenant.", rec: true },
  { value: "majority", label: "Majority approval", help: "Most of the house must approve." },
];

export const NOTICE: Option<Answers["notice"]>[] = [
  { value: 30, label: "30 days", help: "The shortest notice." },
  { value: 60, label: "60 days", help: "Time to find a replacement.", rec: true },
  { value: 90, label: "90 days", help: "The most time to plan." },
];

export const DISPUTES: Option<Answers["disputes"]>[] = [
  { value: "direct", label: "Talk first", help: "Direct conversation, then a house meeting, then a mediator.", rec: true },
  { value: "meeting", label: "House meeting first", help: "Bring it to the group, then vote, then a mediator." },
  { value: "mediator", label: "Mediator early", help: "Written notice, then a neutral mediator." },
];

export const MEETINGS: Option<Answers["meetings"]>[] = [
  { value: "weekly", label: "Weekly", help: "" },
  { value: "biweekly", label: "Every two weeks", help: "" },
  { value: "monthly", label: "Monthly", help: "", rec: true },
  { value: "asneeded", label: "As needed (at least quarterly)", help: "" },
];

/* ---------- Defaults and sample data ---------- */

export function evenPercents(n: number) {
  const base = Math.floor(100 / n);
  return Array.from({ length: n }, (_, i) => (i < 100 - base * n ? base + 1 : base));
}

export function defaultAnswers(n: number): Answers {
  return {
    clean: CLEAN_DEFAULT,
    dishes: "day",
    chores: "rotation",
    owners: ZONES.map((_, z) => z % n),
    makeup: "48h",
    rent: 4800, // pre-filled for the demo
    split: "equal",
    percents: evenPercents(n),
    payer: 0,
    due: "5",
    utilities: "equal",
    groceries: "staples",
    borrowing: "ask",
    items: "24h",
    joint: "buyout",
    guestNotice: "24h",
    nights: NIGHTS_DEFAULT,
    cap: 8,
    parties: "notice",
    quiet: "standard",
    weeknight: ["22:00", "07:00"],
    weekend: ["00:00", "09:00"],
    headphones: true,
    report: "24h",
    unattributed: "equal",
    insurance: "required",
    photos: true,
    sublet: "unanimous",
    notice: 60,
    disputes: "direct",
    meetings: "monthly",
  };
}

/** Keep roommate-dependent answers valid when the number of roommates changes. */
export function fitAnswers(a: Answers, n: number): Answers {
  if (a.percents.length === n) return a;
  return { ...a, percents: evenPercents(n), owners: a.owners.map((o) => o % n), payer: a.payer < n ? a.payer : 0 };
}

export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Pre-filled so the demo needs no typing; everything stays editable.
export const SAMPLE_ADDRESS = "245 Bedford Avenue, Apt 4B, Brooklyn, NY 11211";
export const SAMPLE_NAMES = ["Maya Chen", "Jordan Rivera", "Priya Patel", "Sam Okafor", "Alex Kim", "Taylor Brooks"];

/** The sample address and four roommates; effective today; a 12-month lease starting the first of next month. */
export function blankHousehold(): Household {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const end = new Date(start.getFullYear() + 1, start.getMonth(), 0);
  return { address: SAMPLE_ADDRESS, names: SAMPLE_NAMES.slice(0, 4), leaseStart: toYMD(start), leaseEnd: toYMD(end), effective: toYMD(now) };
}

export function sampleDraft(): { household: Household; answers: Answers } {
  return {
    household: blankHousehold(),
    answers: {
      ...defaultAnswers(4),
      clean: 4,
      rent: 4800,
      split: "custom",
      percents: [28, 26, 24, 22],
      payer: 0,
      groceries: "staples",
      borrowing: "staples",
      guestNotice: "24h",
      nights: 3,
      cap: 8,
      parties: "notice",
      quiet: "standard",
      makeup: "48h",
      notice: 60,
    },
  };
}

/* ---------- Formatting ---------- */

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
  "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function words(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? " " + words(n % 100) : ""}`;
  return String(n);
}

/** Legal-style number: legal(48, "hours") is "forty-eight (48) hours". */
export const legal = (n: number, unit = "") =>
  `${words(n)} (${n})${unit ? " " + (n === 1 ? unit.replace(/s$/, "") : unit) : ""}`;

export const dollars = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const percent = (p: number) => `${+p.toFixed(2)}%`;

/** "A, B, C, and D" */
export function joinNames(names: string[]) {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

const parseYMD = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const longDate = (ymd: string) =>
  parseYMD(ymd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const ampm = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s*([AP])M/, (_, x: string) => ` ${x.toLowerCase()}.m.`);

/** "22:00" is "10:00 p.m."; midnight and noon are written out. */
export function clock(hhmm: string) {
  if (hhmm === "00:00") return "midnight";
  if (hhmm === "12:00") return "noon";
  const [h, m] = hhmm.split(":").map(Number);
  return ampm(new Date(2000, 0, 1, h, m));
}

/** A signing timestamp: "October 13, 2026 at 11:42 p.m." */
export function stamp(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at ${ampm(d)}`;
}

export const label = <T,>(options: Option<T>[], value: T) => options.find((o) => o.value === value)?.label ?? "";

/** Each roommate's share of the rent. Rounding pennies go to the last roommate so the total is exact. */
export function rentShares(a: Answers, n: number) {
  const pcts = a.split === "equal" ? Array(n).fill(100 / n) : a.percents;
  const amounts = pcts.map((p) => Math.round(a.rent * p) / 100);
  amounts[n - 1] = Math.round((a.rent - amounts.slice(0, -1).reduce((s, x) => s + x, 0)) * 100) / 100;
  return pcts.map((pct, i) => ({ pct, amount: amounts[i] }));
}

export const percentTotal = (a: Answers) => Math.round(a.percents.reduce((s, p) => s + p, 0) * 100) / 100;

/** A stable ID from the household details, e.g. RA-2026-04817. */
export function agreementId(h: Household) {
  let hash = 7;
  for (const ch of h.address + h.names.join("|") + h.effective) hash = (hash * 31 + ch.charCodeAt(0)) % 1000003;
  return `RA-${h.effective.slice(0, 4)}-${String(hash % 100000).padStart(5, "0")}`;
}

/** A short name for the dashboard, e.g. "Apt 4B" from the address. */
export function shortName(address: string) {
  const parts = address.split(",").map((p) => p.trim());
  return parts.find((p) => /^(apt|apartment|unit|suite|#)/i.test(p)) ?? parts[0];
}

/* ---------- Review summaries ---------- */

export function summary(h: Household, a: Answers) {
  const n = h.names.length;
  const shares = rentShares(a, n);
  const quiet = `Weeknights ${clock(a.weeknight[0])} to ${clock(a.weeknight[1])}, weekends ${clock(a.weekend[0])} to ${clock(a.weekend[1])}`;
  return [
    {
      title: "Household",
      lines: [
        h.address,
        joinNames(h.names),
        `Lease ${longDate(h.leaseStart)} to ${longDate(h.leaseEnd)}`,
        `Effective ${longDate(h.effective)}`,
      ],
    },
    { title: "Cleanliness", lines: [`${CLEAN_LEVELS[a.clean - 1].label} standard`, `Dishes: ${label(DISHES, a.dishes)}`] },
    {
      title: "Chores",
      lines: [
        label(CHORE_SYSTEMS, a.chores),
        ...(a.chores === "fixed" ? ZONES.map((z, i) => `${z.name}: ${h.names[a.owners[i]]}`) : []),
        `Missed chores made up ${label(MAKEUP, a.makeup).toLowerCase()}`,
      ],
    },
    {
      title: "Rent, Utilities, and Groceries",
      lines: [
        `${dollars(a.rent)} per month, ${a.split === "equal" ? "split equally" : "custom split"}`,
        h.names.map((name, i) => `${name} ${dollars(shares[i].amount)}`).join(", "),
        a.payer < 0 ? "Everyone pays the landlord directly" : `${h.names[a.payer]} pays the landlord`,
        `Shares due ${label(DUE, a.due).toLowerCase()}`,
        `Utilities: ${label(UTILITIES, a.utilities)}`,
        `Groceries: ${label(GROCERIES, a.groceries)}`,
      ],
    },
    {
      title: "Food and Belongings",
      lines: [
        `Food: ${label(BORROWING, a.borrowing)}`,
        `Personal items in common areas: up to ${label(ITEMS, a.items).toLowerCase()}`,
        `Joint items at move-out: ${label(JOINT, a.joint)}`,
      ],
    },
    {
      title: "Guests",
      lines: [
        `Overnight guest notice: ${label(GUEST_NOTICE, a.guestNotice)}`,
        `Up to ${a.nights} consecutive night${a.nights === 1 ? "" : "s"}, ${label(CAPS, a.cap).toLowerCase()}`,
        `Parties: ${label(PARTIES, a.parties)}`,
      ],
    },
    { title: "Quiet Hours", lines: [quiet, a.headphones ? "Headphones for media during quiet hours" : "Low volume during quiet hours"] },
    {
      title: "Damage",
      lines: [
        `Report damage ${label(REPORT, a.report).toLowerCase()}`,
        `Unexplained damage: ${label(UNATTRIBUTED, a.unattributed)}`,
        `Renter's insurance: ${label(INSURANCE, a.insurance)}`,
        a.photos ? "Move-in photos required" : "No move-in photos",
      ],
    },
    {
      title: "Sublets, Move-Out, and Disagreements",
      lines: [
        `Subletting: ${label(SUBLET, a.sublet)}`,
        `Move-out notice: ${label(NOTICE, a.notice)}`,
        `Disagreements: ${label(DISPUTES, a.disputes)}`,
        `House meetings: ${label(MEETINGS, a.meetings)}`,
      ],
    },
  ];
}

/* ---------- The agreement ---------- */

export type Table = { caption: string; head: string[]; rows: string[][]; foot?: string[]; note?: string };
export type Block = { p: string } | { list: string[] } | { table: Table };
export type Section = { title: string; blocks: Block[] };
export type Article = { title: string; sections: Section[] };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const roman = (i: number) => ROMAN[i];

const HOURS = { "24h": legal(24, "hours"), "48h": legal(48, "hours"), "7d": legal(7, "days") };

/** Build the full agreement from the household details and answers. */
export function buildAgreement(h: Household, a: Answers) {
  const names = h.names;
  const n = names.length;
  const shares = rentShares(a, n);
  const payer = a.payer >= 0 ? names[a.payer] : null;
  const level = CLEAN_LEVELS[a.clean - 1];
  const termEnd = new Date(parseYMD(h.leaseEnd).getTime() + 24 * 60 * 60 * 1000);
  const start = parseYMD(h.leaseStart);
  const months = Math.max(1, Math.round((termEnd.getTime() - start.getTime()) / (30.4375 * 24 * 60 * 60 * 1000)));
  const due =
    a.due === "0" ? "the date on which the Rent is due under the Lease" : `${legal(Number(a.due), "days")} before the Rent is due under the Lease`;

  const preamble = [
    `This Residential Roommate Agreement (this "Agreement") is entered into as of ${longDate(h.effective)} (the "Effective Date") by and among ${joinNames(names)} (each a "Roommate" and, collectively, the "Roommates"), who jointly occupy the residential premises located at ${h.address} (the "Premises").`,
    `The Roommates enter into this Agreement to set out, in writing and in advance, their shared expectations for living together at the Premises, including the payment of rent and household expenses, the care of the Common Areas, the hosting of guests, and the resolution of disagreements, so that each Roommate may enjoy the Premises in comfort, safety, and mutual respect.`,
    `In consideration of the mutual promises set out below, the Roommates agree as follows:`,
  ];

  /* Article II tables and text */
  const rentTable: Table = {
    caption: "Table 1: Allocation of Monthly Rent",
    head: ["Roommate", "Percentage", "Monthly Amount"],
    rows: names.map((name, i) => [name, percent(shares[i].pct), dollars(shares[i].amount)]),
    foot: ["Total", "100%", dollars(a.rent)],
  };

  const utilities = {
    equal: `Electricity, gas, water, internet, and any other services billed to the Premises (the "Utilities") shall be divided equally among the Roommates. The Roommate whose name appears on a Utility account shall record each bill in Housepact within ${legal(3, "days")} of receipt, and each other Roommate shall reimburse their share within ${legal(7, "days")} of the bill being recorded.`,
    rent: `Electricity, gas, water, internet, and any other services billed to the Premises (the "Utilities") shall be divided among the Roommates in the same percentages as the Rent under Section 2.1. The Roommate whose name appears on a Utility account shall record each bill in Housepact within ${legal(3, "days")} of receipt, and each other Roommate shall reimburse their share within ${legal(7, "days")} of the bill being recorded.`,
    included: `The Roommates acknowledge that electricity, gas, water, and heat (the "Utilities") are included in the Rent under the Lease. Any service that is not included in the Rent and that is used by the household, such as internet service, shall be divided equally among the Roommates who use it and recorded in Housepact.`,
  }[a.utilities];

  const supplies = `Household items used by all Roommates, including toilet paper, dish soap, paper towels, trash bags, and cleaning products (the "Shared Supplies"), shall be purchased as needed and their cost divided equally.`;
  const groceries = {
    separate: `Each Roommate shall purchase their own groceries and shall not be responsible for the cost of any other Roommate's food. ${supplies}`,
    staples: `Each Roommate shall purchase their own groceries, except that cooking oil, salt, spices, condiments, and coffee (the "Shared Staples") shall be purchased for the household and their cost divided equally. ${supplies}`,
    shared: `The Roommates shall share groceries in full. Food purchased for the household shall be recorded in Housepact and its cost divided equally at the end of each month. Food that a Roommate purchases for personal use and labels as such is excluded from this arrangement. ${supplies}`,
  }[a.groceries];

  /* Article III: chores and Schedule A */
  const monday = new Date(start);
  monday.setDate(monday.getDate() + ((8 - monday.getDay()) % 7));
  const weekOf = (w: number) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7 * w);
    return longDate(toYMD(d));
  };
  const rotationTable: Table = {
    caption: a.chores === "signup" ? "Schedule A: Chore Rotation (for Unclaimed Zones)" : "Schedule A: Chore Rotation",
    head: ["Week", ...ZONES.map((z) => z.name), ...(n > ZONES.length ? ["Rest Week"] : [])],
    rows: names.map((_, w) => {
      const assigned = ZONES.map((_, z) => (z + w) % n);
      const resting = names.filter((_, i) => !assigned.includes(i));
      return [`Week ${w + 1} (beginning ${weekOf(w)})`, ...assigned.map((i) => names[i]), ...(n > ZONES.length ? [joinNames(resting)] : [])];
    }),
    note: `The rotation begins on ${weekOf(0)} and repeats every ${legal(n, "weeks")} for the remainder of the Term.`,
  };
  const fixedTable: Table = {
    caption: "Schedule A: Chore Assignments",
    head: ["Zone", "Responsible Roommate"],
    rows: ZONES.map((z, i) => [z.name, names[a.owners[i]]]),
    note: "These assignments remain in effect for the Term unless changed by written amendment under Section 10.2.",
  };
  const unassigned = names.filter((_, i) => !a.owners.includes(i));

  const assignment = {
    rotation:
      `Responsibility for the zones shall rotate weekly, with each week beginning on Monday, in the order set out in Schedule A.` +
      (n < ZONES.length
        ? ` Because there are fewer Roommates than zones, each Roommate is responsible for more than one zone in some weeks, as shown in Schedule A.`
        : n > ZONES.length
          ? ` Because there are more Roommates than zones, each Roommate will have ${legal(n - ZONES.length, "rest weeks")} in each rotation cycle, as shown in Schedule A.`
          : ` Each Roommate is responsible for exactly one zone each week.`),
    fixed:
      `Each zone is assigned to the Roommate named in Schedule A, who shall remain responsible for it for the duration of the Term.` +
      (unassigned.length
        ? ` ${joinNames(unassigned)}, who ${unassigned.length === 1 ? "is" : "are"} not assigned a zone, shall serve as backup for the household and shall complete any duty that another Roommate misses and does not make up within the period set out in Section 3.5.`
        : ""),
    signup: `Each week, the Roommates shall claim zones in Housepact no later than Sunday at 8:00 p.m. for the week beginning the following Monday. Zones are claimed on a first-come basis, provided that no Roommate may claim the same zone for more than ${legal(2, "consecutive weeks")} while another Roommate is available to take it. Any zone left unclaimed by the deadline shall be assigned according to the rotation set out in Schedule A.`,
  }[a.chores];

  const makeup = a.makeup === "next" ? `before the next weekly ${a.chores === "fixed" ? "cleaning period" : "rotation"} begins` : `within ${HOURS[a.makeup]} of the scheduled time`;

  const dishes = {
    now: "immediately after use",
    day: "on the same day they are used",
    "24h": `within ${legal(24, "hours")} of use`,
  }[a.dishes];

  /* Article IV */
  const food = {
    ask: `Food and beverages belong to the Roommate who purchased them. No Roommate shall consume or use another Roommate's food or beverages without first obtaining that Roommate's permission.`,
    staples: `Basic staples such as cooking oil, salt, spices, and condiments may be used by any Roommate in reasonable amounts${a.groceries === "staples" ? ", consistent with Section 2.5" : ""}. All other food and beverages belong to the Roommate who purchased them and may not be used without that Roommate's permission.`,
    open: `Roommates may use one another's food and beverages in reasonable amounts, provided that a Roommate who finishes or substantially depletes an item shall replace it within ${legal(3, "days")}. Any item labeled by its owner as reserved is excluded and may not be used without permission.`,
  }[a.borrowing];

  const joint =
    a.joint === "buyout"
      ? `When a Roommate moves out, the remaining Roommates shall have the option to purchase the departing Roommate's share of any Joint Item at its fair market value at the time of move-out. If the Roommates cannot agree on that value within ${legal(14, "days")}, the price shall be fifty percent (50%) of the departing Roommate's original contribution. If no remaining Roommate elects to purchase the share, the Joint Item shall be sold and the proceeds divided in proportion to the owners' contributions.`
      : `When a Roommate moves out, each Joint Item in which the departing Roommate holds a share shall be sold within ${legal(30, "days")}, unless all of its owners agree otherwise in writing, and the proceeds shall be divided among the owners in proportion to their original contributions.`;

  /* Article V */
  const guestNotice = {
    day: "on the day of the guest's arrival and before the guest arrives",
    "24h": `at least ${legal(24, "hours")} in advance`,
    "48h": `at least ${legal(48, "hours")} in advance`,
  }[a.guestNotice];
  const parties = {
    notice: `A Roommate may host a Gathering provided that the Roommate gives all other Roommates at least ${legal(48, "hours'")} notice and no Roommate objects within ${legal(24, "hours")} of receiving that notice. An objection must be made in good faith and should, where possible, propose an alternative date.`,
    majority: `A Roommate may host a Gathering only with the approval of a majority of the Roommates, counting the hosting Roommate, obtained at least ${legal(72, "hours")} in advance.`,
    none: `Gatherings are not permitted at the Premises. Smaller social visits remain permitted, subject to Section 5.1 and Article VI.`,
  }[a.parties];

  /* Article VI */
  const quiet = `Quiet hours shall be observed from ${clock(a.weeknight[0])} to ${clock(a.weeknight[1])} on weeknights (Sunday through Thursday nights) and from ${clock(a.weekend[0])} to ${clock(a.weekend[1])} on weekends (Friday and Saturday nights) (the "Quiet Hours").`;

  /* Article VII */
  const insurance = {
    required: `Each Roommate shall obtain and maintain renter's insurance, including personal liability coverage, for the duration of the Term, and shall provide proof of coverage to the other Roommates within ${legal(30, "days")} of the Effective Date.`,
    recommended: `Each Roommate is strongly encouraged to maintain renter's insurance for the duration of the Term. The Roommates acknowledge that the landlord's insurance does not cover their personal property and that each Roommate bears the risk of loss to their own belongings.`,
    none: `This Agreement does not require renter's insurance. Each Roommate bears the risk of loss to their own belongings, and no Roommate is responsible for insuring the property of another.`,
  }[a.insurance];

  /* Article VIII */
  const sublet = {
    none: `No Roommate shall sublet their room or assign their interest in the Premises, in whole or in part, for any period.`,
    unanimous: `A Roommate may sublet their room only with the prior written approval of all other Roommates and only to the extent permitted by the Lease and applicable law. The subletting Roommate remains responsible for their share of the Rent and for the conduct of the subtenant, who shall agree in writing to be bound by this Agreement.`,
    majority: `A Roommate may sublet their room only with the prior written approval of a majority of the other Roommates and only to the extent permitted by the Lease and applicable law. The subletting Roommate remains responsible for their share of the Rent and for the conduct of the subtenant, who shall agree in writing to be bound by this Agreement.`,
  }[a.sublet];

  /* Article IX */
  const meetings = {
    weekly: "once each week",
    biweekly: "once every two (2) weeks",
    monthly: "once each month",
    asneeded: "as needed, and in any event at least once every three (3) months",
  }[a.meetings];
  const escalation = {
    direct: [
      `Direct conversation. The Roommates involved shall first discuss the matter privately and respectfully within ${legal(72, "hours")} of the concern being raised.`,
      `House meeting. If the matter is not resolved, any Roommate involved may bring it to the next house meeting, or call a special meeting under Section 9.1, at which all Roommates shall seek a solution by consensus.`,
      `Mediation. If the matter remains unresolved ${legal(14, "days")} after the house meeting, the Roommates shall seek the assistance of a neutral mediator, such as a community mediation center, and shall share any cost equally.`,
      `Other remedies. Only after completing the steps above may a Roommate pursue any other remedy available under the Lease or applicable law.`,
    ],
    meeting: [
      `House meeting. A Roommate with a concern shall raise it at the next house meeting, or call a special meeting under Section 9.1, at which all Roommates shall seek a solution by consensus.`,
      `Vote. If consensus is not reached, a household matter (but not a claim for money owed) may be decided by a majority vote of all Roommates, which shall be recorded in Housepact and binding until the next scheduled review of this Agreement.`,
      `Mediation. If the matter remains unresolved, or concerns money owed, the Roommates shall seek the assistance of a neutral mediator within ${legal(14, "days")} and shall share any cost equally.`,
      `Other remedies. Only after completing the steps above may a Roommate pursue any other remedy available under the Lease or applicable law.`,
    ],
    mediator: [
      `Written notice. A Roommate with a concern shall describe it in writing to the other Roommates involved, who shall respond in writing within ${legal(72, "hours")}.`,
      `Mediation. If the response does not resolve the matter, the Roommates shall jointly engage a neutral mediator, such as a community mediation center, within ${legal(14, "days")} and shall share any cost equally.`,
      `Other remedies. Only after completing the steps above may a Roommate pursue any other remedy available under the Lease or applicable law.`,
    ],
  }[a.disputes];

  const articles: Article[] = [
    {
      title: "Term",
      sections: [
        {
          title: "Term",
          blocks: [
            { p: `This Agreement takes effect on the Effective Date and remains in effect for the term of the lease for the Premises (the "Lease"), which begins on ${longDate(h.leaseStart)} and ends on ${longDate(h.leaseEnd)}, a period of ${legal(months, "months")} (the "Term"), unless it is earlier amended or terminated in accordance with this Agreement.` },
          ],
        },
        {
          title: "Relationship to the Lease",
          blocks: [
            { p: `This Agreement governs only the relationship among the Roommates. It does not modify the Lease, and nothing in it relieves any Roommate of any obligation owed to the landlord under the Lease.` },
          ],
        },
        {
          title: "Renewal",
          blocks: [
            { p: `If the Roommates renew or extend the Lease, this Agreement shall continue in effect for the renewal term, subject to the periodic review required by Section 10.5.` },
          ],
        },
      ],
    },
    {
      title: "Rent, Utilities, and Shared Expenses",
      sections: [
        {
          title: "Rent",
          blocks: [
            { p: `The total monthly rent for the Premises under the Lease is ${dollars(a.rent)} (the "Rent"). The Roommates shall share the Rent ${a.split === "equal" ? "in equal shares" : "in the percentages agreed below, which reflect differences among the bedrooms"}, as set out in Table 1. Any rounding difference of one cent or less is assigned to the last Roommate listed.` },
            { table: rentTable },
          ],
        },
        {
          title: "Payment of Rent",
          blocks: [
            {
              p: payer
                ? `${payer} (the "Rent Collector") shall pay the full Rent to the landlord on or before the date it is due under the Lease. Each other Roommate shall pay their share to the Rent Collector no later than ${due}. The Rent Collector shall confirm each payment to the landlord in Housepact within ${legal(24, "hours")} of making it.`
                : `Each Roommate shall pay their share of the Rent directly to the landlord, by a method the landlord accepts, no later than ${due}, and shall confirm the payment to the other Roommates in Housepact on the same day.`,
            },
          ],
        },
        {
          title: "Late Payment",
          blocks: [
            { p: `A Roommate who expects to be late with any payment under this Article shall notify the other Roommates as soon as possible and shall reimburse in full any late fee or other charge imposed under the Lease as a result. No Roommate is obligated to cover another Roommate's share; a Roommate who chooses to do so is entitled to reimbursement within ${legal(7, "days")}.` },
          ],
        },
        { title: "Utilities", blocks: [{ p: utilities }] },
        { title: "Groceries and Household Supplies", blocks: [{ p: groceries }] },
        {
          title: "Records and Settlement",
          blocks: [
            { p: `All shared expenses, including the household's Housepact subscription, shall be recorded in Housepact, which shall serve as the household's record of amounts paid and owed. The Roommates shall settle all outstanding balances at least once each month.` },
          ],
        },
      ],
    },
    {
      title: "Cleanliness and Household Duties",
      sections: [
        {
          title: "Standard of Cleanliness",
          blocks: [
            { p: `The kitchen, any bathroom shared by more than one Roommate, the living and dining areas, hallways, and any other space outside a Roommate's bedroom are the "Common Areas." The Roommates adopt a "${level.label}" standard of cleanliness, under which ${level.clause}.` },
          ],
        },
        {
          title: "Dishes",
          blocks: [
            { p: `Each Roommate shall wash, dry, and put away their own dishes, cookware, and utensils ${dishes}. Dishes shall not be left soaking in the sink beyond that time, and the sink shall be left clear for the use of others.` },
          ],
        },
        {
          title: "Zones and Duties",
          blocks: [
            { p: `Household cleaning is divided into ${legal(ZONES.length, "zones")}. Each zone shall be cleaned ${level.freq}, and the Roommate responsible for a zone shall complete the following duties:` },
            { list: ZONES.map((z) => `${z.name}: ${z.tasks.slice(0, -1).join("; ")}; and ${z.tasks.at(-1)}.`) },
          ],
        },
        {
          title: "Assignment of Duties",
          blocks: [{ p: assignment }, { table: a.chores === "fixed" ? fixedTable : rotationTable }],
        },
        {
          title: "Missed Duties",
          blocks: [
            { p: `A Roommate who is unable to complete an assigned duty shall notify the other Roommates as soon as practicable and shall complete the missed duty ${makeup}. Roommates may trade duties by mutual agreement recorded in Housepact. Repeated failure to complete duties may be raised under Article IX.` },
          ],
        },
      ],
    },
    {
      title: "Kitchen, Food, and Personal Property",
      sections: [
        { title: "Food", blocks: [{ p: food }] },
        {
          title: "Kitchen Use",
          blocks: [
            { p: `The Roommates shall share refrigerator, freezer, and pantry space equally. Each Roommate shall remove expired or spoiled food from their space at least once each week and shall leave the kitchen in usable condition after each use, consistent with Section 3.2.` },
          ],
        },
        {
          title: "Personal Items in Common Areas",
          blocks: [
            { p: `Personal belongings, including clothing, shoes, bags, packages, and electronics, shall not be left in the Common Areas for more than ${HOURS[a.items]}. After that time, any Roommate may move the items to the door of the owner's bedroom. No Roommate shall discard, sell, or damage another Roommate's property.` },
          ],
        },
        {
          title: "Private Bedrooms",
          blocks: [
            { p: `Each Roommate's bedroom is that Roommate's private space. No Roommate or guest shall enter another Roommate's bedroom without permission, except in an emergency. Each Roommate shall keep their bedroom in a condition that does not cause odors, pests, or damage affecting the rest of the Premises.` },
          ],
        },
        {
          title: "Jointly Purchased Items",
          blocks: [
            { p: `Furniture, appliances, and other items purchased for the household with contributions from more than one Roommate (the "Joint Items") are owned in proportion to each Roommate's contribution, as recorded in Housepact. ${joint}` },
          ],
        },
      ],
    },
    {
      title: "Guests",
      sections: [
        {
          title: "Overnight Guests",
          blocks: [{ p: `A Roommate who intends to host an overnight guest shall notify all other Roommates ${guestNotice}.` }],
        },
        {
          title: "Limits on Overnight Stays",
          blocks: [
            {
              p:
                `No guest may stay at the Premises for more than ${legal(a.nights, "consecutive nights")}` +
                (a.cap ? `, nor for more than ${legal(a.cap, "nights")} in any calendar month,` : "") +
                ` without the prior approval of all other Roommates.` +
                (a.cap ? "" : ` There is no monthly limit on guest nights, provided that the limit on consecutive nights is observed.`) +
                ` A guest who exceeds these limits may be treated as an additional occupant under the Lease, and the hosting Roommate shall bear any resulting cost or consequence.`,
            },
          ],
        },
        {
          title: "Gatherings",
          blocks: [{ p: `A "Gathering" is any event at which more than ${legal(6, "guests")} are present at the same time. ${parties}` }],
        },
        {
          title: "Responsibility for Guests",
          blocks: [
            { p: `Each Roommate is responsible for the conduct of their guests and for any damage their guests cause to the Premises or to the property of any other Roommate. Guests shall observe this Agreement, including Article VI.` },
          ],
        },
        {
          title: "Keys and Access",
          blocks: [
            { p: `No Roommate shall give a key, access code, or other means of entry to the Premises to any guest without the prior approval of all other Roommates.` },
          ],
        },
      ],
    },
    {
      title: "Quiet Hours",
      sections: [
        { title: "Quiet Hours", blocks: [{ p: quiet }] },
        {
          title: "Conduct During Quiet Hours",
          blocks: [
            {
              p:
                `During Quiet Hours, the Roommates and their guests shall keep noise at a level that cannot be heard in another Roommate's bedroom with the door closed, and shall avoid loud conversation, music, and appliances in the Common Areas.` +
                (a.headphones
                  ? ` Music, television, games, and calls in the Common Areas shall be played through headphones.`
                  : ` Television, music, and calls in the Common Areas shall be kept at a low volume.`),
            },
          ],
        },
        {
          title: "Exceptions",
          blocks: [
            { p: `The Roommates may suspend Quiet Hours for a particular occasion, including an approved Gathering, if every Roommate consents in advance. A Roommate with an examination, interview, or similar commitment may request additional quiet time, which the other Roommates shall make reasonable efforts to honor.` },
          ],
        },
      ],
    },
    {
      title: "Damage, Repairs, and Liability",
      sections: [
        {
          title: "Reporting",
          blocks: [
            { p: `Any damage to the Premises, malfunction of an appliance or fixture, leak, or sign of pests shall be reported to the other Roommates within ${HOURS[a.report]} of discovery. ${payer ? `The Rent Collector` : `The Roommate who discovers the problem`} shall notify the landlord whenever the Lease requires it.` },
          ],
        },
        {
          title: "Responsibility for Damage",
          blocks: [
            { p: `A Roommate who causes damage to the Premises or to another Roommate's property, or whose guest causes such damage, shall pay the full cost of repair or replacement.` },
          ],
        },
        {
          title: "Unattributed Damage",
          blocks: [
            { p: `If the cause of damage cannot be determined after reasonable inquiry, its cost shall be divided ${a.unattributed === "equal" ? "equally among all Roommates" : "among all Roommates in the same percentages as the Rent under Section 2.1"}. Ordinary wear and tear is not considered damage.` },
          ],
        },
        {
          title: "Security Deposit",
          blocks: [
            { p: `Any deduction from the security deposit shall be allocated according to Sections 7.2 and 7.3. Any portion of the deposit returned by the landlord shall be divided in proportion to each Roommate's contribution to it.` },
          ],
        },
        { title: "Renter's Insurance", blocks: [{ p: insurance }] },
        ...(a.photos
          ? [
              {
                title: "Move-In Documentation",
                blocks: [
                  { p: `Within ${legal(7, "days")} of the Effective Date, the Roommates shall jointly photograph the condition of the Premises, including all Common Areas and any existing damage, and store the photographs where all Roommates can access them. These records shall be used to determine responsibility for damage at move-out.` },
                ],
              },
            ]
          : []),
      ],
    },
    {
      title: "Subletting and Move-Out",
      sections: [
        { title: "Subletting", blocks: [{ p: sublet }] },
        {
          title: "Notice of Move-Out",
          blocks: [
            { p: `A Roommate who intends to move out before the end of the Term, or who does not intend to renew the Lease, shall give written notice to all other Roommates at least ${legal(a.notice, "days")} before the intended move-out date.` },
          ],
        },
        {
          title: "Continuing Obligations",
          blocks: [
            { p: `A departing Roommate remains responsible for their share of the Rent and Utilities until the earlier of (a) the end of the Term, or (b) the date on which a replacement approved by all remaining Roommates and, where required, by the landlord assumes that share.` },
          ],
        },
        {
          title: "Move-Out Condition",
          blocks: [
            { p: `Before moving out, the departing Roommate shall remove all personal property, clean their bedroom, complete any outstanding duties, and settle all balances recorded in Housepact. Joint Items shall be handled under Section 4.5.` },
          ],
        },
      ],
    },
    {
      title: "Dispute Resolution",
      sections: [
        {
          title: "House Meetings",
          blocks: [
            { p: `The Roommates shall hold a house meeting ${meetings} to review household duties, expenses, and any concerns. Any Roommate may call a special meeting on ${legal(48, "hours'")} notice.` },
          ],
        },
        {
          title: "Escalation Path",
          blocks: [
            { p: `The Roommates shall attempt to resolve any disagreement arising under this Agreement through the following steps, in order:` },
            { list: escalation },
          ],
        },
        {
          title: "Good Faith",
          blocks: [
            { p: `Each Roommate shall take part in this process in good faith, and no Roommate shall retaliate against another for raising a concern.` },
          ],
        },
      ],
    },
    {
      title: "General Provisions",
      sections: [
        {
          title: "Entire Agreement",
          blocks: [{ p: `This Agreement is the entire agreement among the Roommates concerning its subject matter and supersedes any earlier understanding among them on those matters.` }],
        },
        {
          title: "Amendments",
          blocks: [{ p: `This Agreement may be amended only by a written amendment agreed to and signed by all Roommates, including by electronic signature.` }],
        },
        {
          title: "Conflict with the Lease",
          blocks: [{ p: `If any provision of this Agreement conflicts with the Lease, the Lease governs.` }],
        },
        {
          title: "Severability",
          blocks: [{ p: `If any provision of this Agreement is found to be unenforceable, the remaining provisions shall continue in full force and effect.` }],
        },
        {
          title: "Periodic Review",
          blocks: [{ p: `The Roommates shall review this Agreement together at least once every ${legal(6, "months")}, and whenever a Roommate moves in or out.` }],
        },
        {
          title: "New Roommates",
          blocks: [{ p: `Any person who becomes a Roommate after the Effective Date shall sign this Agreement, as then amended, before moving in.` }],
        },
        {
          title: "Electronic Signatures",
          blocks: [{ p: `This Agreement may be signed electronically, and an electronic signature has the same effect among the Roommates as a handwritten signature.` }],
        },
      ],
    },
  ];

  return { id: agreementId(h), preamble, articles };
}
