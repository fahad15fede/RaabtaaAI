import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, PlusCircle, MapPin, Grid, User, Menu, X, LayoutDashboard, FileText } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-colors shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#006600] flex items-center justify-center text-white shadow-sm group-hover:bg-[#01411C] transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-[#1F2937] tracking-tight block leading-tight">
                RabtaaAI
              </span>
              <span className="text-[10px] text-[#006600] font-bold block uppercase tracking-wider leading-none">
                Karachi Civic Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-[#E8F5E9] text-[#006600]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/nearby"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/nearby')
                  ? 'bg-[#E8F5E9] text-[#006600]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Nearby Issues
            </Link>

            <Link
              to="/services"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/services')
                  ? 'bg-[#E8F5E9] text-[#006600]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Civic Services
            </Link>

            <Link
              to="/complaints"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/complaints')
                  ? 'bg-[#E8F5E9] text-[#006600]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Complaints
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive('/dashboard')
                  ? 'bg-[#E8F5E9] text-[#006600]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            {/* Prominent Report CTA */}
            <Link
              to="/report"
              className="ml-2 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#006600] text-white hover:bg-[#01411C] shadow-sm transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              Report a Problem
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            <LanguageToggle />

            {user ? (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#006600] text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/') && location.pathname === '/' ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link
              to="/report"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#006600] text-white shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Report a Problem
            </Link>

            <Link
              to="/nearby"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/nearby') ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              📍 Nearby Civic Issues
            </Link>

            <Link
              to="/services"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/services') ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              🏛 Civic Services (Water, Gas)
            </Link>

            <Link
              to="/complaints"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/complaints') ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              📄 Complaints Directory
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/dashboard') ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              📊 Citizen Dashboard
            </Link>

            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-xl text-xs font-semibold ${
                isActive('/profile') ? 'bg-[#E8F5E9] text-[#006600]' : 'text-gray-700'
              }`}
            >
              👤 Profile & Location Preferences
            </Link>
          </div>
        )}
      </header>

      {/* Mobile One-Handed Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 flex items-center justify-around text-[10px] font-semibold text-gray-500 shadow-lg">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 p-1 ${isActive('/') && location.pathname === '/' ? 'text-[#006600]' : ''}`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          to="/nearby"
          className={`flex flex-col items-center gap-0.5 p-1 ${isActive('/nearby') ? 'text-[#006600]' : ''}`}
        >
          <MapPin className="w-5 h-5" />
          <span>Nearby</span>
        </Link>

        <Link
          to="/report"
          className="flex flex-col items-center justify-center p-2 rounded-full bg-[#006600] text-white -mt-5 shadow-md border-2 border-white"
        >
          <PlusCircle className="w-6 h-6" />
        </Link>

        <Link
          to="/services"
          className={`flex flex-col items-center gap-0.5 p-1 ${isActive('/services') ? 'text-[#006600]' : ''}`}
        >
          <Grid className="w-5 h-5" />
          <span>Services</span>
        </Link>

        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-0.5 p-1 ${isActive('/dashboard') ? 'text-[#006600]' : ''}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </>
  );
};
