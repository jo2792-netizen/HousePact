# Housepact — MVP Product Requirements

**Tagline:** No awkward conversations, just agree once.

## Problem
Roommate conflicts usually come from expectations that were never written down. Bringing them up later feels awkward, and basic apartment info is scattered across group chats.

## Solution
Housepact is one simple place for a household's info, rules, chores, bills, and schedule. Roommates take a short quiz that generates their house agreement, so the hard conversations happen once.

## MVP Approach
- A working demo for a class presentation. Every feature works, but each one is the simplest possible version.
- No landing page, no login, no database. Data is saved in the browser (localStorage) on one device.
- Simple over complete: when in doubt, leave it out.

## Target User
College students and young professionals sharing an apartment with 2–6 roommates.

## Features (simple version of each)

**Setup.** The app opens on a short onboarding for the main tenant: a welcome screen, their name and place, quickly adding roommates (type a name or tap a suggestion), and the pact quiz. It then opens on Home, filled with realistic example info, chores, bills, and events to explore. A small Reset starts onboarding over.

**Apartment Info.** WiFi (tap to copy), trash pickup days, super/HOA contacts, and emergency info (contacts, shutoff valve, breaker box).

**Condition Tracker.** A short list of notes on the apartment's condition (e.g. "Scratch on kitchen counter, move-in").

**Agreement.** A short multiple-choice quiz covering kitchen & cleanliness, shared spaces & belongings, guests, quiet hours, sublets, and consequences. The answers fill in an agreement template, and each roommate taps to agree.

**Chores.** Chores with an assignee and a frequency (daily/weekly). Check one off to log who did it and when.

**Bills.** Add an expense with an amount, who paid, and a category (repairs, groceries & household, utilities, appliances & furniture). Split equally. Shows who owes whom. The Housepact subscription is included automatically as a monthly shared bill.

**House Calendar.** Add Quiet Time or Hosting events. A warning appears if they overlap. Each event has an "Add to Google Calendar" link.

## Not in the MVP
Accounts and syncing across devices, full Google Calendar sync, real payments, custom bill splits, chore rotation, photos, and notifications.

## Success Metric
In a live demo, someone can set up a household, sign the agreement, check off a chore, add a bill, and add an event in under 5 minutes without instructions.
