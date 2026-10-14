"use client";

import { AgreementDocument } from "@/components/agreement";
import { update, useHouse } from "@/lib/store";

// The signed Roommate Agreement. Roommates who haven't signed yet can sign here.
export default function Pact() {
  const h = useHouse();
  if (!h) return null;

  const sign = (i: number, at: string | null) =>
    update({ agreement: { ...h.agreement, signatures: h.mates.map((_, j) => (j === i ? at : h.agreement.signatures[j] ?? null)) } });

  return (
    <>
      <div className="flex items-center justify-between gap-3 print:hidden">
        <h1>Agreement</h1>
        <button className="btn h-12 w-auto" onClick={() => window.print()}>
          Download as PDF
        </button>
      </div>
      <AgreementDocument
        household={h.agreement.household}
        answers={h.agreement.answers}
        signatures={h.agreement.signatures}
        onSign={(i) => sign(i, new Date().toISOString())}
        onUnsign={(i) => sign(i, null)}
      />
    </>
  );
}
