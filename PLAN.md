# PLAN.md — Housepact MVP

Build everything below in one pass, keeping each feature as simple as possible. Then review for simplicity and test.

## Build
- [x] Next.js app with no landing page. It opens on Setup (first visit) or Home.
- [x] Setup: household name, roommate names, and a "Load demo house" button
- [x] Bottom tabs: Home, Pact, Chores, Bills, Calendar
- [x] Home: today summary, WiFi tap-to-copy, trash day, contacts & emergency info, condition notes, and a small Reset option
- [x] Pact: short quiz → agreement template → each roommate taps to agree
- [x] Chores: add, assign, set frequency, check off (logs who and when)
- [x] Bills: add expense, split equally, show who owes whom, Housepact subscription included
- [x] Calendar: Quiet Time and Hosting events, overlap warning, "Add to Google Calendar" link
- [x] Realistic demo data for the "Load demo house" button

## Simplify
- [x] Review every screen against DESIGN.md and cut extra words, buttons, and steps
- [x] Remove anything not in PRD.md

## Test (demo flow)
- [x] Load demo house → take the quiz → everyone agrees → check off a chore → add a bill and see balances update → add a Hosting event that conflicts with Quiet Time → Reset works
- [x] Works on a phone-sized screen with no errors
