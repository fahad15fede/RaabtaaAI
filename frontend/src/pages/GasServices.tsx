import React, { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { api, CivicService } from '../services/api';
import { ServiceCard } from '../components/ServiceCard';
import { LocationHeader } from '../components/LocationHeader';
import { Flame, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GasServices: React.FC = () => {
  const { location } = useLocation();
  const [gasServices, setGasServices] = useState<CivicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGas() {
      setLoading(true);
      try {
        const data = await api.getServices({
          category: 'gas_services',
          latitude: location.latitude,
          longitude: location.longitude
        });
        setGasServices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGas();
  }, [location]);

  return (
    <div className="space-y-6 pb-20">
      <LocationHeader />

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="bg-gradient-to-r from-amber-900 to-orange-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-amber-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold border border-amber-400/30">
            <Flame className="w-4 h-4 text-amber-300" /> Sui Southern Gas Company (SSGC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Domestic Gas Services</h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
            Official Sui Southern Gas Company (SSGC) domestic gas connection procedures, required documents, and meter information. Official connection fees are subject to SSGC tariff schedules.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">SSGC Gas Services ({gasServices.length})</h2>
          <Link to="/services" className="text-xs font-bold text-[#006600] hover:underline">All Services Directory →</Link>
        </div>

        {loading ? (
          <div className="civic-card p-12 text-center text-xs text-gray-400">Loading SSGC gas services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gasServices.map((item) => (
              <ServiceCard key={item.id} service={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
