import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

export interface CivicLocation {
  area: string;
  town?: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'map' | 'manual';
}

export const KARACHI_PRESET_LOCATIONS: CivicLocation[] = [
  { area: 'North Nazimabad, Karachi', town: 'Gulberg Town', latitude: 24.9333, longitude: 66.9833, source: 'manual' },
  { area: 'Gulshan-e-Iqbal, Karachi', town: 'Gulshan Town', latitude: 24.9180, longitude: 67.0971, source: 'manual' },
  { area: 'Clifton / DHA, Karachi', town: 'Saddar Town', latitude: 24.8211, longitude: 67.0321, source: 'manual' },
  { area: 'PECHS / Shahrah-e-Faisal', town: 'Jamshed Town', latitude: 24.8615, longitude: 67.0658, source: 'manual' },
  { area: 'Saddar Town, Karachi', town: 'Saddar Town', latitude: 24.8560, longitude: 67.0175, source: 'manual' },
  { area: 'Korangi Industrial Area', town: 'Korangi Town', latitude: 24.8383, longitude: 67.1209, source: 'manual' },
  { area: 'Malir Cantt, Karachi', town: 'Malir Town', latitude: 24.9312, longitude: 67.2100, source: 'manual' }
];

interface LocationContextType {
  location: CivicLocation;
  setLocation: (loc: CivicLocation) => void;
  requestGPS: () => Promise<void>;
  presets: CivicLocation[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<CivicLocation>(() => {
    const saved = localStorage.getItem('cwa_selected_location');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return KARACHI_PRESET_LOCATIONS[0];
  });

  const setLocation = (loc: CivicLocation) => {
    setLocationState(loc);
    localStorage.setItem('cwa_selected_location', JSON.stringify(loc));
    toast.success(`Location updated to ${loc.area}`);
  };

  const requestGPS = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    toast.info('Detecting your GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsLoc: CivicLocation = {
          area: 'Detected GPS Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: 'gps'
        };
        setLocation(gpsLoc);
      },
      (err) => {
        toast.error('Location permission was denied or unavailable. You can select your area manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, requestGPS, presets: KARACHI_PRESET_LOCATIONS }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};
