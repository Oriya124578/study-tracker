import { useStore } from '../store/useStore';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { language } = useStore();
  
  const t = (key) => {
    // Default to Hebrew if language is missing
    const lang = language || 'he';
    const dict = translations[lang] || translations['he'];
    
    return dict[key] || key; // Return the key itself if translation is missing
  };

  return { t, language };
};
