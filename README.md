# Business First Aid

**Crisis triage and support-routing for businesses impacted by the war in Israel.**

A localhost-first prototype built with Next.js 16, TypeScript, Tailwind CSS, Prisma v7, and SQLite.

---

## What it does

Business First Aid presents business owners with a 5-question triage flow, then:

1. **Classifies** the crisis into up to 8 categories
2. **Scores** severity from 1-5
3. **Routes** the case to the appropriate expert support lane
4. **Generates** context-specific immediate actions
5. **Stores** the case for back-office review and assignment

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via libsql |
| ORM | Prisma v7 |
| Runtime | Node.js 22 |

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/triage` | 5-question conversational triage wizard |
| `/results/[id]` | Diagnosis results, severity score, actions |
| `/backoffice` | Dashboard with all cases and filters |
| `/backoffice/cases/[id]` | Case review and management panel |

---

## Quick Start

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
business-first-aid/
 app/                   Routes (App Router)
 components/            TriageWizard, Badges, CasesTable, Navbar
 lib/                   triage-engine.ts, prisma.ts, types.ts
 data/                  questions.ts (all questions + constants)
 prisma/                schema.prisma, seed.ts, migrations/
 docs/                  product-spec, triage-logic, routing-logic
```

---

## Useful Commands

```bash
npm run dev           # Dev server
npm run build         # Production build
npm run db:seed       # Seed 6 demo businesses
npm run db:studio     # Open Prisma Studio
```

---

## Docs

- docs/product-spec.md
- docs/triage-logic.md
- docs/routing-logic.md
