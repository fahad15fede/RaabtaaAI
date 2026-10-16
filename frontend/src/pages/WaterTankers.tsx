import React, { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { api, CivicService } from '../services/api';
import { ServiceCard } from '../components/ServiceCard';
import { LocationHeader } from '../components/LocationHeader';
import { Droplets, ShieldCheck, Phone, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WaterTankers: React.FC = () => {
  const { location } = useLocation();
  const [tankers, setTankers] = useState<CivicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTankers() {
      setLoading(true);
      try {
        const data = await api.getServices({
          category: 'water_tankers',
          latitude: location.latitude,
          longitude: location.longitude
        });
        setTankers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTankers();
  }, [location]);

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-blue-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
            <Droplets className="w-4 h-4 text-blue-300" /> Official KWSC & Emergency Water Supply
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Water Tanker Services</h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
            Discover verified water tanker services operating near <strong>{location.area}</strong>. Prices are verified against KWSC official hydrant challan rates. Unverified rates will state "Price currently unavailable".
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Nearby Tanker Hydrants & Providers ({tankers.length})</h2>
          <Link to="/services" className="text-xs font-bold text-[#006600] hover:underline">All Services Directory →</Link>
        </div>

        {loading ? (
          <div className="civic-card p-12 text-center text-xs text-gray-400">Loading water tanker providers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tankers.map((t) => (
              <ServiceCard key={t.id} service={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
