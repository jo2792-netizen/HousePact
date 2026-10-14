# CLAUDE.md — Housepact

## What this is
Housepact is an MVP web app for roommates, built for a tech product management class. The spec is in `PRD.md`, the build order is in `PLAN.md`, and the look and feel is in `DESIGN.md`. Follow DESIGN.md on every screen: simple, minimal text, easy to use.

## How to work with me
- I'm a PM student, not an experienced developer. Explain things briefly in plain language.
- Keep it simple. This is an MVP, so build the minimum version of each feature and don't add extras unless I ask.
- Do one milestone from PLAN.md at a time. Show a short plan first and wait for my OK.
- After each milestone, tell me how to test it, check it off in PLAN.md, and commit to git.

## Tech stack
- Next.js + TypeScript + Tailwind CSS
- **No database, no backend, no login.** Save all data in the browser with localStorage.
- Optional: deploy on Vercel for a shareable demo link.

## Commands
- `npm run dev`: run locally at http://localhost:3000

## Rules
- Keep all data in localStorage, behind one small helper file so it's easy to swap for a real database later.
- Mobile-friendly layouts.
