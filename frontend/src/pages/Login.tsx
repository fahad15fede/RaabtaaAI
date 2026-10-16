import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck, User, Eye, EyeOff, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user, login, signup, demoLogin } = useAuth();

  const fromPath = (routeLocation.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, navigate, fromPath]);

  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('North Nazimabad, Karachi');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match.');
          setSubmitting(false);
          return;
        }
        await signup(emailOrUsername, password, fullName || 'Karachi Citizen', username, location);
        toast.success('Account created! Welcome to Karachi Civic AI.');
      } else {
        await login(emailOrUsername, password);
        toast.success('Signed in successfully');
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          toast.success('Current location detected via GPS');
        },
        () => {
          toast.error('Could not detect GPS location. Type your location manually.');
        }
      );
    }
  };

  const handleDemoAccess = () => {
    demoLogin();
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#006600] text-white flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1F2937]">
          {isSignUp ? 'Create Citizen Profile' : 'Citizen Login'}
        </h2>
        <p className="text-xs text-gray-500">
          Access your personalized civic reports, saved services & nearby problem alerts
        </p>
      </div>

      <div className="civic-card p-6 space-y-5 bg-white shadow-sm rounded-2xl border border-gray-100">
        {/* Toggle Tab */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg text-center transition ${!isSignUp ? 'bg-white text-[#006600] shadow-xs' : 'text-gray-500'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg text-center transition ${isSignUp ? 'bg-white text-[#006600] shadow-xs' : 'text-gray-500'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Muhammad Fahad"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required={isSignUp}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="fahad123"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Location</label>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="text-[11px] text-[#006600] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <MapPin className="w-3 h-3" /> Use GPS
                  </button>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., North Nazimabad, Karachi"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isSignUp ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={isSignUp ? 'email' : 'text'}
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder={isSignUp ? 'citizen@karachi.pk' : 'email@domain.com or username'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              {!isSignUp && (
                <Link to="/reset-password" className="text-[11px] text-[#006600] font-semibold hover:underline">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={isSignUp}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                />
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-[#006600] rounded border-gray-300 focus:ring-[#006600]"
              />
              <label htmlFor="rememberMe" className="text-xs text-gray-600 font-medium cursor-pointer">
                Remember session
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="civic-btn-primary w-full py-2.5 text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 mt-2"
          >
            {submitting ? 'Authenticating...' : isSignUp ? 'Create Citizen Profile' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold">Or</span></div>
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          className="civic-btn-secondary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-emerald-300 text-[#006600] bg-emerald-50/60 hover:bg-emerald-100/60"
        >
          <UserCheck className="w-4 h-4 text-[#006600]" />
          Quick Citizen Demo Access
        </button>
      </div>
    </div>
  );
};
