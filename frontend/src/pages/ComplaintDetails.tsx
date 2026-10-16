import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { ComplaintDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintTimeline } from '../components/ComplaintTimeline';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import L from 'leaflet';

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'ur'>('en');
  const [copied, setCopied] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      const res = await api.getComplaint(id);
      setComplaint(res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (!complaint || !mapContainerRef.current) return;
    const lat = complaint.location.latitude;
    const lon = complaint.location.longitude;
    if (!lat || !lon) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 14,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lon]).addTo(map).bindPopup(complaint.location.address).openPopup();
      mapRef.current = map;
    }
  }, [complaint]);

  const handleRetryEmail = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      const res = await api.retryEmail(id);
      toast.success(res.message);
      loadData();
    } catch (e) {
      toast.error('Retry failed.');
    } finally {
      setRetrying(false);
    }
  };

  const handleCopy = () => {
    if (!complaint) return;
    const txt = activeTab === 'en' ? complaint.english_complaint : complaint.urdu_complaint;
    if (txt) {
      navigator.clipboard.writeText(txt);
      setCopied(true);
      toast.success('Complaint copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#006600] mx-auto" />
        <p className="text-xs text-gray-500">Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h3 className="font-bold text-lg text-gray-800">Complaint Not Found</h3>
        <Link to="/complaints" className="civic-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>
      </div>
    );
  }

  let formattedDate = complaint.created_at;
  try {
    formattedDate = format(parseISO(complaint.created_at), 'MMMM dd, yyyy • hh:mm a');
  } catch (e) {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/complaints"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006600] hover:text-[#01411C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Complaints
      </Link>

      {/* Top Banner with Reference & Status */}
      <div className="civic-card p-6 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-[#006600] uppercase tracking-wider block mb-1">
              Reference Identifier
            </span>
            <h2 className="text-xl sm:text-2xl font-mono font-extrabold text-[#1F2937]">
              {complaint.reference_id}
            </h2>
          </div>
          <StatusBadge status={complaint.status} className="text-sm px-3 py-1" />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">Category:</span>
            <span className="font-bold text-gray-900">{complaint.category.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">Input Mode:</span>
            <span className="capitalize font-medium text-gray-900">{complaint.input_type}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Location & Map Card */}
          <div className="civic-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <MapPin className="w-4 h-4 text-[#006600]" />
              <span>Location Information</span>
            </div>
            <p className="text-sm font-semibold text-[#1F2937]">
              {complaint.location.address}
            </p>
            <div
              ref={mapContainerRef}
              className="w-full h-48 rounded-lg overflow-hidden border border-[#E5E7EB] shadow-inner z-0"
            />
          </div>

          {/* Original Citizen Input Evidence Card */}
          <div className="civic-card p-5 space-y-3">
            <h4 className="font-bold text-sm text-[#1F2937]">
              {t('details.original_input')}
            </h4>
            {complaint.original_text && (
              <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3.5 rounded-lg border border-gray-200 italic">
                "{complaint.original_text}"
              </p>
            )}
            {complaint.image_url && (
              <div className="rounded-lg overflow-hidden border border-gray-200 max-h-72 bg-black/5 flex items-center justify-center">
                <img src={complaint.image_url} alt="Civic issue evidence" className="max-h-72 object-contain" />
              </div>
            )}
            {complaint.audio_url && (
              <audio controls src={complaint.audio_url} className="w-full mt-2" />
            )}
          </div>

          {/* Generated Complaints */}
          <div className="civic-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeTab === 'en' ? 'bg-[#006600] text-white' : 'text-gray-600'
                  }`}
                >
                  English (Official Email)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ur')}
                  className={`px-3 py-1 text-xs font-semibold font-urdu rounded-md transition-all ${
                    activeTab === 'ur' ? 'bg-[#006600] text-white' : 'text-gray-600'
                  }`}
                >
                  اردو (شہری)
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>

            <div
              dir={activeTab === 'ur' ? 'rtl' : 'ltr'}
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto"
            >
              {activeTab === 'en' ? complaint.english_complaint : complaint.urdu_complaint}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Authority & Timeline */}
        <div className="space-y-6">
          {/* Authority Contact Card */}
          <div className="civic-card p-5 space-y-4 bg-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
              <Building2 className="w-4 h-4 text-[#006600]" />
              <span>{t('details.authority_contact')}</span>
            </div>

            <div>
              <h4 className="font-bold text-base text-[#006600]">
                {complaint.authority.name}
              </h4>
              <span className="text-xs text-gray-400 font-semibold block">
                {complaint.authority.short_name}
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-700 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-mono">
                  {complaint.authority.email || t('details.not_configured')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{complaint.authority.phone || t('details.not_configured')}</span>
              </div>
            </div>

            {/* If Email failed, offer retry */}
            {complaint.status === 'email_failed' && (
              <button
                type="button"
                onClick={handleRetryEmail}
                disabled={retrying}
                className="civic-btn-primary w-full text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Retrying...' : t('details.retry_button')}
              </button>
            )}
          </div>

          {/* Timeline */}
          <ComplaintTimeline events={complaint.events || []} />
        </div>
      </div>
    </div>
  );
};
