import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg border border-[#E5E7EB] text-xs font-semibold">
      <div className="flex items-center gap-1.5 px-2 text-gray-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => toggleLanguage('en')}
        className={`px-3 py-1.5 rounded-md transition-all ${
          currentLang === 'en'
            ? 'bg-white text-[#006600] shadow-sm font-bold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage('ur')}
        className={`px-3 py-1.5 rounded-md font-urdu transition-all text-sm ${
          currentLang === 'ur'
            ? 'bg-[#006600] text-white shadow-sm font-bold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="اردو میں تبدیل کریں"
      >
        اردو
      </button>
    </div>
  );
};
