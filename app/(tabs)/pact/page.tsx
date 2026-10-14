"use client";

import { AgreementDocument } from "@/components/agreement";
import { PageHeader } from "@/components/cards";
import { Icon } from "@/components/icons";
import { update, useHouse } from "@/lib/store";

// The signed Roommate Agreement. Roommates who haven't signed yet can sign here.
export default function Pact() {
  const h = useHouse();
  if (!h) return null;

  const signed = h.agreement.signatures.filter(Boolean).length;
  const sign = (i: number, at: string | null) =>
    update({ agreement: { ...h.agreement, signatures: h.mates.map((_, j) => (j === i ? at : h.agreement.signatures[j] ?? null)) } });

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Agreement"
          subtitle={signed === h.mates.length ? "Signed by everyone. This is your house's official agreement." : `${signed} of ${h.mates.length} roommates have signed. Anyone left can sign at the bottom.`}
          action={
            <button className="btn w-auto" onClick={() => window.print()}>
              <Icon name="download" />
              Download as PDF
            </button>
          }
        />
      </div>
      <div className="max-w-4xl">
        <AgreementDocument
          household={h.agreement.household}
          answers={h.agreement.answers}
          signatures={h.agreement.signatures}
          onSign={(i) => sign(i, new Date().toISOString())}
          onUnsign={(i) => sign(i, null)}
        />
      </div>
    </>
  );
}
