import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface TextReporterProps {
  value: string;
  onChange: (val: string) => void;
}

export const TextReporter: React.FC<TextReporterProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  const samplePrompts = [
    "North Nazimabad Block H mein 4 din se kachra nahi uthaya gaya.",
    "Severe sewage overflow on Shahrah-e-Faisal near Nursery bridge.",
    "Clifton Block 2 Khayaban-e-Jami streetlights are completely off."
  ];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {t('report.text_title')}
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('report.text_placeholder')}
        className="w-full rounded-xl border border-[#E5E7EB] p-3.5 text-sm text-[#1F2937] placeholder-gray-400 focus:border-[#006600] focus:ring-2 focus:ring-[#006600]/20 transition-all outline-none resize-none shadow-sm"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
        <span className="flex items-center gap-1 text-[11px] text-gray-500">
          <Sparkles className="w-3.5 h-3.5 text-[#006600]" />
          Supports English, Urdu, or Roman Urdu
        </span>
        <span>{value.length} characters</span>
      </div>

      {/* Quick Karachi sample chips */}
      <div className="pt-1">
        <span className="text-[11px] text-gray-400 block mb-1.5 font-medium">Quick examples:</span>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(p)}
              className="text-[11px] bg-gray-100 hover:bg-[#E8F5E9] hover:text-[#006600] text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 transition-colors text-left truncate max-w-[280px]"
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
