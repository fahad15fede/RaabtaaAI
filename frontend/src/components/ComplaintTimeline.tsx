import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ComplaintEvent } from '../types';
import { format, parseISO } from 'date-fns';

interface ComplaintTimelineProps {
  events: ComplaintEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  const { t } = useTranslation();

  return (
    <div className="civic-card p-5 space-y-4">
      <h4 className="font-bold text-sm text-[#1F2937] flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#006600]" />
        {t('details.timeline_title')}
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
        {events.map((ev, idx) => {
          let timeStr = '';
          try {
            timeStr = format(parseISO(ev.created_at), 'hh:mm a');
          } catch (e) {
            timeStr = '';
          }

          const isFailure = ev.event_type === 'email_failed';

          return (
            <div key={ev.id || idx} className="relative group">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 ${
                  isFailure
                    ? 'border-red-500 text-red-500'
                    : 'border-[#006600] text-[#006600]'
                }`}
              >
                {isFailure ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 fill-current" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#1F2937] group-hover:text-[#006600] transition-colors">
                  {ev.message}
                </p>
                {timeStr && (
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {timeStr}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
