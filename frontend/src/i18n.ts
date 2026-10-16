import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import urTranslation from './locales/ur.json';

const savedLanguage = localStorage.getItem('cwa_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      ur: { translation: urTranslation }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document direction
export const applyLanguageDirection = (lang: string) => {
  const dir = lang === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  localStorage.setItem('cwa_language', lang);
};

// Initial setup
applyLanguageDirection(savedLanguage);

i18n.on('languageChanged', (lng) => {
  applyLanguageDirection(lng);
});

export default i18n;
