# Routing Logic — Business First Aid

The routing engine assigns each triage submission to exactly one support lane.

---

## Lane Assignment — Priority Rules

The routing algorithm evaluates rules in order and returns the first match:

```
1. IF q4HelpNeeded = "tech_help"          → tech_expert
2. IF q4HelpNeeded = "marketing_help"      → campaign_manager
3. IF q4HelpNeeded = "finance_help"        → finance_aid

4. IF categories includes cashflow_survival → finance_aid
5. IF categories includes digital_tech_gap  → tech_expert
6. IF categories includes (marketing_effectiveness OR tourism) → campaign_manager

7. IF categories.length >= 3               → multi_disciplinary
8. IF categories includes leadership_overwhelm → multi_disciplinary
9. IF q1 = "overwhelmed"                   → multi_disciplinary
10. IF q4 = "prioritisation"               → multi_disciplinary
11. IF q4 = "not_sure"                     → multi_disciplinary

12. DEFAULT                                → business_manager
```

---

## Lane Descriptions

### Tech Expert
Assigned when: the business explicitly needs technology/digital help, or has identified a `digital_tech_gap` category.

Focus: e-commerce platforms, digital tools, system automation, tech costs, online presence.

### Campaign Manager
Assigned when: marketing or demand recovery is the primary need, or tourism/marketing categories are dominant.

Focus: campaign strategy, messaging, demand reconstruction, digital marketing pivots.

### Business Manager
Assigned when: the case involves operations or staffing issues without the complexity of multiple crisis types.

Focus: business continuity, staff management, operational restructuring, process redesign.

### Finance Aid
Assigned when: cashflow/survival is the primary category, or finance help is explicitly requested.

Focus: cashflow forecast, bank negotiations, emergency credit, grants and relief programs.

### Multi-Disciplinary Review
Assigned when: the business has 3+ crisis categories, leadership overwhelm is identified, or the owner cannot articulate what help they need.

Focus: case intake review by a team of specialists, structured triage escalation, holistic action planning.

---

## Priority Mapping

| Severity Score | Priority Label |
|---|---|
| 4–5 | critical |
| 3 | high |
| 2 | normal |
| 1 | low |

---

## Back-Office Routing

Once a case is created:

1. It appears in `/backoffice` sorted by priority (critical first)
2. Status is `new` by default
3. A team member reviews the case and sets `assignedTo`
4. Status transitions: `new → in-review → assigned → resolved`
5. Internal notes can be added at any status
