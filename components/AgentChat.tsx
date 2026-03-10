"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

export type ExtractedTriageData = {
  main_problem: string;
  severity: string;
  changes: string[];
  help_needed: string;
  urgency: string;
  stress_level: number;
  summary: string;
};

type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  onComplete: (data: ExtractedTriageData) => void;
};

const TRIAGE_DATA_RE = /##TRIAGE_DATA##\s*([\s\S]*?)\s*##END##/;

export function mapToAnswers(data: ExtractedTriageData) {
  return {
    q1MainProblem: data.main_problem,
    q2Severity:    data.severity,
    q3Changes:     data.changes,
    q4HelpNeeded:  data.help_needed,
    q5Urgency:     data.urgency,
  };
}

function cleanContent(text: string) {
  return text.replace(TRIAGE_DATA_RE, "").trim();
}

export default function AgentChat({ onComplete }: Props) {
  const { lang } = useI18n();
  const isRtl = lang === "he";
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesRef = useRef<ChatMessage[]>([]);
  const [messages, setMessages]   = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        lang === "he"
          ? "שלום, אני כאן לעזור. ספר לי מה קורה עם העסק שלך, בשפה שלך, אין צורך בפורמליות."
          : "Hi, I'm here to help. Tell me what's going on with your business, in your own words.",
    },
  ]);

  // Keep ref in sync so sendMessage always sees current messages without stale closure
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const speechSupported =
    typeof window !== "undefined" && "webkitSpeechRecognition" in window;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      const currentMessages = messagesRef.current;
      const userMsg: ChatMessage = { role: "user", content: text };
      const nextMessages: ChatMessage[] = [...currentMessages, userMsg];
      setMessages(nextMessages);
      setInputText("");
      setStreaming(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.body) throw new Error("No response body");
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
        }
        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          const visible = cleanContent(accumulated);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: visible || "..." },
          ]);
        }

        const finalClean = cleanContent(accumulated);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: finalClean },
        ]);

        const match = TRIAGE_DATA_RE.exec(accumulated);
        if (match) {
          try {
            const data: ExtractedTriageData = JSON.parse(match[1]);
            setTimeout(() => onComplete(data), 800);
          } catch { /* malformed JSON */ }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content:
              lang === "he"
                ? "מצטער, משהו השתבש. אנא נסה שנית."
                : "Sorry, something went wrong. Please try again.",
          },
        ]);
        console.error("Chat error:", err);
      } finally {
        setStreaming(false);
      }
    },
    [streaming, lang, onComplete]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(inputText);
  }

  function startVoice() {
    if (!speechSupported) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).webkitSpeechRecognition as new () => {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onresult: ((e: any) => void) | null;
      start: () => void;
    };
    const recognition = new SR();
    recognition.lang = lang === "he" ? "he-IL" : "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setInputText(transcript);
      inputRef.current?.focus();
    };
    recognition.start();
  }

  const placeholder =
    lang === "he"
      ? "כתוב כאן או לחץ על המיקרופון לדיבור..."
      : "Type here or click the mic to speak...";

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden"
      style={{ minHeight: 420, maxHeight: 520, direction: isRtl ? "rtl" : "ltr" }}
    >
      <div className="px-5 py-4 flex items-center gap-3 bg-sky-500">
        <span className="text-white text-2xl">💬</span>
        <div>
          <p className="text-white font-semibold text-sm">
            {lang === "he" ? "יועץ עזרה ראשונה לעסקים" : "Business First Aid Advisor"}
          </p>
          <p className="text-white/70 text-xs">
            {streaming
              ? lang === "he" ? "מקליד..." : "Typing..."
              : lang === "he" ? "מחובר" : "Online"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? "bg-sky-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                }`}
              >
                {m.content || (
                  <span className="inline-flex gap-1 text-gray-400">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 px-4 py-3 flex gap-2 items-center bg-white"
      >
        {speechSupported && (
          <button
            type="button"
            onClick={startVoice}
            title={lang === "he" ? "דבר" : "Speak"}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              listening
                ? "bg-red-100 text-red-500 animate-pulse"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            🎤
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          disabled={streaming}
          className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 outline-none border border-gray-200 focus:border-sky-400 disabled:opacity-50"
          dir={isRtl ? "rtl" : "ltr"}
        />
        <button
          type="submit"
          disabled={streaming || !inputText.trim()}
          className="px-4 py-2 rounded-full text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          {lang === "he" ? "שלח" : "Send"}
        </button>
      </form>
    </div>
  );
}
