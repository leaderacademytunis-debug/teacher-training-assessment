import React, { createContext, useContext, useState, useEffect } from "react";

export type AppLanguage = "ar" | "fr" | "en";

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (ar: string, fr: string, en: string) => string;
}

const STORAGE_KEY = "app-language";

/**
 * Safely read from localStorage (may throw SecurityError in some environments)
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely write to localStorage
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail - storage may be unavailable
  }
}

/**
 * Detect browser language and map to supported app language.
 * - French browser → "fr"
 * - English browser → "en"
 * - Arabic or any other → "ar" (default for Tunisian audience)
 */
function detectBrowserLanguage(): AppLanguage {
  try {
    const browserLangs =
      (typeof navigator !== "undefined" && navigator.languages) ||
      (typeof navigator !== "undefined" && navigator.language
        ? [navigator.language]
        : []);
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
  try {
    // 1. Check localStorage first (user's explicit choice persists)
    const saved = safeGetItem(STORAGE_KEY);
    if (saved === "ar" || saved === "fr" || saved === "en") {
      return saved;
    }
    // 2. Auto-detect from browser language
    return detectBrowserLanguage();
  } catch {
    return "ar";
  }
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  t: (ar) => ar,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => getInitialLanguage());

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    safeSetItem(STORAGE_KEY, lang);
    // Update document direction
    try {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    } catch {
      // SSR or restricted environment
    }
  };

  useEffect(() => {
    try {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
      // Persist initial detected language so future visits remember it
      if (!safeGetItem(STORAGE_KEY)) {
        safeSetItem(STORAGE_KEY, language);
      }
    } catch {
      // Silently fail
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
