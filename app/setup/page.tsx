"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AgreementDocument } from "@/components/agreement";
import { Icon } from "@/components/icons";
import { QUESTIONS } from "@/components/questions";
import { BackButton, Field, NavBar } from "@/components/ui";
import { SAMPLE_NAMES, fitAnswers, joinNames, sampleEmail, longDate, sampleDraft, summary, type Answers, type Household } from "@/lib/agreement";
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
  // Everything starts filled in with the sample household and answers, so the demo is just taps
  const [household, setHousehold] = useState(() => sampleDraft().household);
  const [answers, setAnswers] = useState(() => sampleDraft().answers);
  const [signatures, setSignatures] = useState<(string | null)[]>([]);
  const [fromReview, setFromReview] = useState(false); // editing one section from Review returns to Review
  const names = household.names;
  const emails = household.emails ?? [];
  const setName = (i: number, value: string) => changeHousehold({ names: names.map((n, j) => (j === i ? value : n)) });
  const addRoommate = () => {
    const name = SAMPLE_NAMES.find((n) => !names.includes(n)) ?? "";
    changeHousehold({ names: [...names, name], emails: [...names.map((_, j) => emails[j] ?? ""), name ? sampleEmail(name) : ""] });
  };

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
  const startOver = () => {
    const sample = sampleDraft();
    setHousehold(sample.household);
    setAnswers(sample.answers);
    setSignatures([]);
    setFromReview(false);
    go(WELCOME);
  };
  const next = (from: number) => go(fromReview || from === QUESTIONS.length ? REVIEW : from + 1);
  // Name the destination: "Continue to Guests", not "Next"
  const nextLabel = (from: number) =>
    fromReview ? "Save and Return to Review" : from === QUESTIONS.length ? "Continue to Review" : `Continue to ${QUESTIONS[from].short}`;

  if (screen === WELCOME) {
    return (
      <Page>
        <div className="flex flex-col gap-2 pt-4">
          <h1>Your Roommate Agreement, Made Together</h1>
          <p className="text-secondary">No awkward conversations, just agree once.</p>
        </div>
        <ol className="flex flex-col gap-4">
          {[
            ["Household Details", "The address, everyone's names, and the lease dates."],
            ["Eight Quick Questions", "Cleanliness, chores, money, guests, quiet hours, and more."],
            ["Review and Sign", "Housepact writes a formal agreement. You sign here, and your roommates get an invite to sign."],
          ].map(([title, help], i) => (
            <li key={title} className="flex gap-4">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fill font-semibold text-secondary">
                {i + 1}
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-subhead text-secondary">{help}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-subhead text-secondary">Every answer starts filled in with a sample household, so you can tap straight through or change anything.</p>
        <div className="mt-auto flex flex-col gap-2">
          <button className="btn" onClick={() => go(HOUSEHOLD)}>
            Get Started
          </button>
          {canUndoReset() && (
            <button className="link self-center" onClick={undoReset}>
              Undo Reset
            </button>
          )}
        </div>
      </Page>
    );
  }

  if (screen === HOUSEHOLD) {
    const problem = !household.address.trim()
      ? "The address is missing. Enter the home's street address to continue."
      : names.some((n) => !n.trim())
        ? "A name is blank. Enter each person's full name, or remove the empty row."
        : names.slice(1).some((_, k) => !/^\S+@\S+\.\S+$/.test(emails[k + 1] ?? ""))
          ? "An invite email is missing or incomplete. Enter a full email address for each roommate so their invite can be sent."
        : new Set(names.map((n) => n.trim().toLowerCase())).size < names.length
          ? "Two roommates have the same name. Give each person a different name, such as adding a last initial."
          : !(household.leaseStart && household.leaseEnd && household.effective)
            ? "A date is missing. Choose the lease start, lease end, and effective dates."
            : household.leaseEnd <= household.leaseStart
              ? `The lease ends before it starts. Choose an end date after ${longDate(household.leaseStart)}.`
              : null;
    return (
      <Page left={<BackButton onClick={() => go(WELCOME)} />}>
        <StepHeader label="Before You Begin" title="Household Details" why="These details appear at the top of your agreement and in every clause that names you." />
        <p className="flex gap-2 rounded-xl bg-surface p-4 text-subhead text-secondary">
          <Icon name="info" className="mt-0.5 size-4 shrink-0" />
          Filled in with sample details for the demo. Change anything you like.
        </p>
        <Field label="Address" help="The full street address, including the apartment number.">
          <input
            className="field"
            aria-label="Address"
            placeholder="245 Bedford Avenue, Apt 4B, Brooklyn, NY 11211"
            value={household.address}
            onChange={(e) => changeHousehold({ address: e.target.value })}
          />
        </Field>
        <Field label="You" help="You're setting up the house. You'll be the first name on the agreement.">
          <input className="field" aria-label="Your name" value={names[0]} onChange={(e) => setName(0, e.target.value)} />
        </Field>
        <Field label="Invite Your Roommates" help="Each roommate gets an email invite to join the house and sign the agreement on their own phone. One to five people.">
          {names.slice(1).map((name, k) => {
            const i = k + 1;
            return (
              <div key={i} className="flex flex-col gap-2 rounded-xl bg-surface p-4">
                <div className="flex items-center gap-2">
                  <input className="field" aria-label={`Roommate ${i} name`} placeholder="Full name" value={name} onChange={(e) => setName(i, e.target.value)} />
                  {names.length > 2 && (
                    <button
                      aria-label={`Remove ${name || `roommate ${i}`}`}
                      className="flex size-11 shrink-0 items-center justify-center rounded-xl text-secondary hover:bg-fill"
                      onClick={() => changeHousehold({ names: names.filter((_, j) => j !== i), emails: emails.filter((_, j) => j !== i) })}
                    >
                      <Icon name="xmark" />
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  className="field"
                  aria-label={`Roommate ${i} email`}
                  placeholder="Email for the invite"
                  value={emails[i] ?? ""}
                  onChange={(e) => changeHousehold({ emails: names.map((_, j) => (j === i ? e.target.value : emails[j] ?? "")) })}
                />
              </div>
            );
          })}
          {names.length < 6 && (
            <button className="link self-start" onClick={addRoommate}>
              <Icon name="plus" />
              Add Roommate
            </button>
          )}
        </Field>
        <Field label="Lease Dates" help="From the lease with your landlord.">
          <div className="flex gap-4">
            <DateInput label="Starts" value={household.leaseStart} onChange={(leaseStart) => changeHousehold({ leaseStart })} />
            <DateInput label="Ends" value={household.leaseEnd} onChange={(leaseEnd) => changeHousehold({ leaseEnd })} />
          </div>
        </Field>
        <Field label="Effective Date" help="When the agreement takes effect. Usually today.">
          <DateInput label="Effective" value={household.effective} onChange={(effective) => changeHousehold({ effective })} />
        </Field>
        <Continue onClick={() => next(HOUSEHOLD)} label={fromReview ? "Save and Return to Review" : `Continue to ${QUESTIONS[0].short}`} problem={problem} />
      </Page>
    );
  }

  if (screen <= QUESTIONS.length) {
    const q = QUESTIONS[screen - 1];
    return (
      <Page left={<BackButton onClick={() => go(screen - 1)} />} right={<span className="text-subhead text-secondary">{screen} of {QUESTIONS.length}</span>}>
        <StepHeader label={`Step ${screen} of ${QUESTIONS.length}`} progress={screen / QUESTIONS.length} title={q.title} why={q.why} />
        <q.Body a={answers} set={changeAnswers} names={names} />
        <Continue onClick={() => next(screen)} label={nextLabel(screen)} problem={q.problem?.(answers) ?? null} />
      </Page>
    );
  }

  if (screen === REVIEW) {
    return (
      <Page left={<BackButton onClick={() => go(QUESTIONS.length)} />}>
        <StepHeader label="Almost Done" title="Review Your Answers" why="Check everything once. Your agreement is written from these answers." />
        {summary(household, answers).map((s, i) => (
          <section key={s.title} className="card flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-body font-semibold">{s.title}</h2>
              <button className="link" onClick={() => edit(i)} aria-label={`Edit ${s.title}`}>
                <Icon name="pencil" className="size-4" />
                Edit
              </button>
            </div>
            <ul className="flex flex-col gap-1 text-subhead text-secondary">
              {s.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ))}
        <Continue
          onClick={() => {
            setFromReview(false);
            go(AGREEMENT);
          }}
          label="Generate Agreement"
          problem={null}
        />
      </Page>
    );
  }

  // The agreement
  const sign = (i: number, at: string | null) => setSignatures(names.map((_, j) => (j === i ? at : signatures[j] ?? null)));
  return (
    <>
      <NavBar left={<BackButton onClick={() => go(REVIEW)} label="Edit Answers" />} />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] print:max-w-none print:p-0">
        <p role="status" className="flex gap-2 rounded-xl bg-surface p-4 text-subhead print:hidden">
          <Icon name="check" className="mt-0.5 size-4 shrink-0 text-success" />
          <span>
            <span className="font-semibold">Invites sent to {joinNames(names.slice(1).map((n) => n.split(" ")[0]))}.</span>{" "}
            <span className="text-secondary">They&apos;ll each review and sign from their own phone. Sign below to add your signature.</span>
          </span>
        </p>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button className="btn-secondary w-auto" onClick={() => window.print()}>
            <Icon name="download" />
            Download as PDF
          </button>
          <button className="btn-secondary w-auto" onClick={startOver}>
            <Icon name="reset" />
            Start Over
          </button>
        </div>
        <AgreementDocument
          household={household}
          answers={answers}
          signatures={signatures}
          me={0}
          onSign={(i) => sign(i, new Date().toISOString())}
          onUnsign={(i) => sign(i, null)}
        />
        <div className="flex flex-col gap-2 print:hidden">
          <button className="btn" onClick={() => save(newHouse({ household, answers, signatures: names.map((_, j) => signatures[j] ?? null) }))}>
            Open Household Dashboard
          </button>
          <p className="text-center text-subhead text-secondary">Your dashboard shows who has signed and lets you resend invites.</p>
        </div>
      </main>
    </>
  );
}

/** An onboarding screen: navigation bar with the logo, then content in one column. */
function Page({ children, left, right }: { children: ReactNode; left?: ReactNode; right?: ReactNode }) {
  return (
    <>
      <NavBar left={left} right={right} />
      <main className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-xl flex-col gap-6 px-4 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</main>
    </>
  );
}

function StepHeader({ label, title, why, progress }: { label: string; title: string; why: string; progress?: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-subhead font-semibold text-secondary">{label}</p>
      {progress !== undefined && (
        <div className="h-1 rounded-full bg-fill" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="h-1 rounded-full bg-accent-ink transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      <h1 className="mt-2 text-title1">{title}</h1>
      <p className="text-secondary">{why}</p>
    </div>
  );
}

/** The one primary action at the bottom of an onboarding screen, with the reason if it's blocked. */
function Continue({ onClick, label, problem }: { onClick: () => void; label: string; problem: string | null }) {
  return (
    <div className="mt-auto flex flex-col gap-4 pt-4">
      {problem && (
        <p role="alert" className="flex gap-2 text-subhead font-semibold text-danger">
          <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
          {problem}
        </p>
      )}
      <button className="btn" disabled={!!problem} onClick={onClick}>
        {label}
      </button>
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 text-subhead text-secondary">
      {label}
      <input type="date" className="field" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
