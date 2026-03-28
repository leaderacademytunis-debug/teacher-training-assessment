/**
 * Centralized i18n system for Leader Academy
 * Loads translations from JSON files and provides a type-safe hook
 * 
 * Usage:
 *   const { t, lang, isRTL, dir } = useI18n();
 *   t('common.save')       // → "حفظ" | "Enregistrer" | "Save"
 *   t('landing.heroTitle') // → localized hero title
 */

import arTranslations from './ar.json';
import frTranslations from './fr.json';
import enTranslations from './en.json';
import { useLanguage, type AppLanguage } from '@/contexts/LanguageContext';

// ─── Type helpers ────────────────────────────────────────────────
type NestedKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeys<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeys<typeof arTranslations>;

// ─── Translation maps ────────────────────────────────────────────
const translations: Record<AppLanguage, Record<string, any>> = {
  ar: arTranslations,
  fr: frTranslations,
  en: enTranslations,
};

/**
 * Resolve a dotted key like "common.save" from a nested object
 */
function resolve(obj: Record<string, any>, path: string): string {
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = current[part];
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Get a translation by key for a specific language (standalone, no hook)
 */
export function getTranslation(lang: AppLanguage, key: string): string {
  return resolve(translations[lang] ?? translations.ar, key);
}

/**
 * Get the AI system instruction for the given language
 */
export function getAILanguageInstruction(lang: AppLanguage): string {
  const instructions: Record<AppLanguage, string> = {
    ar: 'Strictly generate the script and all text in Arabic. أجب بالكامل باللغة العربية.',
    fr: 'Générer le script et tout le texte strictement en Français. Répondez entièrement en français.',
    en: 'Strictly generate the script and all text in English. Respond entirely in English.',
  };
  return instructions[lang] || instructions.ar;
}

/**
 * Get the language display name
 */
export function getLanguageDisplayName(lang: AppLanguage): string {
  const names: Record<AppLanguage, string> = {
    ar: 'العربية',
    fr: 'Français',
    en: 'English',
  };
  return names[lang] || names.ar;
}

/**
 * Language metadata for the switcher
 */
export const LANGUAGE_OPTIONS: { code: AppLanguage; label: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', label: 'العربية', flag: '🇹🇳', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
];

// ─── React Hook ──────────────────────────────────────────────────
export function useI18n() {
  const { language, setLanguage, t: legacyT } = useLanguage();

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' as const : 'ltr' as const;

  /**
   * Translate a dotted key: t('common.save')
   * Falls back to the key itself if not found
   */
  function t(key: string): string {
    return resolve(translations[language] ?? translations.ar, key);
  }

  /**
   * Legacy t() that takes 3 args: t3('عربي', 'français', 'english')
   * Kept for backward compatibility with existing pages
   */
  const t3 = legacyT;

  return {
    t,
    t3,
    lang: language,
    setLang: setLanguage,
    isRTL,
    dir,
    language,
  };
}

export default useI18n;
