"use client";

import { useLanguage } from "@/components/language-provider";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  SupportedLanguage,
} from "@/i18n/settings";
import {
  SegmentedControl,
  type SegmentedControlOption,
} from "@/components/segmented-control";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguage();
  const router = useRouter();

  const handleLanguageChange = useCallback(
    async (lang: string) => {
      if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
        const newLanguage = lang as SupportedLanguage;

        // Skip if same language
        if (newLanguage === currentLanguage) return;

        // 1. Update context immediately for better UX
        setLanguage(newLanguage);

        // 2. Save ke cookie via API
        try {
          const response = await fetch("/api/language", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: newLanguage }),
          });

          if (!response.ok) {
            throw new Error("Failed to save language");
          }

          // 3. Refresh halaman agar teks terupdate
          router.refresh();
        } catch (error) {
          console.error("Failed to save language preference:", error);
          // Revert on error
          setLanguage(currentLanguage);
        }
      }
    },
    [setLanguage, router, currentLanguage],
  );

  const languageOptions: SegmentedControlOption[] = SUPPORTED_LANGUAGES.map(
    (lang) => ({
      label: LANGUAGE_NAMES[lang],
      value: lang,
      icon: (
        <span className="text-base leading-none select-none">
          {LANGUAGE_FLAGS[lang]}
        </span>
      ),
    }),
  );

  return (
    <div className="w-full">
      <SegmentedControl
        options={languageOptions}
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="w-full"
      />
    </div>
  );
}
