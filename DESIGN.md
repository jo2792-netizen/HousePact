# DESIGN.md — Housepact

## The one rule
**If a screen needs explaining, simplify the screen.** Anyone should be able to use it in seconds with no instructions.

## Simplicity
- One screen, one job, one main button.
- Tap, don't type. Use choices and pickers, with smart defaults (equal split, today's date, 11pm quiet hours).
- Common actions take 3 taps or fewer.
- No tutorials, tooltips, or pop-ups. Offer undo instead of "Are you sure?"
- Big buttons (48px+), built for one thumb.

## Words
- Labels: 1–2 words ("Add bill"). Headings: one word (Home, Pact, Chores, Bills, Calendar).
- Buttons say exactly what happens, and the confirmation matches ("Mark done" → "Done ✓").
- Sentence case, no jargon. Let numbers do the talking ("You owe Sam $23").
- Empty states: one short line + one button ("No chores yet" + Add chore).

## Look
Calm and uncluttered, like a clean fridge door with one sticky note.

| Name | Hex | Use |
|---|---|---|
| Paper | `#F6F7F9` | Background |
| White | `#FFFFFF` | Cards, inputs |
| Ink | `#1E2A3A` | Text, main buttons |
| Muted | `#7A8494` | Secondary text |
| Note | `#FFD95A` | The agreement sticky note only |
| Alert | `#E5484D` | Money owed, conflicts |

- **Roommate dots:** Each roommate gets a color dot with their initial (blue `#4F7CFF`, green `#2BB673`, orange `#F28C38`, purple `#A66CFF`, pink `#EC5FA0`, teal `#20B2C4`). Use dots instead of names wherever possible.
- **Signature moment:** The agreement appears as a formal paper document (serif type, numbered articles, ruled tables) that each roommate signs by typing their name, shown in a script font. When all have signed it reads "Fully Executed." No emojis anywhere in the app.
- **Type:** Bricolage Grotesque for headings, Figtree for everything else (Google Fonts). 28px titles, 17px body, nothing under 14px.
- **Shape:** Generous spacing, 12px rounded cards, pill buttons, no shadows or gradients.

## Layout
Mobile-first, single column, with a bottom tab bar: **Home · Pact · Chores · Bills · Calendar**

```
Home                      Pact (quiz)
┌──────────────────────┐  ┌──────────────────────┐
│ Apt 4B        ● ● ●  │  │ ▓▓▓▓░░░░        3/6  │
│ WiFi ••••••   [Copy] │  │ Quiet hours start at │
│ Trash  Tue           │  │  [ 10pm ]            │
│ Your chores     2    │  │  [ 11pm ]            │
│ You owe       $23    │  │  [ Midnight ]        │
│ Next  Quiet Thu 2pm  │  │             [ Next ] │
│ Apartment info   >   │  └──────────────────────┘
└──────────────────────┘
```
- **Agreement onboarding:** One topic per screen with "Step X of 8," a one-line reason it matters, and option cards with helper text and a "Recommended" tag. Back keeps answers.
- **Chores:** List with an assignee dot and a big round checkbox. Done items move to the bottom.
- **Bills:** Balances in large type at the top, expenses below. "Add bill" opens one sheet: amount, paid by, category, Save.
- **Calendar:** A simple upcoming list (not a month grid). Event types are chips (Interview, Party, Dinner…) grouped as Needs quiet / Busy house / Heads-up, with a red warning on conflicts.

## Quality
- Instant feedback on every tap.
- Text contrast at least 4.5:1. Never rely on color alone, so dots always show initials.
