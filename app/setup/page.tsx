"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AgreementDocument, Logo } from "@/components/agreement";
import { QUESTIONS } from "@/components/questions";
import { Dot, Field } from "@/components/ui";
import { blankHousehold, defaultAnswers, fitAnswers, sampleDraft, summary, type Answers, type Household } from "@/lib/agreement";
import { newHouse } from "@/lib/house";
import { canUndoReset, save, undoReset, useHouse } from "@/lib/store";

// Screens: welcome, household details, the eight questions (1 to 8), review, and the agreement
const WELCOME = -1;
const HOUSEHOLD = 0;
const REVIEW = QUESTIONS.length + 1;
const AGREEMENT = QUESTIONS.length + 2;

export default function Setup() {
  const house = useHouse();
  const router = useRouter();

  // Once a house exists, go Home
  useEffect(() => {
    if (house) router.replace("/");
  }, [house, router]);

  // Onboarding only exists while there's no house, so Reset always starts it fresh
  return house === null ? <Onboarding /> : null;
}

function Onboarding() {
  const [screen, setScreen] = useState(WELCOME);
  const [household, setHousehold] = useState(blankHousehold);
  const [answers, setAnswers] = useState(() => defaultAnswers(4));
  const [signatures, setSignatures] = useState<(string | null)[]>([]);
  const [fromReview, setFromReview] = useState(false); // editing one section from Review returns to Review
  const names = household.names;

  // Changing any term clears signatures, since everyone signed the earlier version
  const changeHousehold = (changes: Partial<Household>) => {
    const next = { ...household, ...changes };
    setHousehold(next);
    setAnswers((a) => fitAnswers(a, next.names.length));
    setSignatures([]);
  };
  const changeAnswers = (changes: Partial<Answers>) => {
    setAnswers({ ...answers, ...changes });
    setSignatures([]);
  };

  const go = (s: number) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };
  const edit = (s: number) => {
    setFromReview(true);
    go(s);
  };
  const loadSample = () => {
    const sample = sampleDraft();
    setHousehold(sample.household);
    setAnswers(sample.answers);
    setSignatures([]);
    go(REVIEW);
  };
  const startOver = () => {
    setHousehold(blankHousehold());
    setAnswers(defaultAnswers(4));
    setSignatures([]);
    setFromReview(false);
    go(WELCOME);
  };
  const next = (from: number) => go(fromReview || from === QUESTIONS.length ? REVIEW : from + 1);
  const nextLabel = (from: number) => (fromReview ? "Save and Review" : from === QUESTIONS.length ? "Review Answers" : "Next");

  if (screen === WELCOME) {
    return (
      <Page>
        <div className="mt-6 flex items-center gap-2 font-heading text-lg font-semibold">
          <Logo />
          Housepact
        </div>
        <div>
          <h1 className="text-4xl">Your roommate agreement, made together.</h1>
          <p className="mt-3 text-muted">No awkward conversations, just agree once.</p>
        </div>
        <ol className="flex flex-col gap-4">
          {[
            ["Household details", "The address, everyone's names, and the lease dates."],
            ["Eight quick questions", "Cleanliness, chores, money, guests, quiet hours, and more."],
            ["Review and sign", "Housepact writes a formal agreement that everyone signs."],
          ].map(([title, help], i) => (
            <li key={title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white">{i + 1}</span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-sm text-muted">{help}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted">About ten minutes, together. Every question starts on a recommended answer.</p>
        <div className="mt-auto flex flex-col gap-3">
          <button className="btn" onClick={() => go(HOUSEHOLD)}>
            Get Started
          </button>
          <button className="btn border border-line bg-white text-ink" onClick={loadSample}>
            Load Sample Answers
          </button>
          {canUndoReset() && (
            <button className="self-center px-4 py-2 text-sm text-muted" onClick={undoReset}>
              Undo reset
            </button>
          )}
        </div>
      </Page>
    );
  }

  if (screen === HOUSEHOLD) {
    const problem = !household.address.trim()
      ? "Enter the address of the home."
      : names.some((n) => !n.trim())
        ? "Enter every roommate's full name."
        : new Set(names.map((n) => n.trim().toLowerCase())).size < names.length
          ? "Each roommate needs a different name."
          : !(household.leaseStart && household.leaseEnd && household.effective)
            ? "Fill in all three dates."
            : household.leaseEnd <= household.leaseStart
              ? "The lease must end after it starts."
              : null;
    return (
      <Page>
        <StepHeader label="Before you begin" title="Household details" why="These details appear at the top of your agreement and in every clause that names you." />
        <Field label="Address of the home">
          <input
            className="field"
            aria-label="Address of the home"
            placeholder="245 Bedford Avenue, Apt 4B, Brooklyn, NY 11211"
            value={household.address}
            onChange={(e) => changeHousehold({ address: e.target.value })}
          />
        </Field>
        <Field label="Roommates" help="Full names, as they should appear on the agreement. Two to six people.">
          {names.map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <Dot i={i} name={name} />
              <input
                className="field"
                aria-label={`Roommate ${i + 1}`}
                placeholder={`Roommate ${i + 1}`}
                value={name}
                onChange={(e) => changeHousehold({ names: names.map((n, j) => (j === i ? e.target.value : n)) })}
              />
              {names.length > 2 && (
                <button
                  aria-label={`Remove roommate ${i + 1}`}
                  className="-mr-2 size-12 shrink-0 text-muted"
                  onClick={() => changeHousehold({ names: names.filter((_, j) => j !== i) })}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {names.length < 6 && (
            <button className="self-start py-2 font-semibold" onClick={() => changeHousehold({ names: [...names, ""] })}>
              + Add roommate
            </button>
          )}
        </Field>
        <Field label="Lease dates" help="From the lease with your landlord.">
          <div className="flex gap-3">
            <DateInput label="Starts" value={household.leaseStart} onChange={(leaseStart) => changeHousehold({ leaseStart })} />
            <DateInput label="Ends" value={household.leaseEnd} onChange={(leaseEnd) => changeHousehold({ leaseEnd })} />
          </div>
        </Field>
        <Field label="Agreement effective date" help="Usually today.">
          <DateInput label="Effective" value={household.effective} onChange={(effective) => changeHousehold({ effective })} />
        </Field>
        <Nav back={() => go(WELCOME)} next={() => next(HOUSEHOLD)} nextLabel={fromReview ? "Save and Review" : "Next"} problem={problem} />
      </Page>
    );
  }

  if (screen <= QUESTIONS.length) {
    const q = QUESTIONS[screen - 1];
    return (
      <Page>
        <StepHeader label={`Step ${screen} of ${QUESTIONS.length}`} progress={screen / QUESTIONS.length} title={q.title} why={q.why} />
        <q.Body a={answers} set={changeAnswers} names={names} />
        <Nav back={() => go(screen - 1)} next={() => next(screen)} nextLabel={nextLabel(screen)} problem={q.problem?.(answers) ?? null} />
      </Page>
    );
  }

  if (screen === REVIEW) {
    return (
      <Page>
        <StepHeader label="Review" title="Review your answers" why="Check everything once. Your agreement is written from these answers." />
        {summary(household, answers).map((s, i) => (
          <section key={s.title} className="card flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg">{s.title}</h2>
              <button className="px-2 py-2 font-semibold underline" onClick={() => edit(i)} aria-label={`Edit ${s.title}`}>
                Edit
              </button>
            </div>
            <ul className="flex flex-col gap-1 text-[15px]">
              {s.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
        <Nav
          back={() => go(QUESTIONS.length)}
          next={() => {
            setFromReview(false);
            go(AGREEMENT);
          }}
          nextLabel="Generate Agreement"
          problem={null}
        />
      </Page>
    );
  }

  // The agreement
  const sign = (i: number, at: string | null) => setSignatures(names.map((_, j) => (j === i ? at : signatures[j] ?? null)));
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 print:max-w-none print:p-0">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button className="btn h-12 w-auto border border-line bg-white text-ink" onClick={() => go(REVIEW)}>
          Edit Answers
        </button>
        <button className="btn h-12 w-auto border border-line bg-white text-ink" onClick={() => window.print()}>
          Download as PDF
        </button>
        <button className="btn h-12 w-auto border border-line bg-white text-ink" onClick={startOver}>
          Start Over
        </button>
      </div>
      <AgreementDocument
        household={household}
        answers={answers}
        signatures={signatures}
        onSign={(i) => sign(i, new Date().toISOString())}
        onUnsign={(i) => sign(i, null)}
      />
      <div className="flex flex-col gap-2 print:hidden">
        <button
          className="btn"
          onClick={() => save(newHouse({ household, answers, signatures: names.map((_, j) => signatures[j] ?? null) }))}
        >
          Open Household Dashboard
        </button>
        <p className="text-center text-sm text-muted">Anyone who hasn&apos;t signed can sign later from the dashboard.</p>
      </div>
    </main>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 py-8">{children}</main>;
}

function StepHeader({ label, title, why, progress }: { label: string; title: string; why: string; progress?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-muted">{label}</p>
      {progress !== undefined && (
        <div className="h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-ink transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      <h1 className="mt-2">{title}</h1>
      <p className="text-muted">{why}</p>
    </div>
  );
}

function Nav({ back, next, nextLabel, problem }: { back: () => void; next: () => void; nextLabel: string; problem: string | null }) {
  return (
    <div className="mt-auto flex flex-col gap-3 pt-4">
      {problem && <p className="text-sm font-semibold text-alert">{problem}</p>}
      <div className="flex gap-3">
        <button className="btn w-auto border border-line bg-white px-8 text-ink" onClick={back}>
          Back
        </button>
        <button className="btn" disabled={!!problem} onClick={next}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
      {label}
      <input type="date" className="field text-ink" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
