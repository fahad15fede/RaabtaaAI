import React from 'react';
import { AlertTriangle, MapPin, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HotspotInfo {
  area: string;
  report_count: number;
  active_complaints: number;
  categories: string[];
}

export const HotspotBanner: React.FC<{ hotspot: HotspotInfo }> = ({ hotspot }) => {
  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/15 rounded-xl text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs tracking-wider uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
              ⚠ Civic Hotspot
            </span>
            <span className="font-bold text-sm text-gray-900">{hotspot.area}</span>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            <strong>{hotspot.report_count} reports</strong> across {hotspot.active_complaints} active civic complaints in this area ({hotspot.categories.map(c => c.replace('_', ' ')).join(', ')}).
          </p>
        </div>
      </div>

      <Link
        to="/nearby"
        className="shrink-0 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-end sm:self-auto shadow-xs"
      >
        <MapPin className="w-3.5 h-3.5" /> View Nearby Issues
      </Link>
    </div>
  );
};
