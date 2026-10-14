"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Choice, Dot, Field, PactNote } from "@/components/ui";
import { QUIZ, newHouse, toggle } from "@/lib/house";
import { canUndoReset, save, undoReset, useHouse } from "@/lib/store";

const STEPS = ["You", "Roommates", "Pact"];
const SUGGESTED = ["Sam", "Jordan", "Priya", "Taylor", "Morgan"];
const DEFAULT = 1; // each quiz question starts on its middle answer, e.g. 11pm quiet hours

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

/** The main tenant's signup: welcome → their name and place → add roommates → make the pact. */
function Onboarding() {
  const [step, setStep] = useState(0);
  const [me, setMe] = useState("Alex");
  const [place, setPlace] = useState("Apt 4B");
  const [mates, setMates] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<number[] | null>(null);
  const [agreed, setAgreed] = useState<number[]>([]);

  const everyone = [me.trim(), ...mates];
  const addMate = (name: string) => {
    if (name.trim() && mates.length < 5) setMates([...mates, name.trim()]);
    setDraft("");
  };
  const back = () => {
    setAnswers(null);
    setAgreed([]);
    setStep(step - 1);
  };

  if (step === 0) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 py-12">
        <div className="mt-8 flex size-20 -rotate-6 items-center justify-center rounded-2xl bg-note text-4xl">✓</div>
        <div>
          <h1 className="text-4xl">Housepact</h1>
          <p className="mt-2 text-muted">No awkward conversations, just agree once.</p>
        </div>
        <ul className="flex flex-col gap-3">
          <li>🏠 Your home&apos;s info in one place</li>
          <li>🤝 House rules everyone agrees to</li>
          <li>🧹 Chores, bills, and plans, shared</li>
        </ul>
        <button className="btn mt-auto" onClick={() => setStep(1)}>
          Get started
        </button>
        {canUndoReset() && (
          <button className="-mt-3 self-center px-4 py-3 text-sm text-muted" onClick={undoReset}>
            Undo reset
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 py-6">
      {/* Progress: You · Roommates · Pact */}
      <div className="flex items-center gap-2">
        <button aria-label="Back" onClick={back} className="-ml-3 size-12 text-3xl leading-none">
          ‹
        </button>
        <ol className="flex flex-1 gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              aria-current={i + 1 === step ? "step" : undefined}
              className={`flex-1 border-t-4 pt-1 text-sm ${i + 1 <= step ? "border-ink" : "border-line text-muted"} ${i + 1 === step ? "font-bold" : ""}`}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>

      {step === 1 && (
        <>
          <h1>Welcome!</h1>
          <Field label="Your name">
            <div className="flex items-center gap-3">
              <Dot i={0} name={me} />
              <input className="field" aria-label="Your name" value={me} onChange={(e) => setMe(e.target.value)} />
            </div>
          </Field>
          <Field label="Your place">
            <input className="field" aria-label="Your place" value={place} onChange={(e) => setPlace(e.target.value)} />
          </Field>
          <button className="btn mt-auto" disabled={!me.trim() || !place.trim()} onClick={() => setStep(2)}>
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1>Roommates</h1>
          <ul className="divide-y divide-line rounded-xl bg-white px-4">
            {everyone.map((name, i) => (
              <li key={i} className="flex h-16 items-center gap-3">
                <Dot i={i} name={name} />
                <span className="flex-1">{name}</span>
                {i === 0 ? (
                  <span className="text-sm text-muted">You</span>
                ) : (
                  <button
                    aria-label={`Remove ${name}`}
                    onClick={() => setMates(mates.filter((_, j) => j !== i - 1))}
                    className="-mr-3 size-12 text-muted"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
          {mates.length < 5 && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addMate(draft);
                }}
                className="flex gap-2"
              >
                <input className="field" placeholder="Roommate's name" aria-label="Roommate's name" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button disabled={!draft.trim()} className="btn w-auto">
                  Add
                </button>
              </form>
              <Field label="Quick add">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED.filter((n) => !everyone.includes(n)).map((name) => (
                    <Choice key={name} on={false} onClick={() => addMate(name)}>
                      + {name}
                    </Choice>
                  ))}
                </div>
              </Field>
            </>
          )}
          <button className="btn mt-auto" disabled={!mates.length} onClick={() => setStep(3)}>
            Next
          </button>
        </>
      )}

      {step === 3 &&
        (answers ? (
          <>
            <h1>Your pact</h1>
            <PactNote title={place.trim()} mates={everyone} answers={answers} agreed={agreed} onToggle={(i) => setAgreed(toggle(agreed, i))} />
            <button className="btn mt-auto" onClick={() => save(newHouse(place.trim(), everyone, answers, agreed))}>
              Go to dashboard
            </button>
          </>
        ) : (
          <Quiz onDone={setAnswers} />
        ))}
    </main>
  );
}

/** The pact quiz: one question per screen. */
function Quiz({ onDone }: { onDone: (answers: number[]) => void }) {
  const [picks, setPicks] = useState<number[]>([]);
  const [pick, setPick] = useState(DEFAULT);
  const step = picks.length;
  const last = step === QUIZ.length - 1;
  const { topic, q, options } = QUIZ[step];

  const next = () => {
    if (last) onDone([...picks, pick]);
    else setPicks([...picks, pick]);
    setPick(DEFAULT);
  };

  return (
    <>
      <h1>House rules</h1>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted">
          <span>{topic}</span>
          <span>
            {step + 1} of {QUIZ.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-ink transition-all" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
        </div>
      </div>
      <h2 className="mt-2 text-2xl">{q}…</h2>
      <div className="flex flex-col gap-3">
        {options.map((option, i) => (
          <Choice key={option} on={pick === i} onClick={() => setPick(i)}>
            {option}
          </Choice>
        ))}
      </div>
      <button className="btn mt-auto" onClick={next}>
        {last ? "See pact" : "Next"}
      </button>
    </>
  );
}
