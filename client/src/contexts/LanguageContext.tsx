import React, { createContext, useContext, useState, useEffect } from "react";

export type AppLanguage = "ar" | "fr" | "en";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (ar: string, fr: string, en: string) => string;
}

const STORAGE_KEY = "app-language";

/**
 * Detect browser language and map to supported app language.
 * - French browser → "fr"
 * - English browser → "en"
 * - Arabic or any other → "ar" (default for Tunisian audience)
 */
function detectBrowserLanguage(): AppLanguage {
  try {
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const code = lang.toLowerCase().split("-")[0];
      if (code === "fr") return "fr";
      if (code === "en") return "en";
      if (code === "ar") return "ar";
    }
  } catch {
    // Fallback silently
  }
  return "ar"; // Default: Arabic for Tunisian audience
}

function getInitialLanguage(): AppLanguage {
  // 1. Check localStorage first (user's explicit choice persists)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ar" || saved === "fr" || saved === "en") {
    return saved;
  }
  // 2. Auto-detect from browser language
  return detectBrowserLanguage();
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  t: (ar) => ar,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Update document direction
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    // Persist initial detected language so future visits remember it
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const t = (ar: string, fr: string, en: string) => {
    if (language === "fr") return fr;
    if (language === "en") return en;
    return ar;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
