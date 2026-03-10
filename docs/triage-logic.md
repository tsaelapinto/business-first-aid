# Triage Logic — Business First Aid

All classification is deterministic. No external AI or LLM is used in the core triage flow.

---

## Questions

### Q1 — Main Problem (single select)

| Value | Label |
|---|---|
| `demand_drop` | Customers stopped buying / demand dropped |
| `tourism_loss` | Tourism or customer traffic disappeared |
| `staffing` | Staff shortages or disruption |
| `supply_chain` | Supply / inventory / logistics disrupted |
| `cashflow` | Critical cashflow crisis |
| `overwhelmed` | Overwhelmed, no clear direction |
| `other` | Other |

### Q2 — Severity (single select)

| Value | Base Score |
|---|---|
| `mild` | 1 |
| `moderate` | 2 |
| `severe` | 3 |
| `critical` | 4 |

### Q3 — Changes Since War (multi-select)

| Value |
|---|
| `revenue_drop` |
| `tourism_disappeared` |
| `employees_unavailable` |
| `closed_temporarily` |
| `costs_increased` |
| `supply_unreliable` |
| `marketing_not_working` |
| `no_clear_plan` |

### Q4 — Help Needed (single select)

| Value |
|---|
| `quick_advice` |
| `marketing_help` |
| `finance_help` |
| `operations_help` |
| `tech_help` |
| `prioritisation` |
| `not_sure` |

### Q5 — Urgency (single select)

| Value | Urgency Bonus |
|---|---|
| `today` | +1 to severity |
| `2_3_days` | 0 |
| `week` | 0 |
| `month` | 0 |

---

## Severity Scoring Algorithm

```
severityScore = min(5,
  SEVERITY_MAP[q2Severity]       // base: 1–4
  + URGENCY_BONUS[q5Urgency]     // today: +1
  + (q3Changes.length >= 5 ? 1 : 0)  // many changes: +1
)
```

Range: 1–5. Cap at 5.

---

## Category Classification Rules

Each case can receive 1–8 categories. Categories are derived from:

1. **Q1 primary problem** (direct mapping)
2. **Q3 checkbox selections** (secondary signals)
3. **Q4 help preference** (intent signal)

| Signal | Category Added |
|---|---|
| q1 = demand_drop | revenue_demand |
| q1 = tourism_loss | tourism |
| q1 = staffing | operations_staffing |
| q1 = supply_chain | supply_chain |
| q1 = cashflow | cashflow_survival |
| q1 = overwhelmed | leadership_overwhelm |
| q3 includes revenue_drop | revenue_demand |
| q3 includes tourism_disappeared | tourism |
| q3 includes employees_unavailable | operations_staffing |
| q3 includes supply_unreliable | supply_chain |
| q3 includes marketing_not_working | marketing_effectiveness |
| q3 includes no_clear_plan | leadership_overwhelm |
| q4 = tech_help | digital_tech_gap |
| q4 = marketing_help | marketing_effectiveness |
| q4 = finance_help | cashflow_survival |
| q4 = prioritisation | leadership_overwhelm |

---

## Immediate Action Generation

For each identified category (up to 3), a fixed set of 2–3 actions is selected based on severity:

- Severity ≥ 3: 3 actions per category
- Severity < 3: 2 actions per category

Actions are deduplicated and capped at 9 total per case.

---

## Diagnosis Summary Generation

The summary is a 2–3 sentence machine-generated paragraph combining:
- Severity label (Mild / Moderate / Severe / Critical)
- Primary problem label
- Number of changes detected
- Top category labels
- Urgency note (if today or 2–3 days)
