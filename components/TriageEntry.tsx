"use client";

import { useState } from "react";
import AgentChat, { ExtractedTriageData, mapToAnswers } from "@/components/AgentChat";
import TriageWizard from "@/components/TriageWizard";
import { useI18n } from "@/components/I18nProvider";

type Phase = "chat" | "triage";

export default function TriageEntry() {
  const { lang } = useI18n();
  const [phase, setPhase] = useState<Phase>("chat");
  const [prefill, setPrefill] = useState<ReturnType<typeof mapToAnswers> | undefined>();
  const [summary, setSummary] = useState<string | undefined>();

  function handleChatComplete(data: ExtractedTriageData) {
    setPrefill(mapToAnswers(data));
    setSummary(data.summary);
    setPhase("triage");
  }

  function handleSkip() {
    setPhase("triage");
  }

  if (phase === "triage") {
    return (
      <div>
        {summary && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm border"
            style={{
              background: "color-mix(in srgb, var(--primary) 8%, white)",
              borderColor: "color-mix(in srgb, var(--primary) 25%, white)",
              color: "color-mix(in srgb, var(--primary) 80%, black)",
              direction: lang === "he" ? "rtl" : "ltr",
            }}
          >
            <strong>{lang === "he" ? "סיכום השיחה: " : "From our conversation: "}</strong>
            {summary}
          </div>
        )}
        <TriageWizard initialAnswers={prefill} chatSummary={summary} />
      </div>
    );
  }

  return (
    <div>
      <AgentChat onComplete={handleChatComplete} />
      <div className="mt-4 text-center">
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          {lang === "he"
            ? "עדיף למלא טופס עצמאית ←"
            : "Skip chat, fill the form myself →"}
        </button>
      </div>
    </div>
  );
}
