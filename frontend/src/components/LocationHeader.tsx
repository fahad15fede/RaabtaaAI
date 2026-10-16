import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Check, Compass } from 'lucide-react';
import { useLocation, KARACHI_PRESET_LOCATIONS, CivicLocation } from '../context/LocationContext';

export const LocationHeader: React.FC = () => {
  const { location, setLocation, requestGPS } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (preset: CivicLocation) => {
    setLocation(preset);
    setIsOpen(false);
  };

  const handleGPSClick = async () => {
    await requestGPS();
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-[#01411C] via-[#006600] to-[#01411C] text-white py-3 px-4 shadow-sm border-b border-emerald-900/40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="opacity-75 uppercase tracking-wider text-[10px] font-bold text-emerald-200">Your Civic Area</span>
          <div className="h-3 w-px bg-emerald-600/60" />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full transition text-emerald-50 font-semibold border border-white/15"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>{location.area}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-emerald-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <button
          onClick={handleGPSClick}
          className="hidden sm:flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-700/80 px-2.5 py-1 rounded-md text-[11px] font-medium transition border border-emerald-600/50 text-emerald-100"
        >
          <Navigation className="w-3 h-3 text-emerald-300" />
          <span>Use GPS</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#006600]" />
                <h3 className="font-bold text-base text-gray-900">Select Civic Location</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            </div>

            <p className="text-xs text-gray-500">
              Select your neighborhood in Karachi to discover nearby civic issues, active hotspots, and local government services.
            </p>

            <button
              onClick={handleGPSClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 text-[#006600] font-semibold text-xs border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <Navigation className="w-4 h-4" />
              Detect Current GPS Location
            </button>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block px-1">Karachi Neighborhood Presets</span>
              {KARACHI_PRESET_LOCATIONS.map((preset) => {
                const isSelected = location.area === preset.area;
                return (
                  <button
                    key={preset.area}
                    onClick={() => handleSelect(preset)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition ${
                      isSelected
                        ? 'bg-[#006600] text-white font-semibold shadow-sm'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-200' : 'text-gray-400'}`} />
                      <div>
                        <div>{preset.area}</div>
                        {preset.town && <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{preset.town}</div>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-200" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
