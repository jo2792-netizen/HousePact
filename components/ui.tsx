"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import type { Option } from "@/lib/agreement";

const LOGO_SIZES = {
  md: { mark: "size-8", text: "text-body", gap: "gap-2" }, // navigation bar
  lg: { mark: "size-10", text: "text-title3", gap: "gap-2" }, // sidebar, agreement header
  xl: { mark: "size-16", text: "text-title1", gap: "gap-4" }, // welcome screen
};

/** The Housepact mark (a gold note with a check) and the two-tone wordmark: "House" plus "pact" in the brand gold. */
export function Logo({ name = true, size = "md" }: { name?: boolean; size?: keyof typeof LOGO_SIZES }) {
  const s = LOGO_SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.text} font-bold tracking-tight text-label`}>
      <svg viewBox="0 0 32 32" className={`${s.mark} shrink-0`} aria-hidden>
        <rect width="32" height="32" rx="8" fill="#FFD95A" />
        <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#1C1C1E" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {name && (
        <span>
          House<span className="text-accent-ink">pact</span>
        </span>
      )}
    </span>
  );
}

/** A translucent bar at the top of the screen with the logo in the middle, like an iOS navigation bar. */
export function NavBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-separator bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl print:hidden">
      <div className="mx-auto grid h-14 max-w-3xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="justify-self-start">{left}</div>
        <Logo />
        <div className="justify-self-end">{right}</div>
      </div>
    </header>
  );
}

/** A back button for the navigation bar. */
export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="link -ml-2 min-w-11 pr-2 pl-1">
      <Icon name="back" className="size-5" />
      {label}
    </button>
  );
}

/** A roommate's monogram. Decorative: names always appear in text next to it. */
export function Dot({ name }: { i?: number; name: string }) {
  return (
    <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-fill font-semibold text-secondary">
      {name[0]?.toUpperCase()}
    </span>
  );
}

/** Pick one roommate by name. */
export function NamePicker({ mates, value, onChange, label }: { mates: string[]; value: number; onChange: (i: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {mates.map((name, i) => (
        <Choice key={i} on={i === value} onClick={() => onChange(i)}>
          {name}
        </Choice>
      ))}
    </div>
  );
}

/** One option in a set of choices. Selected: gold border, gold wash, and a checkmark. */
export function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 px-4 font-semibold ${on ? "border-accent-ink bg-accent-wash text-label" : "border-transparent bg-fill text-label"}`}
    >
      {on && <Icon name="check" className="size-4 text-accent-ink" />}
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
        {help && <p className="text-subhead text-secondary">{help}</p>}
      </div>
      {children}
    </div>
  );
}

/** A sheet for adding something: Cancel at top left, the title in the middle, and one action button. */
export function Sheet({ title, action, canSave, onSave, onClose, children }: {
  title: string;
  action: string;
  canSave: boolean;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
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
        className="flex max-h-[90%] w-full animate-sheet flex-col overflow-y-auto rounded-t-2xl bg-surface pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center border-b border-separator bg-surface px-4 py-2">
          <button type="button" onClick={onClose} className="link justify-self-start">
            Cancel
          </button>
          <h2 className="text-body font-semibold">{title}</h2>
          <span />
        </div>
        <div className="flex flex-col gap-6 px-4 pt-6">
          {children}
          <button className="btn" disabled={!canSave}>
            {action}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Pick one option from cards with a label, helper text, and a "Recommended" tag. */
export function OptionCards<T>({ options, value, onChange }: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3; // ignored: inside the phone frame, options always stack in one column
}) {
  return (
    <div role="radiogroup" className="grid gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex min-h-11 items-start gap-4 rounded-xl border-2 px-4 py-4 text-left ${on ? "border-accent-ink bg-accent-wash" : "border-transparent bg-surface"}`}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-semibold">{o.label}</span>
              {o.help && <span className="text-subhead text-secondary">{o.help}</span>}
              {o.rec && <Recommended />}
            </span>
            <Check on={on} />
          </button>
        );
      })}
    </div>
  );
}

/** A radio indicator: an empty ring, or a gold disc with a checkmark when selected. */
function Check({ on }: { on: boolean }) {
  return on ? (
    <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
      <Icon name="check" className="size-4" />
    </span>
  ) : (
    <span aria-hidden className="size-6 shrink-0 rounded-full border-2 border-separator" />
  );
}

export function Recommended() {
  return <span className="self-start rounded-md bg-fill px-2 py-1 text-subhead font-semibold text-secondary">Recommended</span>;
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
        className="h-11 w-full cursor-pointer accent-[var(--accent-ink)]"
      />
      <div className="flex justify-between text-subhead text-secondary">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

/** An on/off switch with a label and helper text. The knob position, not just color, shows the state. */
export function Toggle({ label, help, on, onChange, rec }: { label: string; help: string; on: boolean; onChange: (on: boolean) => void; rec?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex min-h-11 items-center gap-4 rounded-xl bg-surface px-4 py-4 text-left"
    >
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-semibold">{label}</span>
        <span className="text-subhead text-secondary">{help}</span>
        {rec && <Recommended />}
      </span>
      <span className={`flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition ${on ? "bg-accent" : "bg-separator"}`}>
        <span className={`size-6 rounded-full bg-white shadow-sm transition ${on ? "translate-x-6" : ""}`} />
      </span>
    </button>
  );
}

/** A dropdown menu. */
export function Select<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={String(value)}
        onChange={(e) => onChange(options.find((o) => String(o.value) === e.target.value)!.value)}
        className="field cursor-pointer appearance-none pr-12"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="down" className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-secondary" />
    </div>
  );
}
