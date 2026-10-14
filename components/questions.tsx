import type { ReactNode } from "react";
import { Field, OptionCards, Recommended, Select, Slider, Toggle } from "@/components/ui";
// Dishes, personal items in shared spaces, guests, and damage reporting aren't asked;
// the agreement uses the recommended defaults for those.
import {
  BORROWING, CHORE_SYSTEMS, CLEAN_DEFAULT, CLEAN_LEVELS, DISPUTES, DUE, GROCERIES, INSURANCE, JOINT, MAKEUP, MEETINGS,
  NOTICE, QUIET_PRESETS, SPLITS, SUBLET, UNATTRIBUTED, UTILITIES, ZONES, clock, dollars, evenPercents, percentTotal, rentShares,
  type Answers,
} from "@/lib/agreement";

type Props = { a: Answers; set: (changes: Partial<Answers>) => void; names: string[] };

/** The eight questions: one topic per screen. `problem` explains what blocks Next, if anything. */
export const QUESTIONS: {
  title: string;
  short: string; // for "Continue to ..." buttons
  why: string;
  Body: (props: Props) => ReactNode;
  problem?: (a: Answers) => string | null;
}[] = [
  {
    title: "Cleanliness",
    short: "Cleanliness",
    why: "Different ideas of \"clean\" cause more roommate conflict than almost anything else.",
    Body: ({ a, set }) => {
      const level = CLEAN_LEVELS[a.clean - 1];
      return (
        <>
          <Field label="Standard for shared spaces" help="Slide to the level everyone can live with.">
            <Slider label="Cleanliness standard" min={1} max={5} value={a.clean} onChange={(clean) => set({ clean })} left="Relaxed" right="Spotless" />
            <div className="rounded-xl bg-surface p-4" aria-live="polite">
              <p className="flex items-center justify-between gap-2 font-semibold">
                {level.label}
                {a.clean === CLEAN_DEFAULT && <Recommended />}
              </p>
              <p className="text-subhead text-secondary">{level.help}</p>
            </div>
          </Field>
        </>
      );
    },
  },
  {
    title: "Chores",
    short: "Chores",
    why: "A clear system means nobody has to keep score or ask twice.",
    Body: ({ a, set, names }) => (
      <>
        <Field label="How chores are shared" help={`Four zones: ${ZONES.map((z) => z.name.toLowerCase()).join(", ")}.`}>
          <OptionCards options={CHORE_SYSTEMS} value={a.chores} onChange={(chores) => set({ chores })} columns={3} />
        </Field>
        {a.chores === "fixed" && (
          <Field label="Who owns each zone">
            {ZONES.map((z, i) => (
              <div key={z.name} className="flex items-center gap-4">
                <span className="w-40 shrink-0">{z.name}</span>
                <Select
                  label={`${z.name} owner`}
                  options={names.map((name, j) => ({ value: j, label: name }))}
                  value={a.owners[i]}
                  onChange={(o) => set({ owners: a.owners.map((x, k) => (k === i ? o : x)) })}
                />
              </div>
            ))}
          </Field>
        )}
        <Field label="Missed chores are made up">
          <OptionCards options={MAKEUP} value={a.makeup} onChange={(makeup) => set({ makeup })} columns={3} />
        </Field>
      </>
    ),
  },
  {
    title: "Rent, Utilities, and Groceries",
    short: "Money",
    why: "Money is easier to talk about before anyone is owed any.",
    problem: (a) =>
      !(a.rent > 0)
        ? "The monthly rent is missing. Enter the total rent from your lease."
        : a.split === "custom" && percentTotal(a) !== 100
          ? `The percentages add up to ${percentTotal(a)}%. Adjust them so they total exactly 100%.`
          : null,
    Body: ({ a, set, names }) => {
      const shares = rentShares(a, names.length);
      return (
        <>
          <Field label="Total monthly rent">
            <label className="field flex items-center gap-2 text-title3 font-semibold">
              $
              <input
                inputMode="decimal"
                aria-label="Total monthly rent"
                placeholder="0"
                value={a.rent || ""}
                onChange={(e) => set({ rent: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                className="h-full min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
          </Field>
          <Field label="How rent is split">
            <OptionCards
              options={SPLITS}
              value={a.split}
              onChange={(split) => set({ split, percents: split === "custom" ? a.percents : evenPercents(names.length) })}
              columns={2}
            />
            <div className="divide-y divide-separator rounded-xl bg-surface px-4">
              {names.map((name, i) => (
                <div key={i} className="flex h-14 items-center gap-2">
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                  {a.split === "custom" ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        aria-label={`${name} percentage`}
                        value={a.percents[i]}
                        onChange={(e) => set({ percents: a.percents.map((p, j) => (j === i ? Number(e.target.value) || 0 : p)) })}
                        className="h-11 w-16 rounded-lg border border-separator bg-surface px-2 text-right"
                      />
                      %
                    </label>
                  ) : (
                    <span className="text-secondary">{+(100 / names.length).toFixed(2)}%</span>
                  )}
                  <span className="shrink-0 text-right font-semibold tabular-nums">{dollars(shares[i].amount)}</span>
                </div>
              ))}
              {a.split === "custom" && (
                <div className={`flex h-12 items-center justify-between text-subhead ${percentTotal(a) === 100 ? "text-secondary" : "font-semibold text-danger"}`}>
                  <span>Total</span>
                  <span>
                    {percentTotal(a)}% {percentTotal(a) !== 100 && `(${+(100 - percentTotal(a)).toFixed(2)}% ${percentTotal(a) < 100 ? "left" : "over"})`}
                  </span>
                </div>
              )}
            </div>
          </Field>
          <Field label="Who pays the landlord" help="Shares go to this person, who pays the full rent.">
            <Select
              label="Who pays the landlord"
              options={[...names.map((name, i) => ({ value: i, label: `${name} collects and pays` })), { value: -1, label: "Everyone pays the landlord directly" }]}
              value={a.payer}
              onChange={(payer) => set({ payer })}
            />
          </Field>
          <Field label="Shares are due">
            <OptionCards options={DUE} value={a.due} onChange={(due) => set({ due })} columns={3} />
          </Field>
          <Field label="Utilities">
            <OptionCards options={UTILITIES} value={a.utilities} onChange={(utilities) => set({ utilities })} columns={3} />
          </Field>
          <Field label="Groceries">
            <OptionCards options={GROCERIES} value={a.groceries} onChange={(groceries) => set({ groceries })} columns={3} />
          </Field>
        </>
      );
    },
  },
  {
    title: "Food and Belongings",
    short: "Food and Belongings",
    why: "Small things like a missing yogurt or a jacket on the couch add up fast.",
    Body: ({ a, set }) => (
      <>
        <Field label="Using someone else's food">
          <OptionCards options={BORROWING} value={a.borrowing} onChange={(borrowing) => set({ borrowing })} columns={3} />
        </Field>
        <Field label="Things you buy together, when someone moves out">
          <OptionCards options={JOINT} value={a.joint} onChange={(joint) => set({ joint })} columns={2} />
        </Field>
      </>
    ),
  },
  {
    title: "Quiet Hours",
    short: "Quiet Hours",
    why: "Sleep, exams, and early shifts depend on knowing when the house goes quiet.",
    problem: (a) =>
      a.weeknight.every(Boolean) && a.weekend.every(Boolean) ? null : "A quiet-hours time is missing. Choose a start and end time for weeknights and weekends.",
    Body: ({ a, set }) => {
      const presets = QUIET_PRESETS.map((p) => ({
        ...p,
        help: p.weeknight ? `Weeknights ${clock(p.weeknight[0])} to ${clock(p.weeknight[1])}; weekends ${clock(p.weekend![0])} to ${clock(p.weekend![1])}` : p.help,
      }));
      const time = (key: "weeknight" | "weekend", i: 0 | 1, labelText: string) => (
        <label className="flex flex-1 flex-col gap-2 text-subhead text-secondary">
          {labelText}
          <input
            type="time"
            className="field"
            value={a[key][i]}
            onChange={(e) => set({ [key]: (i === 0 ? [e.target.value, a[key][1]] : [a[key][0], e.target.value]) as [string, string] })}
          />
        </label>
      );
      return (
        <>
          <Field label="Quiet hours" help="Weeknights are Sunday to Thursday. Weekends are Friday and Saturday.">
            <OptionCards
              options={presets}
              value={a.quiet}
              onChange={(quiet) => {
                const p = QUIET_PRESETS.find((x) => x.value === quiet)!;
                set(p.weeknight ? { quiet, weeknight: p.weeknight, weekend: p.weekend! } : { quiet });
              }}
              columns={2}
            />
          </Field>
          {a.quiet === "custom" && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                {time("weeknight", 0, "Weeknights from")}
                {time("weeknight", 1, "Until")}
              </div>
              <div className="flex gap-4">
                {time("weekend", 0, "Weekends from")}
                {time("weekend", 1, "Until")}
              </div>
            </div>
          )}
          <Toggle
            label="Headphones During Quiet Hours"
            rec
            help="Music, shows, games, and calls in shared spaces use headphones."
            on={a.headphones}
            onChange={(headphones) => set({ headphones })}
          />
        </>
      );
    },
  },
  {
    title: "Damage",
    short: "Damage",
    why: "Deciding who pays before something breaks keeps the deposit conversation calm.",
    Body: ({ a, set }) => (
      <>
        <Field label="When no one knows who caused it">
          <OptionCards options={UNATTRIBUTED} value={a.unattributed} onChange={(unattributed) => set({ unattributed })} columns={2} />
        </Field>
        <Field label="Renter's insurance">
          <OptionCards options={INSURANCE} value={a.insurance} onChange={(insurance) => set({ insurance })} columns={3} />
        </Field>
        <Toggle
          label="Move-In Photos"
          rec
          help="Photograph every room in the first week to protect everyone's deposit."
          on={a.photos}
          onChange={(photos) => set({ photos })}
        />
      </>
    ),
  },
  {
    title: "Sublets, Move-Out, and Disagreements",
    short: "Move-Out",
    why: "Plans change. Agreeing on the exit and on how to settle disputes protects everyone.",
    Body: ({ a, set }) => (
      <>
        <Field label="Subletting a room">
          <OptionCards options={SUBLET} value={a.sublet} onChange={(sublet) => set({ sublet })} columns={3} />
        </Field>
        <Field label="Notice before moving out">
          <OptionCards options={NOTICE} value={a.notice} onChange={(notice) => set({ notice })} columns={3} />
        </Field>
        <Field label="When there's a disagreement">
          <OptionCards options={DISPUTES} value={a.disputes} onChange={(disputes) => set({ disputes })} columns={3} />
        </Field>
        <Field label="House meetings">
          <Select
            label="House meetings"
            options={MEETINGS.map((m) => ({ value: m.value, label: m.label + (m.rec ? " (Recommended)" : "") }))}
            value={a.meetings}
            onChange={(meetings) => set({ meetings })}
          />
        </Field>
      </>
    ),
  },
];
