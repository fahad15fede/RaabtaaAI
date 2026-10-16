import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, CivicService } from '../services/api';
import { LocationHeader } from '../components/LocationHeader';
import {
  ShieldCheck,
  Phone,
  ExternalLink,
  Bookmark,
  CheckCircle,
  Clock,
  FileText,
  ListOrdered,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<CivicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!id) return;
      setLoading(true);
      try {
        const [data, savedList] = await Promise.all([
          api.getServiceDetail(id),
          api.getSavedServices().catch(() => [])
        ]);
        setService(data);
        setSaved(savedList.some(s => s.id === data.id));
      } catch (err: any) {
        toast.error(err.message || 'Service not found');
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const toggleSave = async () => {
    if (!service) return;
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
    } catch {
      toast.error('Failed to update saved services');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <LocationHeader />
        <div className="max-w-4xl mx-auto px-4 text-center py-16 text-xs text-gray-400">Loading service information...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6 pb-20">
        <LocationHeader />
        <div className="max-w-4xl mx-auto px-4 text-center py-16 space-y-4">
          <p className="font-bold text-base text-gray-800">Civic service information not found.</p>
          <Link to="/services" className="civic-btn-primary inline-flex py-2 px-4 text-xs">Return to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <Link to="/services" className="inline-flex items-center gap-1 text-xs font-bold text-[#006600] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Services Directory
        </Link>

        {/* Header Banner */}
        <div className="civic-card p-6 sm:p-8 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-[#006600] border border-emerald-200">
                  {service.service_type.replace('_', ' ')}
                </span>
                {service.price_verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" /> Verified Service Record
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{service.title}</h1>
              {service.authority_name && (
                <p className="text-xs text-gray-500 font-semibold">Responsible Authority: {service.authority_name}</p>
              )}
            </div>

            <button
              onClick={toggleSave}
              className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition border ${
                saved
                  ? 'bg-emerald-100 text-[#006600] border-emerald-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Saved in Profile' : 'Save Service'}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{service.description}</p>

          {/* Pricing Box adhering strictly to data rule */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider">Official Fee / Charges</div>
              {service.price_verified && service.price_amount !== null ? (
                <div className="text-lg font-extrabold text-[#006600]">
                  {service.price_currency} {service.price_amount.toLocaleString()} <span className="text-xs font-semibold text-gray-600">({service.price_unit})</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-amber-800 mt-0.5">
                  Current cost unavailable. Contact the provider for the latest applicable charges.
                </div>
              )}
            </div>

            <div className="text-[11px] text-gray-500 space-y-0.5">
              {service.processing_time && <div>⏱ Expected Processing: <strong>{service.processing_time}</strong></div>}
              {service.last_verified_at && <div>📅 Last Verified: <strong>{new Date(service.last_verified_at).toLocaleDateString()}</strong></div>}
            </div>
          </div>
        </div>

        {/* Requirements & Step-by-Step Procedure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Documents */}
          <div className="civic-card p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-5 h-5 text-[#006600]" />
              <h3 className="font-bold text-sm text-gray-900">Required Documents</h3>
            </div>
            {service.required_documents && service.required_documents.length > 0 ? (
              <ul className="space-y-2 text-xs text-gray-700">
                {service.required_documents.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#006600] shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">Document checklist currently unavailable.</p>
            )}
          </div>

          {/* Procedure Steps */}
          <div className="civic-card p-6 bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <ListOrdered className="w-5 h-5 text-[#006600]" />
              <h3 className="font-bold text-sm text-gray-900">Official Application Procedure</h3>
            </div>
            {service.procedure_steps && service.procedure_steps.length > 0 ? (
              <ol className="space-y-3 text-xs text-gray-700 list-decimal list-inside">
                {service.procedure_steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    <span className="font-semibold text-gray-900">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-gray-400">Procedure steps currently unavailable.</p>
            )}
          </div>
        </div>

        {/* Official Contact & Actions */}
        <div className="civic-card p-6 bg-white space-y-4">
          <h3 className="font-bold text-sm text-gray-900">Official Contacts & Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {service.contact_phone && (
              <a
                href={`tel:${service.contact_phone}`}
                className="py-3 px-4 rounded-xl bg-emerald-50 text-[#006600] border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Phone className="w-4 h-4" /> Call {service.contact_phone}
              </a>
            )}

            {service.source_url && (
              <a
                href={service.source_url}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" /> Official Website
              </a>
            )}

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="py-3 px-4 rounded-xl bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>
          </div>
        </div>

        {/* CROSS-LINKING TO COMPLAINT FLOW */}
        <div className="bg-gradient-to-r from-emerald-900 to-[#01411C] text-white p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-base">Having a problem with this civic service?</h4>
            <p className="text-xs text-emerald-100">Report sewage overflow, pipe leakage, low water pressure, or billing disputes directly to authorities.</p>
          </div>

          <Link
            to="/report"
            className="py-3 px-6 rounded-2xl bg-white text-[#006600] font-extrabold text-xs hover:bg-emerald-50 transition shrink-0 shadow-sm"
          >
            Report a Problem →
          </Link>
        </div>
      </div>
    </div>
  );
};
