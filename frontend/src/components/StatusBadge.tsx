import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Send, AlertTriangle, XCircle, CheckCircle2, Copy } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  switch (status) {
    case 'sent':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
          <Send className="w-3 h-3 text-emerald-600" />
          {t('status.sent')}
        </span>
      );
    case 'ready':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <Clock className="w-3 h-3 text-blue-600" />
          {t('status.ready')}
        </span>
      );
    case 'email_pending':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 ${className}`}>
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {t('status.email_pending')}
        </span>
      );
    case 'email_failed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}>
          <XCircle className="w-3 h-3 text-red-600" />
          {t('status.email_failed')}
        </span>
      );
    case 'duplicate':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 ${className}`}>
          <Copy className="w-3 h-3 text-purple-600" />
          {t('status.duplicate')}
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-900 border border-green-300 ${className}`}>
          <CheckCircle2 className="w-3 h-3 text-green-700" />
          {t('status.resolved')}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
          <Clock className="w-3 h-3 text-gray-500" />
          {t('status.analyzing')}
        </span>
      );
  }
};
