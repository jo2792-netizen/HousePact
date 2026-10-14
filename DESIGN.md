# DESIGN.md — Housepact

## The one rule
**If a screen needs explaining, simplify the screen.** Anyone should be able to use it in seconds with no instructions.

## Simplicity
- One screen, one job, one main button.
- Tap, don't type. Use choices and pickers, with smart defaults (equal split, today's date, 11pm quiet hours).
- Common actions take 3 taps or fewer.
- No tutorials, tooltips, or pop-ups. Offer undo instead of "Are you sure?"
- Big buttons (44 points minimum), built for one thumb.

## Words
- Buttons are short, specific verbs in Title Case ("Add Bill", "Mark as Paid"). In onboarding, the button names the destination ("Continue to Guests", not "Next").
- Titles and card headers use Title Case; descriptions and helper text use sentence case. Let numbers do the talking ("You owe $33.90").
- Error messages say what went wrong and what to do ("The percentages add up to 112%. Adjust them so they total exactly 100%.").
- Empty states: one short line ("Nothing planned.").

## Look
Follows `apple-hig-quick-guide.md` (the source of truth): clarity, deference, depth. Calm and uncluttered.

**Color.** Semantic colors, each with a Light and Dark value (defined once in `app/globals.css`):

| Role | Light | Dark | Use |
|---|---|---|---|
| bg | `#F2F2F7` | `#000000` | Page background |
| surface | `#FFFFFF` | `#1C1C1E` | Cards, sheets, fields |
| fill | `#E9E9EE` | `#2C2C2E` | Chips, secondary buttons |
| label | `#1C1C1E` | `#FFFFFF` | Primary text |
| secondary | `#636366` | `#AEAEB2` | Secondary text |
| separator | `#D1D1D6` | `#38383A` | Dividers, borders |
| accent | `#FFD95A` | `#FFD95A` | The logo's gold: filled buttons, switches, selection |
| accent-ink | `#7A5800` | `#FFD95A` | Gold text, icons, and selected borders (deepened in Light Mode for 4.5:1) |
| danger | `#D70015` | `#FF6961` | One meaning: a problem (error, conflict, money you owe) |
| success | `#1F7A35` | `#30D158` | One meaning: complete (paid, done) |

- **One accent.** Gold is used only for interactive elements and selected states. Every text pairing meets 4.5:1. Never color alone: selection adds a checkmark, status adds an icon or label.
- **Logo.** A small gold mark plus "Housepact" in the navigation bar at the top of every screen (or the sidebar top on larger screens). Our one intentional exception to the guide's branding advice. The gold mark reads well in Dark Mode.
- **Type.** The system font (San Francisco on Apple devices) with Apple's text styles in rem: Large Title 34, Title 1 28, Title 2 22, Title 3 20, Body 17, Callout 16, Subheadline 15, Caption 12 (tab bar only). Hierarchy comes from weight and secondary color. Text scales with the reader's size setting, and with Dynamic Type on iOS Safari. The agreement is the one place with a second typeface (a serif, plus a script for signatures).
- **Roommates.** Neutral gray monograms, never colors. Names always appear in text beside them.
- **Shape and depth.** 8-point spacing (8, 16, 24, 32, with 4 for tightly paired text). 12pt rounded controls, 16pt rounded cards, no borders on cards, no heavy shadows. Translucent material only on the navigation and tab bars.
- **Motion.** Quick and explanatory (a sheet rises, a switch slides, progress fills). Turned off under Reduce Motion.
- **Accessibility.** Every tappable element is at least 44 x 44 points. Icon-only buttons have labels; decorative images are hidden from screen readers.
- **Signature moment.** The agreement appears as a formal paper document (serif type, numbered articles, ruled tables) signed by typing your name, shown in a script font, ending in "Fully Executed." It adapts to Dark Mode on screen and always prints black on white. No emojis anywhere in the app.

## Layout
Responsive. Phones get a single column with a bottom tab bar (icon + label): **Home · Agreement · Chores · Bills · Calendar**. Tablets and laptops get a left sidebar with the logo, house name, the same tabs plus Apartment info, and Reset demo.

- **Home (the overview):** greeting for you (the app is from one roommate's point of view); a cover picture of the apartment (a drawn brownstone by default, or an uploaded photo) with the address, lease dates, and Add bill / Add chore / Add event; a heads-up when someone needs quiet; four summary tiles (rent share, balance, your chores, agreement); then cards for this month's rent (who has paid), your roommates and their invite status (with Resend), upcoming chores (check off in place), recent bills, what's coming up, house info, and key house rules from the agreement.
- **Tabs go deeper:** each starts with a title, one-line description, an Add button, and summary tiles.
- **Chores:** Your chores, housemates' chores, and done, each with a round checkbox.
- **Bills:** Monthly totals, balances with "Mark paid" to record a payment, the rent card, and expenses grouped by month. "Add bill" opens one sheet: amount, what for, paid by, category, Save.
- **Calendar:** Upcoming events grouped by Today, Tomorrow, and date. Event types are chips (Interview, Party, Dinner…) grouped as Needs quiet / Busy house / Heads-up, with a red warning on conflicts.
- **Cards:** surface color, 16pt rounded, no border, no shadow. One consistent set of line icons; never emojis.
- **Agreement onboarding:** One topic per screen with "Step X of 8," a one-line reason it matters, and option cards with helper text and a "Recommended" tag. Back keeps answers.
- **Chores:** List with an assignee dot and a big round checkbox. Done items move to the bottom.
- **Bills:** Balances in large type at the top, expenses below. "Add bill" opens one sheet: amount, paid by, category, Save.
- **Calendar:** A simple upcoming list (not a month grid). Event types are chips (Interview, Party, Dinner…) grouped as Needs quiet / Busy house / Heads-up, with a red warning on conflicts.

## Quality
- Instant feedback on every tap.
- Text contrast at least 4.5:1. Never rely on color alone, so dots always show initials.
