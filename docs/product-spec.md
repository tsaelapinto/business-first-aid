# Product Specification — Business First Aid

## Overview

Business First Aid is a crisis triage and expert-routing platform for Israeli businesses impacted by the ongoing war. Its purpose is to provide immediate, structured support to business owners who are overwhelmed, disoriented, or facing existential threats to their operations.

The system does two things:

1. **Diagnoses** — using a deterministic triage engine, it classifies the business's crisis type, severity, and urgency without human involvement
2. **Routes** — it assigns the case to the correct expert support lane and generates actionable immediate guidance

---

## Design Principles

| Principle | Meaning |
|---|---|
| **Speed before perfection** | The triage must be completable in under 2 minutes |
| **Deterministic, not AI-dependent** | Classification is rule-based and predictable |
| **Supportive tone** | Language is calm, clear, and human |
| **Action-first results** | Every result includes concrete next steps |
| **Back-office visibility** | All cases are reviewable and assignable |

---

## User Roles

### Business Owner (Front-Office)

- Lands on `/` and understands the value proposition
- Starts triage at `/triage`
- Completes 5 questions + optional identity step
- Receives personalised diagnosis at `/results/[id]`

### Support Team (Back-Office)

- Views all incoming cases at `/backoffice`
- Filters by status, lane, priority
- Reviews full case details at `/backoffice/cases/[id]`
- Updates status, assigns to team member, adds internal notes

---

## Crisis Categories

| Key | Label |
|---|---|
| `revenue_demand` | Revenue / Demand Crisis |
| `tourism` | Tourism Crisis |
| `operations_staffing` | Operations / Staffing Crisis |
| `supply_chain` | Supply Chain Crisis |
| `cashflow_survival` | Cashflow / Survival Crisis |
| `leadership_overwhelm` | Leadership Overwhelm / Prioritisation Crisis |
| `marketing_effectiveness` | Marketing Effectiveness Crisis |
| `digital_tech_gap` | Digital / Tech Enablement Gap |

---

## Support Lanes

| Key | Label | Description |
|---|---|---|
| `tech_expert` | Tech Expert | Digital systems, e-commerce, tech enablement |
| `campaign_manager` | Campaign Manager | Marketing, demand recovery, re-engagement |
| `business_manager` | Business Manager | Operations, staffing, planning |
| `finance_aid` | Finance Aid | Cashflow, loans, emergency relief |
| `multi_disciplinary` | Multi-Disciplinary Review | Complex or multi-category cases |

---

## Data Model

See `prisma/schema.prisma` for the full `BusinessCase` model. Key fields:

- **Identity** — businessName, ownerName, email, phone, industry, location
- **Responses** — q1–q5 raw triage answers
- **Classification** — severityScore, categories, laneRecommended, diagnosisSummary, immediateActions
- **Case Management** — status, priority, assignedTo, internalNotes, resolvedAt

---

## Status Lifecycle

```
new → in-review → assigned → resolved → closed
```

---

## Priority Levels

| Priority | Condition |
|---|---|
| `critical` | Severity score ≥ 4 |
| `high` | Severity score = 3 |
| `normal` | Severity score = 2 |
| `low` | Severity score = 1 |
