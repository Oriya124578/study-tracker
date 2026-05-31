import { useStore } from '../store/useStore';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useStore();
  
  const t = (key, fallback) => {
    // Default to Hebrew if language is missing
    const lang = language || 'he';
    const dict = translations[lang] || translations['he'];

    // Use the translation if present; otherwise the provided fallback; otherwise
    // the key itself (so a missing key is at least visible rather than blank).
    if (dict[key] !== undefined) return dict[key];
    return fallback !== undefined ? fallback : key;
  };

  return { t, language };
};
