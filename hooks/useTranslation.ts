import { useCallback } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);
  
  return { t, language };
}