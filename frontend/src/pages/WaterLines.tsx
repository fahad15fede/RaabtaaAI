import React, { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { api, CivicService } from '../services/api';
import { ServiceCard } from '../components/ServiceCard';
import { LocationHeader } from '../components/LocationHeader';
import { Pipette, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WaterLines: React.FC = () => {
  const { location } = useLocation();
  const [lines, setLines] = useState<CivicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLines() {
      setLoading(true);
      try {
        const data = await api.getServices({
          category: 'water_connections',
          latitude: location.latitude,
          longitude: location.longitude
        });
        setLines(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLines();
  }, [location]);

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="bg-gradient-to-r from-cyan-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-cyan-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold border border-cyan-400/30">
            <Pipette className="w-4 h-4 text-cyan-300" /> Karachi Water & Sewerage Corporation (KWSC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Water Line & Connection Services</h1>
          <p className="text-xs sm:text-sm text-cyan-100 max-w-2xl leading-relaxed">
            Apply for new residential water main connections, water meter testing, and pipeline repairs. Official document requirements and step-by-step procedures are verified directly from KWSC guidelines.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Available Water Line Connection Services ({lines.length})</h2>
          <Link to="/report?category=water_supply" className="text-xs font-bold text-[#006600] hover:underline flex items-center gap-1">
            Having a problem with water supply? Report a Problem →
          </Link>
        </div>

        {loading ? (
          <div className="civic-card p-12 text-center text-xs text-gray-400">Loading water connection services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lines.map((item) => (
              <ServiceCard key={item.id} service={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
