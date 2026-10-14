"use client";

import { useState } from "react";
import { Choice, Dot } from "@/components/ui";
import { QUIZ, pactRules } from "@/lib/house";
import { update, useHouse } from "@/lib/store";

const DEFAULT = 1; // the middle answer is picked to start, e.g. 11pm quiet hours

export default function Pact() {
  const h = useHouse();
  const [picks, setPicks] = useState<number[]>([]);
  const [pick, setPick] = useState(DEFAULT);
  if (!h) return null;

  // Quiz: one question per screen
  if (!h.answers) {
    const step = picks.length;
    const last = step === QUIZ.length - 1;
    const next = () => {
      if (last) {
        update({ answers: [...picks, pick], agreed: [] });
        setPicks([]);
      } else {
        setPicks([...picks, pick]);
      }
      setPick(DEFAULT);
    };

    return (
      <>
        <h1>Pact</h1>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-line">
            <div className="h-2 rounded-full bg-ink transition-all" style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
          </div>
          <span className="text-sm text-muted">
            {step + 1}/{QUIZ.length}
          </span>
        </div>
        <h2 className="mt-4 text-2xl">{QUIZ[step].q}…</h2>
        <div className="flex flex-col gap-3">
          {QUIZ[step].options.map((option, i) => (
            <Choice key={option} on={pick === i} onClick={() => setPick(i)}>
              {option}
            </Choice>
          ))}
        </div>
        <button className="btn mt-4" onClick={next}>
          {last ? "See pact" : "Next"}
        </button>
      </>
    );
  }

  // The agreement: a sticky note everyone taps to agree
  const everyone = h.agreed.length === h.mates.length;
  const toggle = (i: number) =>
    update({ agreed: h.agreed.includes(i) ? h.agreed.filter((a) => a !== i) : [...h.agreed, i] });

  return (
    <>
      <h1>Pact</h1>
      <div className="flex -rotate-1 flex-col gap-4 rounded-xl bg-note p-6">
        <div className="flex items-start justify-between gap-3">
          <h2>{h.name} pact</h2>
          {everyone && (
            <span role="img" aria-label="Everyone agreed" className="text-4xl leading-none">
              ✓
            </span>
          )}
        </div>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          {pactRules(h.answers).map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2 pt-2">
          {h.mates.map((name, i) => {
            const agreed = h.agreed.includes(i);
            return (
              <button key={i} aria-label={name} aria-pressed={agreed} onClick={() => toggle(i)} className="relative rounded-full">
                <Dot i={i} name={name} big hollow={!agreed} />
                {agreed && (
                  <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-ink text-sm text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p>{everyone ? "Everyone agreed" : "Tap your dot to agree"}</p>
      </div>
    </>
  );
}
