"use client";

import React, { createContext, useContext, useState } from "react";
import { SupportedLanguage } from "@/i18n/settings";
import { getDictionary } from "@/utils/dictionary";

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string; // Translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage: SupportedLanguage;
}) {
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>(initialLanguage);

  const t = (key: string) => getDictionary(currentLanguage)(key);

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    // Update cookie via API route
    fetch("/api/language", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang }),
    });
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook untuk menggunakan language context di client components
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage harus digunakan dalam LanguageProvider");
  }
  return context;
}
