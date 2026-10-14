# PLAN.md — Housepact MVP

Build everything below in one pass, keeping each feature as simple as possible. Then review for simplicity and test.

## Build
- [x] Next.js app with no landing page. It opens on Setup (first visit) or Home.
- [x] Onboarding: welcome → household details (all pre-filled) → 7 questions → review → agreement → Home
- [x] Bottom tabs: Home, Pact, Chores, Bills, Calendar
- [x] Home: today summary, WiFi tap-to-copy, trash day, contacts & emergency info, condition notes, and a small Reset option
- [x] Agreement: formal document generated from the answers, type-to-sign, Fully Executed status, Download as PDF
- [x] Chores: add, assign, set frequency, check off (logs who and when)
- [x] Bills: add expense, split equally, show who owes whom, Housepact subscription included
- [x] Condition: before photos, notes by room with photos, report a repair from a note
- [x] Repairs: status, landlord or roommates, group or individual cost sent to Bills
- [x] Calendar: many event types (Needs quiet / Busy house / Heads-up), clash warning, Home heads-up, "Add to Google Calendar" link
- [x] Realistic example data on the new house, so every tab has something to show

## Simplify
- [x] Review every screen against DESIGN.md and cut extra words, buttons, and steps
- [x] Remove anything not in PRD.md

## Test (demo flow)
- [x] Get Started → tap through the pre-filled steps → review → generate the agreement → you sign (roommates are invited) → Home → check off a chore → add a bill and see balances update → add a Lunch or Party that clashes with someone's interview or early night → Reset works
- [x] Works on a phone-sized screen with no errors
