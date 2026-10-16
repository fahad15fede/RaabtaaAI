import React, { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { api, NearbyProblem } from '../services/api';
import { ProblemMap } from '../components/ProblemMap';
import { LocationHeader } from '../components/LocationHeader';
import { MapPin, List, Map as MapIcon, Filter, ArrowUpDown, Shield, ThumbsUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const NearbyProblems: React.FC = () => {
  const { location } = useLocation();
  const [problems, setProblems] = useState<NearbyProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [category, setCategory] = useState<string>('all');
  const [sort, setSort] = useState<string>('nearest');

  const loadProblems = async () => {
    setLoading(true);
    try {
      const data = await api.getNearbyProblems({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 2000,
        category: category,
        sort: sort
      });
      setProblems(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load nearby problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [location, category, sort]);

  const handleSupport = async (id: string) => {
    try {
      const res = await api.supportComplaint(id);
      toast.success(res.message || 'Thank you for supporting this report!');
      loadProblems();
    } catch (err: any) {
      toast.error(err.message || 'Could not support report');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#006600]" />
              Problems Near {location.area} (2000m Radius)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Geographically verified public civic problems reported within 2 km of your selected location. Private reporter information is strictly omitted.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'list' ? 'bg-white text-[#006600] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'map' ? 'bg-white text-[#006600] shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapIcon className="w-4 h-4" /> Map View
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-700">Category:</span>
            {['all', 'garbage', 'water_supply', 'sewage', 'road_damage', 'street_lighting'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full font-semibold transition text-[11px] capitalize ${
                  category === cat
                    ? 'bg-[#006600] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-gray-700">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 font-semibold text-gray-800 outline-none focus:border-[#006600]"
            >
              <option value="nearest">Nearest</option>
              <option value="newest">Newest</option>
              <option value="most_reported">Most Reported</option>
              <option value="most_severe">Most Severe</option>
            </select>
          </div>
        </div>

        {/* View Content */}
        {viewMode === 'map' ? (
          <div className="space-y-4">
            <ProblemMap
              centerLat={location.latitude}
              centerLng={location.longitude}
              problems={problems}
              onSupportSuccess={loadProblems}
            />
            <p className="text-center text-xs text-gray-400">
              💡 Click any marker on the map to inspect the problem summary and support the report.
            </p>
          </div>
        ) : loading ? (
          <div className="civic-card p-12 text-center text-xs text-gray-400">
            Scanning nearby civic complaints in {location.area}...
          </div>
        ) : problems.length === 0 ? (
          <div className="civic-card p-12 text-center space-y-3 bg-white">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="font-bold text-base text-gray-800">No civic problems reported near you.</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              There are no active complaint records within 15 km of {location.area}. If you noticed an issue, report it now!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p) => {
              const timeAgo = p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true }) : 'Recently';
              return (
                <div key={p.id} className="civic-card p-5 bg-white space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200">
                        {p.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-[#006600]">
                        📍 {p.distance_m || Math.round(p.distance_km * 1000)}m away
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{p.description}</h3>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="line-clamp-1">📍 {p.location?.address || p.location?.area || 'Karachi'}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span>Reported {timeAgo}</span>
                        <span className="font-semibold text-gray-700 capitalize">Severity: {p.severity}</span>
                      </div>
                    </div>

                    {p.authority?.name && (
                      <div className="p-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-600 flex items-center justify-between border border-gray-100">
                        <span>Authority: <strong>{p.authority.short_name || p.authority.name}</strong></span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#006600] font-bold uppercase text-[9px]">{p.status}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-emerald-800">
                      👥 {p.report_count} residents affected
                    </span>

                    <button
                      onClick={() => handleSupport(p.id)}
                      className="py-1.5 px-3 rounded-xl bg-[#006600] text-white hover:bg-[#01411C] text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Support Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
