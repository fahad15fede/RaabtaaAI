import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Mic,
  FileText,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Droplets,
  Flame,
  Pipette,
  Layers,
  ChevronRight,
  AlertTriangle,
  Grid
} from 'lucide-react';
import { LocationHeader } from '../components/LocationHeader';
import { useLocation } from '../context/LocationContext';
import { api, NearbyProblem, CivicService } from '../services/api';
import { HotspotBanner } from '../components/HotspotBanner';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { location } = useLocation();
  const [nearbyProblems, setNearbyProblems] = useState<NearbyProblem[]>([]);
  const [services, setServices] = useState<CivicService[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLocationData() {
      setLoading(true);
      try {
        const [probs, servs, hspots] = await Promise.all([
          api.getNearbyProblems({ latitude: location.latitude, longitude: location.longitude, radius_km: 10 }),
          api.getServices({ latitude: location.latitude, longitude: location.longitude }),
          api.getNearbyHotspots(location.latitude, location.longitude)
        ]);
        if (isMounted) {
          setNearbyProblems(probs.slice(0, 4));
          setServices(servs.slice(0, 4));
          setHotspots(hspots);
        }
      } catch (err) {
        console.error('Error loading home location data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLocationData();
    return () => { isMounted = false; };
  }, [location]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* Top Location Bar */}
      <LocationHeader />

      {/* Hero Section */}
      <section className="pt-6 sm:pt-10 text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-[#006600] text-xs font-bold border border-emerald-300/60 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#006600]" />
          <span>Location-Aware Civic Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1F2937] tracking-tight leading-tight uppercase">
          THE CITY AROUND YOU
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-[#006600]">
          "Report a problem. We'll find who can fix it."
        </p>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover civic issues reported nearby in <strong>{location.area}</strong>, support existing resident complaints, find verified government & utility services, and dispatch formal reports to responsible authorities.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link to="/report" className="civic-btn-primary w-full sm:w-auto text-base py-3.5 px-8 shadow-md">
            Report a Problem <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link to="/services" className="civic-btn-secondary w-full sm:w-auto text-base py-3.5 px-7">
            <Grid className="w-4 h-4 mr-2" /> Explore Civic Services
          </Link>
        </div>
      </section>

      {/* Hotspot Alert Banner if active */}
      {hotspots.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <HotspotBanner hotspot={hotspots[0]} />
        </section>
      )}

      {/* Input Mode Quick Actions */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/report?mode=photo" className="civic-card p-5 text-center space-y-3 hover:border-[#006600] group bg-white">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E8F5E9] text-[#006600] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2937] group-hover:text-[#006600]">{t('modes.photo')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('modes.photo_desc')}</p>
            </div>
            <span className="text-xs font-bold text-[#006600] inline-flex items-center gap-1">
              Snap photo evidence <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link to="/report?mode=voice" className="civic-card p-5 text-center space-y-3 hover:border-[#006600] group bg-white">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E8F5E9] text-[#006600] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2937] group-hover:text-[#006600]">{t('modes.voice')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('modes.voice_desc')}</p>
            </div>
            <span className="text-xs font-bold text-[#006600] inline-flex items-center gap-1">
              Record voice note <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link to="/report?mode=text" className="civic-card p-5 text-center space-y-3 hover:border-[#006600] group bg-white">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E8F5E9] text-[#006600] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F2937] group-hover:text-[#006600]">{t('modes.text')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('modes.text_desc')}</p>
            </div>
            <span className="text-xs font-bold text-[#006600] inline-flex items-center gap-1">
              Write complaint <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* SECTION: Problems Near You */}
      <section className="max-w-5xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#006600]" />
              Problems Near You
            </h2>
            <p className="text-xs text-gray-500">Active civic complaints near {location.area}</p>
          </div>
          <Link to="/nearby" className="text-xs font-bold text-[#006600] hover:underline flex items-center gap-1">
            View Map & All Nearby Problems <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="civic-card p-8 text-center text-xs text-gray-400">Loading nearby problems...</div>
        ) : nearbyProblems.length === 0 ? (
          <div className="civic-card p-8 text-center space-y-2 bg-white">
            <p className="font-bold text-sm text-gray-700">No active civic problems reported near your area.</p>
            <p className="text-xs text-gray-400">Be the first to report an issue in {location.area}!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyProblems.map((prob) => (
              <div key={prob.id} className="civic-card p-4 bg-white space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 capitalize">
                      {prob.category.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-[#006600]">{prob.distance_m || Math.round(prob.distance_km * 1000)}m away</span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{prob.description}</h4>
                  <p className="text-[11px] text-gray-500">📍 {prob.location?.address || prob.location?.area || 'Karachi'}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-semibold">👥 {prob.report_count} residents affected</span>
                  <Link to="/nearby" className="font-bold text-[#006600] hover:underline">View & Support</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: Civic Services Near You */}
      <section className="max-w-5xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#006600]" />
              Civic Services Near You
            </h2>
            <p className="text-xs text-gray-500">Find verified water tankers, pipeline connections, gas services & municipal utilities</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-[#006600] hover:underline flex items-center gap-1">
            Explore All Services <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/services/water-tankers" className="civic-card p-4 text-center bg-white hover:border-[#006600] space-y-2 group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#006600]">Water Tankers</h4>
            <p className="text-[10px] text-gray-400">Official KWSC Hydrants</p>
          </Link>

          <Link to="/services/water-lines" className="civic-card p-4 text-center bg-white hover:border-[#006600] space-y-2 group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Pipette className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#006600]">Water Connections</h4>
            <p className="text-[10px] text-gray-400">Line & Meter Install</p>
          </Link>

          <Link to="/services/gas" className="civic-card p-4 text-center bg-white hover:border-[#006600] space-y-2 group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#006600]">Gas Services</h4>
            <p className="text-[10px] text-gray-400">SSGC Domestic Lines</p>
          </Link>

          <Link to="/services?category=waste_management" className="civic-card p-4 text-center bg-white hover:border-[#006600] space-y-2 group">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-[#006600] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs text-gray-900 group-hover:text-[#006600]">Waste & Sanitation</h4>
            <p className="text-[10px] text-gray-400">SSWMB Bulk Collection</p>
          </Link>
        </div>
      </section>

      {/* SECTION: How It Works */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="civic-card p-6 sm:p-8 bg-gradient-to-b from-white to-emerald-50/40 space-y-6">
          <div className="text-center space-y-1 max-w-md mx-auto">
            <h3 className="font-bold text-lg sm:text-xl text-[#1F2937]">How The System Works</h3>
            <p className="text-xs text-gray-500">From citizen report to automated jurisdiction resolution and official email dispatch</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1 shadow-xs">
              <span className="text-xl">📷 🎙️</span>
              <h5 className="font-bold text-xs text-[#1F2937]">1. Tell Us</h5>
              <p className="text-[11px] text-gray-500">Photo, voice note, or text report</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1 shadow-xs">
              <span className="text-xl">🧠</span>
              <h5 className="font-bold text-xs text-[#1F2937]">2. AI Understands</h5>
              <p className="text-[11px] text-gray-500">Vision facts & semantic intent</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1 shadow-xs">
              <span className="text-xl">📍</span>
              <h5 className="font-bold text-xs text-[#1F2937]">3. Locate Zone</h5>
              <p className="text-[11px] text-gray-500">GPS, EXIF, or area mapping</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1 shadow-xs">
              <span className="text-xl">🏛️</span>
              <h5 className="font-bold text-xs text-[#1F2937]">4. Route Authority</h5>
              <p className="text-[11px] text-gray-500">KWSC, SSWMB, KMC, CBC</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-1 shadow-xs">
              <span className="text-xl">📧</span>
              <h5 className="font-bold text-xs text-[#1F2937]">5. Dispatch</h5>
              <p className="text-[11px] text-gray-500">Official email sent to authority</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
