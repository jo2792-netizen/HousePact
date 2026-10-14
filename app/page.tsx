export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      {/* Sticky note: the one decorative element */}
      <div
        aria-hidden
        className="flex h-28 w-28 -rotate-3 items-center justify-center rounded-xl bg-note text-5xl"
      >
        ✓
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-[28px] leading-tight">Housepact</h1>
        <p className="text-muted">No awkward conversations, just agree once.</p>
      </div>

      <button
        type="button"
        className="h-14 w-full rounded-full bg-ink px-6 font-medium text-white"
      >
        Get started
      </button>
    </main>
  );
}
