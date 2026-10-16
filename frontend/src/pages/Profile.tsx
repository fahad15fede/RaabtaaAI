import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Globe, Shield, LogOut, MapPin, Check, Save, Navigation } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAuth } from '../context/AuthContext';
import { useLocation, KARACHI_PRESET_LOCATIONS } from '../context/LocationContext';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'sonner';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { location, setLocation } = useLocation();

  const [fullName, setFullName] = useState(user?.name || 'Karachi Citizen');
  const [username, setUsername] = useState(user?.username || `user_${user?.id.slice(0, 8) || 'citizen'}`);
  const [userLocText, setUserLocText] = useState(user?.location || location.area || 'North Nazimabad, Karachi');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: fullName,
        username,
        location: userLocText,
        current_area: userLocText,
        home_area: userLocText
      });
      await api.updateProfile({
        full_name: fullName,
        username,
        location: userLocText,
        latitude: location.latitude,
        longitude: location.longitude
      }).catch(() => {});
      toast.success('Profile preferences updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleGPSDetect = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const label = `GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          setUserLocText(label);
          setLocation({
            area: label,
            town: 'Detected GPS Location',
            latitude: lat,
            longitude: lon,
            source: 'gps'
          });
          toast.success('Current location detected via GPS');
        },
        () => {
          toast.error('Location permission denied or unavailable');
        }
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6 pb-20">
      <div className="civic-card p-6 space-y-6 bg-white shadow-sm rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#006600] flex items-center justify-center font-extrabold text-xl shadow-xs border border-emerald-200">
            {(fullName || 'C')[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 font-mono">@{username} • {user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-gray-700">Citizen Location</label>
              <button
                type="button"
                onClick={handleGPSDetect}
                className="text-[11px] text-[#006600] font-bold flex items-center gap-1 hover:underline"
              >
                <Navigation className="w-3 h-3" /> Detect GPS Location
              </button>
            </div>
            <input
              type="text"
              value={userLocText}
              onChange={(e) => setUserLocText(e.target.value)}
              placeholder="e.g. North Nazimabad, Karachi"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none mb-2"
            />
            <label className="block font-semibold text-gray-500 text-[11px] mb-1">Or select preset Karachi area:</label>
            <select
              value={location.area}
              onChange={(e) => {
                const found = KARACHI_PRESET_LOCATIONS.find(p => p.area === e.target.value);
                if (found) {
                  setLocation(found);
                  setUserLocText(found.area);
                }
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none font-semibold text-gray-800 bg-gray-50"
            >
              {KARACHI_PRESET_LOCATIONS.map(p => (
                <option key={p.area} value={p.area}>{p.area} ({p.town})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-b border-gray-100">
            <span className="text-gray-600 font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              Interface Language
            </span>
            <LanguageToggle />
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Account Security Status
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006600] font-extrabold text-[10px]">
              Verified Supabase Auth
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="civic-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Preferences'}
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1.5"
          >
            View Citizen Dashboard
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="py-2 px-4 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
