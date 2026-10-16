import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();

  const [step, setStep] = useState<'request' | 'update'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email);
      setStep('update');
    } catch (err: any) {
      toast.error(err.message || 'Could not send password reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(newPassword);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#006600] text-white flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1F2937]">
          {step === 'request' ? 'Reset Your Password' : 'Set New Password'}
        </h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">
          {step === 'request'
            ? 'Enter your registered email address to receive password reset instructions.'
            : 'Enter your new password below.'}
        </p>
      </div>

      <div className="civic-card p-6 bg-white shadow-sm rounded-2xl border border-gray-100">
        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@karachi.pk"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="civic-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Sending Request...' : 'Send Password Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#006600] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="civic-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Updating...' : 'Update Password & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-4 text-center border-t border-gray-100 mt-4">
          <Link to="/login" className="text-xs text-gray-500 font-semibold hover:text-[#006600] inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
