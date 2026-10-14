"use client";

import { Card, PageHeader } from "@/components/cards";
import type { IconName } from "@/components/icons";
import { update, useHouse } from "@/lib/store";

const SECTIONS: { title: string; icon: IconName; fields: string[][] }[] = [
  { title: "Basics", icon: "wifi", fields: [["wifi", "WiFi name"], ["password", "WiFi password"], ["trash", "Trash days"]] },
  { title: "Contacts", icon: "phone", fields: [["super", "Super"], ["hoa", "HOA"]] },
  { title: "Emergency", icon: "alert", fields: [["emergency", "Contact"], ["water", "Water shutoff"], ["breaker", "Breaker box"]] },
];

export default function Info() {
  const h = useHouse();
  if (!h) return null;

  return (
    <>
      <PageHeader title="Apartment Info" subtitle={`${h.agreement.household.address}. Tap any field to edit it; changes save automatically.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map(({ title, icon, fields }) => (
          <Card key={title} title={title} icon={icon}>
            <div className="divide-y divide-separator">
              {fields.map(([key, label]) => (
                <label key={key} className="flex min-h-14 flex-col justify-center py-2">
                  <span className="text-subhead text-secondary">{label}</span>
                  <input
                    value={h.info[key] ?? ""}
                    placeholder="Add"
                    aria-label={label}
                    onChange={(e) => update({ info: { ...h.info, [key]: e.target.value } })}
                    className="min-h-11 bg-transparent outline-none placeholder:text-secondary"
                  />
                </label>
              ))}
            </div>
          </Card>
        ))}

      </div>
    </>
  );
}
