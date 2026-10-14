"use client";

import { PactNote } from "@/components/ui";
import { toggle } from "@/lib/house";
import { update, useHouse } from "@/lib/store";

// The pact is made during onboarding; roommates who haven't agreed yet can tap their dot here.
export default function Pact() {
  const h = useHouse();
  if (!h) return null;

  return (
    <>
      <h1>Pact</h1>
      <PactNote
        title={h.name}
        mates={h.mates}
        answers={h.answers}
        agreed={h.agreed}
        onToggle={(i) => update({ agreed: toggle(h.agreed, i) })}
      />
    </>
  );
}
