import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, PlusCircle, ArrowUpDown, Loader2, Inbox, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { ComplaintDetail } from '../types';
import { ComplaintCard } from '../components/ComplaintCard';
import { toast } from 'sonner';

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getMyComplaints();
      let filtered = data;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.reference_id?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.original_text?.toLowerCase().includes(q) ||
            c.authority?.name?.toLowerCase().includes(q)
        );
      }

      if (sortOrder === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }

      setComplaints(filtered);
    } catch (err: any) {
      console.error('Failed to load my complaints:', err);
      toast.error(err.message || 'Failed to load your complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [dateFilter, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMyComplaints();
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this unsent complaint?')) return;
    try {
      const res = await api.deleteComplaint(id);
      toast.success(res.message || 'Complaint deleted successfully.');
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete complaint.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
            My Complaints
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Your personal civic complaint history and official dispatch statuses
          </p>
        </div>
        <Link
          to="/report"
          className="civic-btn-primary py-2.5 px-4 text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Report a Problem
        </Link>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="civic-card p-4 space-y-3 bg-white shadow-xs rounded-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Sort:</span>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="civic-btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your complaints by category, authority, or reference ID..."
            className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm rounded-xl border border-[#E5E7EB] focus:border-[#006600] outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Complaints List or Empty States */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#006600] mx-auto" />
          <p className="text-xs text-gray-400">Loading your personal complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="civic-card p-12 text-center space-y-4 max-w-md mx-auto bg-white shadow-xs rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#006600] flex items-center justify-center mx-auto border border-emerald-200">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-800">
              No Complaints Submitted Yet
            </h3>
            <p className="text-xs text-gray-500">
              You haven't reported any civic problems yet. Submit a new report to track its progress.
            </p>
          </div>
          <Link to="/report" className="civic-btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" />
            Report a Problem
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} onDelete={handleDeleteComplaint} />
          ))}
        </div>
      )}
    </div>
  );
};
