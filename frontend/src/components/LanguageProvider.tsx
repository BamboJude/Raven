"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Language,
  getStoredLanguage,
  setStoredLanguage,
  translations,
} from "@/lib/i18n";

type Translations = typeof translations.fr;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

// Create context with a default value to prevent errors during SSR
const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference on client
    const savedLang = getStoredLanguage();
    if (savedLang !== lang) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t: translations[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Language toggle component
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors ${className}`}
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      <span className="text-base">{lang === "fr" ? "🇫🇷" : "🇬🇧"}</span>
      <span>{lang === "fr" ? "FR" : "EN"}</span>
    </button>
  );
}
