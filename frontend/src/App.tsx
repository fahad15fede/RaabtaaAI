import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/Navbar';
import { CivicChatbot } from './components/CivicChatbot';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Report } from './pages/Report';
import { NearbyProblems } from './pages/NearbyProblems';
import { ServicesList } from './pages/ServicesList';
import { WaterTankers } from './pages/WaterTankers';
import { WaterLines } from './pages/WaterLines';
import { GasServices } from './pages/GasServices';
import { ServiceDetail } from './pages/ServiceDetail';
import { Dashboard } from './pages/Dashboard';
import { Complaints } from './pages/Complaints';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { ResetPassword } from './pages/ResetPassword';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F7] text-[#1F2937]">
      <Toaster position="top-center" richColors />
      <Navbar />
      <CivicChatbot />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
          <Route path="/nearby" element={<NearbyProblems />} />
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/water-tankers" element={<WaterTankers />} />
          <Route path="/services/water-lines" element={<WaterLines />} />
          <Route path="/services/gas" element={<GasServices />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-[#E5E7EB] py-6 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-gray-700">
            RabtaaAI — "Report a problem. We'll find who can fix it."
          </p>
          <p className="text-[11px] text-gray-400">
            Location-aware civic platform empowering citizens across Karachi with AI routing, nearby issue discovery, and verified government services.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <AppContent />
      </LocationProvider>
    </AuthProvider>
  );
};

export default App;
