import React, { useState } from 'react';
import { CivicService, api } from '../services/api';
import { ShieldCheck, Phone, ExternalLink, Bookmark, Check, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const ServiceCard: React.FC<{ service: CivicService; isSaved?: boolean; onSavedChange?: () => void }> = ({
  service,
  isSaved = false,
  onSavedChange
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      if (saved) {
        await api.removeSavedService(service.id);
        setSaved(false);
        toast.info('Removed from saved services');
      } else {
        await api.saveService(service.id);
        setSaved(true);
        toast.success('Saved to your profile!');
      }
      if (onSavedChange) onSavedChange();
    } catch {
      toast.error('Failed to update saved services');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="civic-card p-5 bg-white space-y-4 hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#006600] border border-emerald-200 mb-1.5">
              {service.service_type.replace('_', ' ')}
            </span>
            <h3 className="font-bold text-sm text-gray-900 leading-snug">{service.title}</h3>
            {service.authority_name && (
              <p className="text-xs text-gray-500 font-medium mt-0.5">{service.authority_name}</p>
            )}
          </div>

          <button
            onClick={toggleSave}
            disabled={saving}
            className={`p-2 rounded-xl transition border ${
              saved
                ? 'bg-emerald-100 text-[#006600] border-emerald-300'
                : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
            }`}
            title={saved ? 'Saved' : 'Save Service'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>

        {/* Pricing block adhering to strict rules */}
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-400">Price / Charges</div>
            {service.price_verified && service.price_amount !== null ? (
              <div className="font-extrabold text-sm text-emerald-900">
                {service.price_currency} {service.price_amount.toLocaleString()} <span className="text-xs font-normal text-gray-500">({service.price_unit})</span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-700">
                Price currently unavailable.
              </div>
            )}
          </div>

          {service.price_verified ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-[#006600]">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">Unverified Rate</span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
          {service.distance_km !== undefined && (
            <span>📍 {service.distance_km} km away</span>
          )}
          {service.processing_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" /> {service.processing_time}
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold">
        {service.contact_phone && (
          <a
            href={`tel:${service.contact_phone}`}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 text-[#006600] border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1.5 transition text-center"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        )}

        <Link
          to={`/services/${service.id}`}
          className="flex-1 py-2 px-3 rounded-xl bg-[#006600] text-white hover:bg-[#01411C] flex items-center justify-center gap-1.5 transition text-center"
        >
          View Details <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
