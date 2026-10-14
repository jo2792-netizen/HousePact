import type { ReactNode } from "react";
import type { Option } from "@/lib/agreement";
import { COLORS } from "@/lib/house";

/** A roommate's color dot with their initial. */
export function Dot({ i, name }: { i: number; name: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full font-bold"
      style={{ background: COLORS[i] }}
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

/** A labeled group of inputs, with optional helper text. */
export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-semibold">{label}</p>
        {help && <p className="text-sm text-muted">{help}</p>}
      </div>
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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 md:items-center md:p-6" onClick={onClose}>
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
        className="flex max-h-[90dvh] w-full max-w-md animate-slide-up flex-col gap-5 overflow-y-auto rounded-t-2xl bg-white p-6 pb-8 md:rounded-2xl"
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

/** Pick one option from cards that each show a label, helper text, and a "Recommended" tag. */
export function OptionCards<T>({ options, value, onChange, columns = 1 }: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div role="radiogroup" className={`grid gap-2 ${{ 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[columns]}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex flex-col items-start gap-1 rounded-xl border-2 bg-white px-4 py-3 text-left ${on ? "border-ink" : "border-line"}`}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="font-semibold">{o.label}</span>
              {o.rec && <Recommended />}
            </span>
            {o.help && <span className="text-sm text-muted">{o.help}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Recommended() {
  return <span className="shrink-0 rounded-full bg-paper px-2 py-0.5 text-sm font-semibold text-muted">Recommended</span>;
}

/** A labeled slider with end labels. */
export function Slider({ label, min, max, value, onChange, left, right }: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  left: string;
  right: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-12 w-full accent-ink"
      />
      <div className="flex justify-between text-sm text-muted">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/** An on/off switch with a label and helper text. */
export function Toggle({ label, help, on, onChange }: { label: string; help: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex items-center gap-4 rounded-xl border-2 border-line bg-white px-4 py-3 text-left"
    >
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-muted">{help}</span>
      </span>
      <span className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition ${on ? "bg-ink" : "bg-line"}`}>
        <span className={`size-6 rounded-full bg-white transition ${on ? "translate-x-6" : ""}`} />
      </span>
    </button>
  );
}

/** A dropdown. */
export function Select<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <select
      aria-label={label}
      value={String(value)}
      onChange={(e) => onChange(options.find((o) => String(o.value) === e.target.value)!.value)}
      className="field appearance-auto"
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
