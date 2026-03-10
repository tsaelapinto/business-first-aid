"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRIAGE_QUESTIONS, TRIAGE_QUESTIONS_HE } from "@/data/questions";
import { useI18n } from "@/components/I18nProvider";

type Answers = {
  q1MainProblem?: string;
  q2Severity?: string;
  q3Changes?: string[];
  q4HelpNeeded?: string;
  q5Urgency?: string;
  businessName?: string;
  ownerName?: string;
  email?: string;
  industry?: string;
  location?: string;
};

type Props = {
  initialAnswers?: Partial<Answers>;
  chatSummary?: string;
};

const STEP_COUNT = TRIAGE_QUESTIONS.length + 1; // +1 for identity step

export default function TriageWizard({ initialAnswers, chatSummary }: Props = {}) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const questions = lang === "he" ? TRIAGE_QUESTIONS_HE : TRIAGE_QUESTIONS;
  // If pre-populated from chat, jump straight to step 1 (skip welcome)
  const [step, setStep] = useState(initialAnswers ? 1 : 0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = step >= 1 && step <= questions.length ? questions[step - 1] : null;
  const isIdentityStep = step === questions.length + 1;
  const isWelcome = step === 0;

  function selectSingle(qId: string, value: string) {
    const fieldMap: Record<string, keyof Answers> = {
      q1: "q1MainProblem",
      q2: "q2Severity",
      q4: "q4HelpNeeded",
      q5: "q5Urgency",
    };
    const field = fieldMap[qId];
    if (field) setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMulti(value: string) {
    setAnswers((prev) => {
      const current = prev.q3Changes ?? [];
      if (current.includes(value)) {
        return { ...prev, q3Changes: current.filter((v) => v !== value) };
      }
      return { ...prev, q3Changes: [...current, value] };
    });
  }

  function currentAnswer(): string | string[] | undefined {
    if (!currentQuestion) return undefined;
    const fieldMap: Record<string, keyof Answers> = {
      q1: "q1MainProblem",
      q2: "q2Severity",
      q3: "q3Changes",
      q4: "q4HelpNeeded",
      q5: "q5Urgency",
    };
    return answers[fieldMap[currentQuestion.id]];
  }

  function canAdvance(): boolean {
    if (isWelcome) return true;
    if (isIdentityStep) return true;
    if (!currentQuestion) return false;
    const ans = currentAnswer();
    if (currentQuestion.multiSelect) {
      return Array.isArray(ans) && ans.length > 0;
    }
    return typeof ans === "string" && ans.length > 0;
  }

  async function handleNext() {
    if (step < questions.length) {
      setStep(step + 1);
      return;
    }
    if (step === questions.length) {
      setStep(step + 1);
      return;
    }
    // Submit
    await handleSubmit();
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        q1MainProblem: answers.q1MainProblem,
        q2Severity: answers.q2Severity,
        q3Changes: answers.q3Changes ?? [],
        q4HelpNeeded: answers.q4HelpNeeded,
        q5Urgency: answers.q5Urgency,
        businessName: answers.businessName,
        ownerName: answers.ownerName,
        email: answers.email,
        industry: answers.industry,
        location: answers.location,
      };

      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      router.push(`/results/${data.id}`);
    } catch {
      setError(t("submitError"));
      setSubmitting(false);
    }
  }

  const progress = step === 0 ? 0 : Math.round((step / (STEP_COUNT)) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      {step > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[var(--muted)] mb-2">
            <span>{t("stepLabel")} {step} {t("ofLabel")} {STEP_COUNT}</span>
            <span>{progress}{t("completeLabel")}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Welcome step */}
      {isWelcome && (
        <div className="card text-center space-y-6">
          <div className="text-6xl">🩹</div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]" data-testid="wizard-title">
            {t("wizardTitle")}
          </h1>
          <p className="text-[var(--muted)] text-lg leading-relaxed max-w-lg mx-auto">
            {t("wizardDesc")}
          </p>
          <div className="bg-[var(--accent-light)] border border-red-200 rounded-xl p-4 text-sm text-red-800">
            {t("wizardNote")}
          </div>
          <button onClick={() => setStep(1)} className="btn-primary w-full text-lg py-4" data-testid="start-triage-btn">
            {t("startTriageBtn")}
          </button>
        </div>
      )}

      {/* Question steps */}
      {currentQuestion && (
        <div className="card space-y-6">
          <div>
            <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest mb-2">
              {t("questionLabel")} {step} {t("ofLabel")} {questions.length}
            </p>
            <h2 className="text-xl font-bold text-[var(--foreground)] leading-snug">
              {currentQuestion.question}
            </h2>
            {currentQuestion.multiSelect && (
              <p className="text-sm text-[var(--muted)] mt-1">{t("selectAll")}</p>
            )}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const ans = currentAnswer();
              const selected = currentQuestion.multiSelect
                ? Array.isArray(ans) && ans.includes(opt.value)
                : ans === opt.value;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (currentQuestion.multiSelect) {
                      toggleMulti(opt.value);
                    } else {
                      selectSingle(currentQuestion.id, opt.value);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 font-medium text-sm ${
                    selected
                      ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {currentQuestion.multiSelect ? (
                      <span
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? "border-[var(--accent)] bg-[var(--accent)]" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                          selected ? "border-[var(--accent)] bg-[var(--accent)]" : "border-gray-300"
                        }`}
                      />
                    )}
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              {t("back")}
            </button>
            <button
              onClick={handleNext}
              disabled={!canAdvance()}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === questions.length ? t("continueBtn") : t("next")}
            </button>
          </div>
        </div>
      )}

      {/* Identity step */}
      {isIdentityStep && (
        <div className="card space-y-6">
          <div>
            <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest mb-2">
              {t("almostDone")}
            </p>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {t("tellUsBusiness")}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              {t("optionalDesc")}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { field: "businessName", label: t("fieldBusinessName"), placeholder: t("fieldBusinessNamePlaceholder") },
              { field: "ownerName", label: t("fieldOwnerName"), placeholder: t("fieldOwnerNamePlaceholder") },
              { field: "email", label: t("fieldEmail"), placeholder: t("fieldEmailPlaceholder"), type: "email" },
              { field: "industry", label: t("fieldIndustry"), placeholder: t("fieldIndustryPlaceholder") },
              { field: "location", label: t("fieldLocation"), placeholder: t("fieldLocationPlaceholder") },
            ].map((f) => (
              <div key={f.field}>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-1">
                  {f.label}
                </label>
                <input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={(answers as Record<string, string>)[f.field] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [f.field]: e.target.value }))
                  }
                  className="w-full border border-[var(--border)] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              {t("back")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary disabled:opacity-70"
            >
              {submitting ? t("submitting") : t("submitBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
