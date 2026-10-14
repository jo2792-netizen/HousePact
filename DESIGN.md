# DESIGN.md — Housepact

## The one rule
**If a screen needs explaining, redesign the screen.** Every screen should be usable in a few seconds with no instructions.

## Simplicity rules
- **One screen, one job.** Each screen has exactly one main button.
- **Tap, don't type.** Use choices, toggles, and pickers wherever possible. Typing is a last resort.
- **Smart defaults.** Pre-fill everything sensible (equal split, today's date, quiet hours at 11pm) so most actions are one tap.
- **Show, don't tell.** Use roommate color dots, checkmarks, and numbers instead of sentences.
- **No tutorials, tooltips, or onboarding slides.**
- **Max 3 taps** to do anything common, like checking off a chore, adding a bill, or copying the WiFi password.
- **Big touch targets.** Buttons at least 48px tall, built for one thumb.

## Words
- **Labels: 1–2 words.** "Add bill," not "Add a new shared expense."
- **Headings: one word when possible.** Home, Pact, Chores, Bills, Calendar.
- **Buttons say exactly what happens**, and the confirmation matches: "Mark done" → "Done ✓".
- **Sentence case.** No all caps, no exclamation points, no jargon.
- **Empty states: one short line + one button.** Example: "No chores yet" + [Add chore].
- **Numbers do the talking.** "You owe Sam $23" beats any explanation.

## Visual style
Calm, friendly, and uncluttered, like a clean fridge door with one sticky note on it.

**Color**
| Name | Hex | Use |
|---|---|---|
| Paper | `#F6F7F9` | Page background |
| White | `#FFFFFF` | Cards and inputs |
| Ink | `#1E2A3A` | Text and main buttons |
| Muted | `#7A8494` | Secondary text |
| Note | `#FFD95A` | The one highlight (see below) |
| Alert | `#E5484D` | Money owed, overdue chores |

**Roommate colors.** Each roommate gets their own color, shown as a dot with their initial everywhere they appear (chores, bills, calendar, signatures). This replaces names in most places, so screens stay short.
`#4F7CFF` blue · `#2BB673` green · `#F28C38` orange · `#A66CFF` purple · `#EC5FA0` pink · `#20B2C4` teal

**The one memorable thing.** The signed agreement is shown as a yellow sticky note (`Note` color) with every roommate's dot on it. When the last person agrees, the note gets a check. It's the only decorative element in the app; everything else stays quiet.

**Type**
- **Headings:** Bricolage Grotesque, semibold (Google Fonts)
- **Everything else:** Figtree, regular and medium (Google Fonts)
- Sizes: 28px page titles, 17px body, 14px secondary. Nothing smaller than 14px.

**Shape and spacing**
- Generous spacing (16–24px). Fewer items per screen beats more.
- Rounded corners, 12px for cards and full pill shape for buttons.
- No shadows or gradients. Use white cards on the Paper background for separation.

## Layout
Mobile-first, single column, with a fixed bottom tab bar of 5 icons with 1-word labels:

```
[ Home ] [ Pact ] [ Chores ] [ Bills ] [ Calendar ]
```

### Home
Shows only what matters today, plus apartment info.
```
┌───────────────────────────┐
│ Apt 4B             ● ● ●  │  ← roommate dots
│                           │
│ WiFi  ••••••••    [Copy]  │  ← tap to copy
│ Trash  Tue                │
│                           │
│ Your chores        2      │
│ You owe           $23     │
│ Next  Quiet 2–3pm Thu     │
│                           │
│ Contacts & emergency  >   │
└───────────────────────────┘
```

### Pact (agreement quiz)
One question per screen, big answer buttons, and a progress bar. No typing.
```
┌───────────────────────────┐
│ ▓▓▓▓▓░░░░░          3/6   │
│                           │
│ Quiet hours start at      │
│                           │
│  [ 10pm ]                 │
│  [ 11pm ]   ← default     │
│  [ Midnight ]             │
│                           │
│                  [ Next ] │
└───────────────────────────┘
```
After the last question, show the agreement as the yellow sticky note with short rule lines and each roommate's dot. Tapping a dot marks that roommate as agreed.

### Chores
A list of chores, each with an assignee dot and a big round checkbox. Tap the circle and it's done. Completed chores move to the bottom.
```
│ ○  Dishes          ●  │
│ ○  Trash out       ●  │
│ ✓  Bathroom        ●  │
│            [ Add chore ] │
```

### Bills
Balances at the top in large type, recent expenses below.
```
│ You owe Sam      $23  │
│ Jo owes you      $12  │
│                       │
│ Groceries  $46   ● │
│ Internet   $60   ● │
│            [ Add bill ] │
```
**Add bill** is a single sheet with amount (number pad opens automatically), a "Paid by" dot picker, and category chips. Split is equal by default. One button: Save.

### Calendar
A simple upcoming list, not a month grid. Each event shows a type icon (🤫 Quiet, 🎉 Hosting), the time, and an owner dot. If a Hosting event overlaps a Quiet one, show a red dot and "Conflicts with Quiet time."

## Feedback and motion
- Every action responds instantly: a checkmark, a brief "Saved," or the item appearing in the list.
- Motion only in response to taps, like a checkbox filling in or a sheet sliding up.
- Allow undo instead of asking "Are you sure?"

## Accessibility
- Text contrast at least 4.5:1.
- Never rely on color alone: roommate dots always show an initial, and alerts show an icon or word.
- Visible focus states and support for reduced motion.
