"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/I18nProvider";

export default function Navbar() {
  const path = usePathname();
  const isBackoffice = path.startsWith("/backoffice");
  const { t, lang, toggleLang } = useI18n();

  return (
    <nav className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--accent)] text-2xl font-black leading-none">+</span>
          <span className="font-bold text-[var(--foreground)] text-lg tracking-tight">
            {t("appName")}
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/triage"
            className={`font-medium transition-colors ${
              path === "/triage"
                ? "text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t("getHelp")}
          </Link>
          {isBackoffice ? (
            <Link href="/backoffice" className="font-medium text-[var(--accent)]">
              {t("backOffice")}
            </Link>
          ) : (
            <Link href="/backoffice" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              {t("backOffice")}
            </Link>
          )}
          <button
            onClick={toggleLang}
            aria-label="Switch language"
            className="border border-[var(--border)] rounded-full px-3 py-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:border-gray-400 transition-all"
            data-testid="lang-switcher"
          >
            {lang === "en" ? "עב" : "EN"}
          </button>
        </div>
      </div>
    </nav>
  );
}
