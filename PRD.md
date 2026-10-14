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

**Point of view.** The app belongs to one person: the main tenant who sets up the house. Other roommates appear as invited members. You sign the agreement on your device; each invited roommate signs from their own phone, and you can resend their invites. You can only record payments that you made or received.

## Target User
College students and young professionals sharing an apartment with 2–6 roommates.

## Features (simple version of each)

**Setup.** The app opens on an onboarding flow: a welcome screen, household details (address, your name, 1 to 5 roommates to invite by email, lease dates, effective date), seven questions, a review screen with an Edit link per section, and the generated agreement. "Open Household Dashboard" then opens Home, filled with realistic example info, chores, bills, and events. A small Reset starts onboarding over. For demos, the whole flow starts filled in with a realistic sample household and answers (address, names, rent split, every question, signatures, and examples in the Add forms), so it works with taps alone.

**Apartment Info.** WiFi (tap to copy), trash pickup days, super/HOA contacts, and emergency info (contacts, shutoff valve, breaker box).

**Condition Tracker.** A short list of notes on the apartment's condition (e.g. "Scratch on kitchen counter, move-in").

**Agreement.** Seven question screens (cleanliness; chores; rent, utilities, and groceries; food and belongings; quiet hours; damage; sublets, move-out, and disagreements) using sliders, option cards, toggles, and dropdowns, each with a recommended default. A template function turns the answers into a formal Residential Roommate Agreement: ten numbered articles, a rent split table, a chore rotation schedule, standard provisions, and type-to-sign signatures that mark it "Fully Executed." It can be downloaded as a PDF and is viewable later from the Pact tab. Dishes, personal items in shared spaces, guests, and damage reporting aren't asked; the agreement uses the recommended defaults for those.

**Chores.** Chores with an assignee and a frequency (daily/weekly). Check one off to log who did it and when.

**Bills.** Add an expense with an amount, who paid, and a category (repairs, groceries & household, utilities, appliances & furniture). Split equally. Shows who owes whom. The Housepact subscription is included automatically as a monthly shared bill.

**House Calendar.** Add events from a list of everyday types, grouped as "Needs quiet" (interview, study session, work call, early night, quiet time), "Busy house" (party, breakfast, lunch, dinner, club meeting, game night, overnight guest, repair visit), and "Heads-up" (house meeting, away, delivery). A warning appears when something that needs quiet overlaps a busy-house event, and Home gives a heads-up when someone needs quiet in the next day (e.g. "Priya has an interview"). Each event has an "Add to Google Calendar" link.

## Not in the MVP
Accounts and syncing across devices, full Google Calendar sync, real payments, custom bill splits, chore rotation, photos, and notifications.

## Success Metric
In a live demo, someone can set up a household, sign the agreement, check off a chore, add a bill, and add an event in under 5 minutes without instructions.
