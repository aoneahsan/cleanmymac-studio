import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import all locale files
import enLocale from '../locales/en.json';

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ru: { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
  ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
  zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Translations storage
const translations: Record<string, any> = {
  en: enLocale,
};

// Create a Zustand store for language management
interface LanguageState {
  currentLanguage: SupportedLanguage;
  translations: Record<string, any>;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      translations: translations.en,
      setLanguage: async (lang: SupportedLanguage) => {
        // Load translations dynamically
        if (!translations[lang]) {
          try {
            const module = await import(`../locales/${lang}.json`);
            translations[lang] = module.default;
          } catch (error) {
            console.error(`Failed to load ${lang} translations:`, error);
            return;
          }
        }
        
        set({ 
          currentLanguage: lang,
          translations: translations[lang] || translations.en
        });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// Helper function to get nested property from object
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

// Helper function to interpolate variables
function interpolate(str: string, params?: Record<string, any>): string {
  if (!params) return str;
  
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

// Helper function to get translated text
export const t = (key: string, params?: Record<string, any>): string => {
  const { translations } = useLanguageStore.getState();
  const value = getNestedProperty(translations, key);
  
  if (typeof value === 'string') {
    return interpolate(value, params);
  }
  
  // Return key if translation not found
  return key;
};

// Helper function to get pluralized text
export const tn = (singular: string, plural: string, count: number, params?: Record<string, any>): string => {
  const key = count === 1 ? singular : plural;
  return t(key, { count, ...params });
};

// React hook for translations
export const useTranslation = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  
  return {
    t,
    tn,
    currentLanguage,
    setLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
};