import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api, NearbyProblem, CivicService } from '../services/api';
import { ComplaintDetail } from '../types';
import { LocationHeader } from '../components/LocationHeader';
import { ComplaintCard } from '../components/ComplaintCard';
import { ServiceCard } from '../components/ServiceCard';
import {
  PlusCircle,
  Grid,
  MapPin,
  FileText,
  Bookmark,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [nearbyProblems, setNearbyProblems] = useState<NearbyProblem[]>([]);
  const [myComplaints, setMyComplaints] = useState<ComplaintDetail[]>([]);
  const [savedServices, setSavedServices] = useState<CivicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [probs, comps, saved] = await Promise.all([
          api.getNearbyProblems({ latitude: location.latitude, longitude: location.longitude, radius: 2000 }),
          api.getMyComplaints().catch(() => []),
          api.getSavedServices().catch(() => [])
        ]);
        setNearbyProblems(probs.slice(0, 3));
        setMyComplaints(comps);
        setSavedServices(saved.slice(0, 3));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [location]);

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Welcome Header & Primary CTAs */}
        <div className="civic-card p-6 sm:p-8 bg-gradient-to-r from-[#01411C] via-[#006600] to-[#01411C] text-white space-y-6 shadow-sm border-0 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Karachi Citizen Portal</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Karachi Citizen'}
              </h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 pt-1 font-medium">
                <MapPin className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                Active Civic Location: <strong>{location.area}</strong>
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/report"
                className="py-3 px-5 rounded-xl bg-white text-[#006600] font-extrabold text-xs sm:text-sm hover:bg-emerald-50 transition shadow-md flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-[#006600]" />
                Report a Problem
              </Link>
              <Link
                to="/nearby"
                className="py-3 px-4 rounded-xl bg-emerald-800/80 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition border border-emerald-600/50 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4" />
                Problems Near Me
              </Link>
              <Link
                to="/services"
                className="py-3 px-4 rounded-xl bg-emerald-800/80 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition border border-emerald-600/50 flex items-center gap-1.5"
              >
                <Grid className="w-4 h-4" />
                Civic Services
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 1: What is happening around me? (Nearby Problems within 2km) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#006600]" />
              Problems Near You ({location.area} • 2 km Radius)
            </h2>
            <Link to="/nearby" className="text-xs font-bold text-[#006600] hover:underline flex items-center gap-1">
              View Nearby Problems <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="civic-card p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Scanning nearby civic problems within 2000m...
            </div>
          ) : nearbyProblems.length === 0 ? (
            <div className="civic-card p-6 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-100">
              No reported civic problems within 2 km of {location.area}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nearbyProblems.map((p) => (
                <div key={p.id} className="civic-card p-4 bg-white space-y-2.5 flex flex-col justify-between shadow-xs rounded-2xl border border-gray-100 hover:border-emerald-300 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 uppercase">
                        {p.category.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-[#006600] text-[11px]">
                        📍 {p.distance_m || Math.round(p.distance_km * 1000)}m away
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-2">{p.description}</h4>
                  </div>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 font-semibold">Authority: {p.authority?.short_name || p.authority?.name}</span>
                    <Link to="/nearby" className="font-extrabold text-[#006600]">View Problem →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: What have I reported? (My Recent Complaints) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#006600]" />
              My Recent Complaints ({myComplaints.length})
            </h2>
            <Link to="/complaints" className="text-xs font-bold text-[#006600] hover:underline flex items-center gap-1">
              View My Complaints <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="civic-card p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
              Loading your recent complaints...
            </div>
          ) : myComplaints.length === 0 ? (
            <div className="civic-card p-8 text-center space-y-3 bg-white rounded-2xl border border-gray-100">
              <p className="font-bold text-sm text-gray-700">You haven't submitted any civic complaints yet.</p>
              <Link to="/report" className="civic-btn-primary inline-flex py-2.5 px-5 text-xs font-bold shadow-xs">
                Report a Problem Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myComplaints.slice(0, 4).map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: Civic Services Near You */}
        {savedServices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#1F2937] flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#006600]" />
                Saved Civic Services ({savedServices.length})
              </h2>
              <Link to="/services" className="text-xs font-bold text-[#006600] hover:underline">
                Explore Services Directory →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedServices.map((serv) => (
                <ServiceCard key={serv.id} service={serv} isSaved={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
