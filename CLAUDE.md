# CLAUDE.md — Housepact

## What this is
Housepact is a simple MVP demo app for roommates, built for a tech product management class presentation.
- `PRD.md`: what to build
- `DESIGN.md`: how it should look and feel
- `PLAN.md`: the checklist

## How to work
- **Build the whole app in one go**, covering everything in PLAN.md. You don't need to stop for approval between steps.
- **Keep it simple.** This is an MVP. Build the simplest working version of each feature, and don't add anything not in PRD.md.
- **After building, review everything for simplicity.** Remove extra text, extra buttons, and extra code. If something feels complicated, simplify it.
- **Then test it** by clicking through the demo flow in PLAN.md and fixing any errors.
- At the end, give me a short plain-language summary and tell me how to run it. I'm a PM student, not a developer.
- Commit to git when done.

## Tech
- Next.js + TypeScript + Tailwind CSS
- No database, no backend, no login. All data is saved in localStorage through one small helper file.
- No landing page. The app opens on Setup (first visit) or Home.
- Run with `npm run dev` at http://localhost:3000

## Rules
- Follow DESIGN.md on every screen: minimal text, easy to use, mobile-first.
- Prefer fewer files and simple, readable code.
