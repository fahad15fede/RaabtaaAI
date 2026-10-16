import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet's default icon URLs when bundled by Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  areaText?: string;
  onLocationChange: (lat: number, lon: number, source: string, addressDesc?: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  areaText,
  onLocationChange
}) => {
  const { t } = useTranslation();
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showMap, setShowMap] = useState<boolean>(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = latitude || 24.8607;
  const defaultLon = longitude || 67.0011;

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLon],
        zoom: 13,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([defaultLat, defaultLon], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng, 'map', 'Manually pinned on map');
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng, 'map', 'Manually pinned on map');
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      if (latitude && longitude) {
        mapInstanceRef.current.setView([latitude, longitude], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
      }
    }
  }, [latitude, longitude, showMap]);

  const requestBrowserGps = () => {
    setGpsState('loading');
    setStatusMessage(t('report.finding_location'));

    if (!navigator.geolocation) {
      setGpsState('error');
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setGpsState('success');
        setStatusMessage(t('report.location_found'));
        onLocationChange(lat, lon, 'gps', 'Browser GPS');
      },
      (error) => {
        console.warn('Browser GPS access denied or timed out:', error);
        setGpsState('error');
        setStatusMessage(t('report.location_fail'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleAreaPreset = (areaName: string, lat: number, lon: number) => {
    onLocationChange(lat, lon, 'manual', areaName);
  };

  const presetAreas = [
    { name: 'North Nazimabad', lat: 24.9333, lon: 67.0392 },
    { name: 'Gulshan-e-Iqbal', lat: 24.9207, lon: 67.0982 },
    { name: 'Gulistan-e-Jauhar', lat: 24.9180, lon: 67.1350 },
    { name: 'Clifton / DHA', lat: 24.8211, lon: 67.0321 },
    { name: 'Shahrah-e-Faisal', lat: 24.8615, lon: 67.0658 },
    { name: 'PECHS / Tariq Road', lat: 24.8670, lon: 67.0600 },
    { name: 'Federal B Area', lat: 24.9350, lon: 67.0700 },
    { name: 'Korangi / Landhi', lat: 24.8340, lon: 67.1265 },
    { name: 'Malir / Malir Cantt', lat: 24.9250, lon: 67.2000 },
    { name: 'Nazimabad', lat: 24.9142, lon: 67.0315 },
    { name: 'Saddar', lat: 24.8580, lon: 67.0180 },
    { name: 'Orangi Town', lat: 24.9450, lon: 66.9850 },
    { name: 'North Karachi / Surjani', lat: 24.9850, lon: 67.0620 }
  ];

  return (
    <div className="civic-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#006600]" />
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-[#1F2937]">
              {t('report.location_title')}
            </h4>
            <p className="text-[11px] text-gray-500">
              Select your neighborhood or tap on map
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={requestBrowserGps}
          disabled={gpsState === 'loading'}
          className="civic-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
        >
          {gpsState === 'loading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {t('report.use_my_location')}
        </button>
      </div>

      {/* GPS Status Notice */}
      {gpsState === 'success' && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {gpsState === 'error' && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Neighborhood Quick Dropdown Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 block">
          Karachi Neighborhood / Area:
        </label>
        <select
          value={areaText || ''}
          onChange={(e) => {
            const val = e.target.value;
            const found = presetAreas.find((a) => a.name === val);
            if (found) {
              handleAreaPreset(found.name, found.lat, found.lon);
            }
          }}
          className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-lg p-2.5 text-gray-800 font-medium focus:ring-2 focus:ring-[#006600] focus:border-[#006600] transition-colors"
        >
          <option value="">-- Choose Karachi Neighborhood --</option>
          {presetAreas.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Area Preset Chips */}
      <div>
        <span className="text-[11px] text-gray-500 font-medium block mb-1.5">
          Quick area chips:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {presetAreas.slice(0, 7).map((a) => (
            <button
              key={a.name}
              type="button"
              onClick={() => handleAreaPreset(a.name, a.lat, a.lon)}
              className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                areaText === a.name
                  ? 'bg-[#E8F5E9] text-[#006600] font-semibold border-[#006600]'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Current Resolved Location Indicator */}
      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#006600]" />
          <span className="font-semibold text-gray-700">
            {areaText ? `Selected: ${areaText}` : 'Point on map or choose area above'}
          </span>
        </div>
        {latitude && longitude ? (
          <span className="font-mono text-[11px] text-emerald-700 font-medium">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        ) : (
          <span className="text-[11px] text-gray-400 italic">
            Default center active
          </span>
        )}
      </div>

      {/* Interactive Map Preview */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{t('report.location_confirm')}</span>
          {latitude && longitude && (
            <span className="font-mono text-[11px] text-gray-400">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          )}
        </div>
        <div
          ref={mapContainerRef}
          className="w-full h-52 sm:h-60 rounded-xl overflow-hidden border border-[#E5E7EB] z-0 shadow-inner"
        />
        <p className="text-[11px] text-gray-400 italic text-center">
          Tap or drag marker on map to pinpoint exact street location
        </p>
      </div>
    </div>
  );
};
