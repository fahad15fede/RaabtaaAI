import React, { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { api, CivicService } from '../services/api';
import { ServiceCard } from '../components/ServiceCard';
import { LocationHeader } from '../components/LocationHeader';
import { Grid, Search, Filter, Droplets, Flame, Pipette, Layers, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServicesList: React.FC = () => {
  const { location } = useLocation();
  const [services, setServices] = useState<CivicService[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<string>('nearest');

  const loadServices = async () => {
    setLoading(true);
    try {
      const [data, saved] = await Promise.all([
        api.getServices({
          category: selectedCategory,
          search: search,
          latitude: location.latitude,
          longitude: location.longitude,
          sort: sort
        }),
        api.getSavedServices().catch(() => [])
      ]);
      setServices(data);
      setSavedIds(saved.map(s => s.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [location, selectedCategory, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadServices();
  };

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-2">
              <Grid className="w-6 h-6 text-[#006600]" />
              Civic Services Directory
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Find verified government & municipal service information, water tankers, pipeline connections, and gas services near {location.area}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/services/water-tankers"
              className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 hover:bg-blue-100 flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600" /> Water Tankers
            </Link>
            <Link
              to="/services/gas"
              className="py-2 px-3 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 hover:bg-amber-100 flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" /> Gas Services
            </Link>
          </div>
        </div>

        {/* Search and Category Filter Bar */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search water tanker, water connection, gas line, sewerage..."
              className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm rounded-2xl border border-gray-200 focus:border-[#006600] focus:ring-1 focus:ring-[#006600] outline-none bg-white shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-[#006600] text-white font-bold text-xs rounded-xl hover:bg-[#01411C] transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              {['all', 'water_tankers', 'water_connections', 'gas_services', 'sewerage_services', 'waste_management'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-bold transition text-xs capitalize whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#006600] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 font-semibold text-gray-800 text-xs outline-none"
              >
                <option value="nearest">Sort: Nearest</option>
                <option value="price_low">Sort: Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="civic-card p-12 text-center text-xs text-gray-400">Loading civic services near {location.area}...</div>
        ) : services.length === 0 ? (
          <div className="civic-card p-12 text-center space-y-2 bg-white">
            <p className="font-bold text-sm text-gray-700">No services found matching your filter.</p>
            <p className="text-xs text-gray-400">Try searching for "Water" or "Gas" or resetting category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((serv) => (
              <ServiceCard
                key={serv.id}
                service={serv}
                isSaved={savedIds.includes(serv.id)}
                onSavedChange={loadServices}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
