import type { ReactNode } from "react";
import { COLORS, pactRules } from "@/lib/house";

/** A roommate's color dot with their initial. Hollow = not filled in (e.g. hasn't agreed yet). */
export function Dot({ i, name, big, hollow }: { i: number; name: string; big?: boolean; hollow?: boolean }) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 font-bold ${big ? "size-12 text-lg" : "size-10"}`}
      style={{ borderColor: COLORS[i], background: hollow ? "white" : COLORS[i] }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}

/** Pick one roommate by tapping their dot. */
export function DotPicker({ mates, value, onChange }: { mates: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {mates.map((name, i) => (
        <button
          key={i}
          type="button"
          aria-label={name}
          aria-pressed={i === value}
          onClick={() => onChange(i)}
          className={`rounded-full border-2 p-0.5 ${i === value ? "border-ink" : "border-transparent"}`}
        >
          <Dot i={i} name={name} />
        </button>
      ))}
    </div>
  );
}

/** One option in a set of choices. */
export function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-12 rounded-full border px-4 ${on ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
    >
      {children}
    </button>
  );
}

/** The house agreement as a sticky note. Everyone taps their dot to agree; it gets a ✓ when all have. */
export function PactNote({ title, mates, answers, agreed, onToggle }: {
  title: string;
  mates: string[];
  answers: number[];
  agreed: number[];
  onToggle: (i: number) => void;
}) {
  const everyone = agreed.length === mates.length;
  return (
    <div className="flex -rotate-1 flex-col gap-4 rounded-xl bg-note p-6">
      <div className="flex items-start justify-between gap-3">
        <h2>{title} pact</h2>
        {everyone && (
          <span role="img" aria-label="Everyone agreed" className="text-4xl leading-none">
            ✓
          </span>
        )}
      </div>
      <ol className="flex list-decimal flex-col gap-2 pl-5">
        {pactRules(answers).map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2 pt-2">
        {mates.map((name, i) => {
          const on = agreed.includes(i);
          return (
            <button key={i} aria-label={name} aria-pressed={on} onClick={() => onToggle(i)} className="relative rounded-full">
              <Dot i={i} name={name} big hollow={!on} />
              {on && (
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
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </div>
  );
}

/** A panel that slides up from the bottom with a form and one Save button. */
export function Sheet({ title, canSave, onSave, onClose, children }: {
  title: string;
  canSave: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
          onClose();
        }}
        className="flex w-full max-w-md animate-slide-up flex-col gap-5 rounded-t-2xl bg-white p-6 pb-8"
      >
        <div className="flex items-center justify-between">
          <h2>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="-mr-3 size-12 text-xl text-muted">
            ✕
          </button>
        </div>
        {children}
        <button className="btn" disabled={!canSave}>
          Save
        </button>
      </form>
    </div>
  );
}
