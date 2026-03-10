export type AnswerOption = {
  value: string;
  label: string;
};

export type Question = {
  id: string;
  question: string;
  multiSelect?: boolean;
  options: AnswerOption[];
};

export const TRIAGE_QUESTIONS_HE: Question[] = [
  {
    id: "q1",
    question: "מה הבעיה העיקרית שפוגעת בעסק שלך כרגע?",
    options: [
      { value: "demand_drop", label: "לקוחות הפסיקו לקנות / הביקוש ירד" },
      { value: "tourism_loss", label: "התיירות או תנועת הלקוחות נעלמה" },
      { value: "staffing", label: "אני לא יכול/ה לפעול כרגיל בגלל מחסור בעובדים" },
      { value: "supply_chain", label: "אספקה / מלאי / לוגיסטיקה מופרעים" },
      { value: "cashflow", label: "תזרים המזומנים קריטי ואולי לא אשרוד את החודשים הקרובים" },
      { value: "overwhelmed", label: "אני מוצף/ת ולא יודע/ת מאיפה להתחיל" },
      { value: "other", label: "אחר" },
    ],
  },
  {
    id: "q2",
    question: "כמה חמור הנזק לעסק שלך כרגע?",
    options: [
      { value: "mild", label: "קל – אנחנו פועלים, אבל מתקשים" },
      { value: "moderate", label: "בינוני – נזק משמעותי, אבל עדיין פועלים" },
      { value: "severe", label: "חמור – שיבוש גדול, קשה לתפקד" },
      { value: "critical", label: "קריטי – העסק עלול להיסגר בקרוב" },
    ],
  },
  {
    id: "q3",
    question: "מה השתנה הכי הרבה מאז תחילת המלחמה?",
    multiSelect: true,
    options: [
      { value: "revenue_drop", label: "ההכנסות ירדו בחדות" },
      { value: "tourism_disappeared", label: "התיירות / תנועת הלקוחות נעלמה" },
      { value: "employees_unavailable", label: "עובדים אינם זמינים" },
      { value: "closed_temporarily", label: "נאלצתי לסגור זמנית / לצמצם פעילות" },
      { value: "costs_increased", label: "העלויות עלו" },
      { value: "supply_unreliable", label: "משלוחים / אספקה הפכו ללא אמינים" },
      { value: "marketing_not_working", label: "השיווק שלי לא עובד יותר" },
      { value: "no_clear_plan", label: "אין לי תוכנית ברורה" },
    ],
  },
  {
    id: "q4",
    question: "איזה סיוע מרגיש הכי נחוץ כרגע?",
    options: [
      { value: "quick_advice", label: "עצה מעשית מהירה" },
      { value: "marketing_help", label: "עזרה שיווקית / קמפיין" },
      { value: "finance_help", label: "עזרה פיננסית / תזרים מזומנים" },
      { value: "operations_help", label: "עזרה תפעולית / ניהול עסקי" },
      { value: "tech_help", label: "עזרה בטכנולוגיה / מערכות / דיגיטל" },
      { value: "prioritisation", label: "מישהו שיעזור לי לקבוע סדרי עדיפויות" },
      { value: "not_sure", label: "אני לא בטוח/ה" },
    ],
  },
  {
    id: "q5",
    question: "מתי אתה/את צריך/ה עזרה?",
    options: [
      { value: "today", label: "היום" },
      { value: "2_3_days", label: "תוך 2–3 ימים" },
      { value: "week", label: "תוך שבוע" },
      { value: "month", label: "החודש הזה" },
    ],
  },
];

export const TRIAGE_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "What is the main problem hurting your business right now?",
    options: [
      { value: "demand_drop", label: "Customers stopped buying / demand dropped" },
      { value: "tourism_loss", label: "Tourism or customer traffic disappeared" },
      { value: "staffing", label: "I cannot operate normally because of staff shortages or disruption" },
      { value: "supply_chain", label: "Supply / inventory / logistics are disrupted" },
      { value: "cashflow", label: "Cashflow is critical and I may not survive the next month(s)" },
      { value: "overwhelmed", label: "I am overwhelmed and do not know where to start" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "q2",
    question: "How severe is the impact on your business right now?",
    options: [
      { value: "mild", label: "Mild – we are functioning, but struggling" },
      { value: "moderate", label: "Moderate – significant damage, but still operating" },
      { value: "severe", label: "Severe – major disruption, hard to function" },
      { value: "critical", label: "Critical – the business may stop / close very soon" },
    ],
  },
  {
    id: "q3",
    question: "What changed most since the war began?",
    multiSelect: true,
    options: [
      { value: "revenue_drop", label: "Revenue dropped sharply" },
      { value: "tourism_disappeared", label: "Tourism / customer traffic disappeared" },
      { value: "employees_unavailable", label: "Employees are unavailable" },
      { value: "closed_temporarily", label: "I had to close temporarily / reduce activity" },
      { value: "costs_increased", label: "Costs increased" },
      { value: "supply_unreliable", label: "Deliveries / supply became unreliable" },
      { value: "marketing_not_working", label: "My marketing is not working anymore" },
      { value: "no_clear_plan", label: "I do not have a clear plan" },
    ],
  },
  {
    id: "q4",
    question: "What kind of help feels most needed right now?",
    options: [
      { value: "quick_advice", label: "Quick practical advice" },
      { value: "marketing_help", label: "Marketing / campaign help" },
      { value: "finance_help", label: "Finance / cashflow help" },
      { value: "operations_help", label: "Operational / business management help" },
      { value: "tech_help", label: "Technology / systems / digital help" },
      { value: "prioritisation", label: "Someone to help me prioritise and make a plan" },
      { value: "not_sure", label: "I'm not sure" },
    ],
  },
  {
    id: "q5",
    question: "How soon do you need help?",
    options: [
      { value: "today", label: "Today" },
      { value: "2_3_days", label: "Within 2–3 days" },
      { value: "week", label: "Within a week" },
      { value: "month", label: "This month" },
    ],
  },
];

export const SUPPORT_LANES = {
  tech_expert: "Tech Expert",
  campaign_manager: "Campaign Manager",
  business_manager: "Business Manager",
  finance_aid: "Finance Aid",
  multi_disciplinary: "Multi-Disciplinary Review",
} as const;

export type SupportLane = keyof typeof SUPPORT_LANES;

export const SUPPORT_LANES_HE = {
  tech_expert: "מומחי טכנולוגיה",
  campaign_manager: "מנהלי קמפיינים",
  business_manager: "ניהול עסקי",
  finance_aid: "סיוע פיננסי",
  multi_disciplinary: "סקירה רב-תחומית",
} as const;

export const CRISIS_CATEGORIES = {
  revenue_demand: "Revenue / Demand Crisis",
  tourism: "Tourism Crisis",
  operations_staffing: "Operations / Staffing Crisis",
  supply_chain: "Supply Chain Crisis",
  cashflow_survival: "Cashflow / Survival Crisis",
  leadership_overwhelm: "Leadership Overwhelm / Prioritisation Crisis",
  marketing_effectiveness: "Marketing Effectiveness Crisis",
  digital_tech_gap: "Digital / Tech Enablement Gap",
} as const;

export const CRISIS_CATEGORIES_HE = {
  revenue_demand: "משבר הכנסות / ביקוש",
  tourism: "משבר תיירות",
  operations_staffing: "משבר תפעול / כוח אדם",
  supply_chain: "משבר שרשרת אספקה",
  cashflow_survival: "משבר תזרים מזומנים / הישרדות",
  leadership_overwhelm: "משבר עומס ניהולי / סדרי עדיפויות",
  marketing_effectiveness: "משבר אפקטיביות שיווקית",
  digital_tech_gap: "פער בטכנולוגיה ודיגיטל",
} as const;

export type CrisisCategory = keyof typeof CRISIS_CATEGORIES;
