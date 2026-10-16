import { AnalyzeResponse, ComplaintDetail, Authority } from '../types';
import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : 'http://localhost:8000') + '/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      headers['X-User-ID'] = session.user.id;
      return headers;
    }
  } catch {}
  
  const cached = localStorage.getItem('cwa_user_v2');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.id) headers['X-User-ID'] = parsed.id;
    } catch {}
  }
  return headers;
}

export interface AnalyzePayload {
  input_type: 'photo' | 'voice' | 'text';
  text?: string;
  transcript?: string;
  image_base64?: string;
  audio_base64?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_source?: string;
  address?: string;
  area?: string;
}

export interface NearbyProblem {
  id: string;
  reference_id: string;
  input_type: string;
  category: string;
  subcategory?: string;
  severity: string;
  status: string;
  report_count: number;
  created_at: string;
  distance_km: number;
  distance_m: number;
  authority: { name: string; short_name: string };
  location: { address: string; area: string; town?: string; latitude: number; longitude: number };
  description: string;
}

export interface CivicService {
  id: string;
  category_id: string;
  category_name: string;
  authority_id?: string;
  authority_name?: string;
  title: string;
  slug: string;
  service_type: string;
  description: string;
  price_amount: number | null;
  price_currency: string;
  price_unit?: string;
  price_verified: boolean;
  contact_phone?: string;
  contact_email?: string;
  contact_verified: boolean;
  source_url?: string;
  source_type: string;
  last_verified_at?: string;
  required_documents: string[];
  procedure_steps: string[];
  processing_time?: string;
  availability_status: string;
  latitude: number;
  longitude: number;
  area: string;
  distance_km?: number;
}

export const api = {
  async analyze(payload: AnalyzePayload): Promise<AnalyzeResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.detail || 'Failed to analyze report.');
    }
    return res.json();
  },

  async sendComplaint(complaintId: string): Promise<{ success: boolean; message: string; status: string; reference_id: string; authority_name: string; authority_email: string | null }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/send`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.detail || 'Failed to dispatch email.');
    }
    return res.json();
  },

  async retryEmail(complaintId: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/retry-email`, {
      method: 'POST',
      headers
    });
    return res.json();
  },

  async supportComplaint(complaintId: string): Promise<{ success: boolean; message: string; report_count: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/support`, {
      method: 'POST',
      headers
    });
    return res.json();
  },

  async getSupportStatus(complaintId: string): Promise<{ complaint_id: string; report_count: number; user_supported: boolean }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/support-status`, { headers });
    if (!res.ok) return { complaint_id: complaintId, report_count: 1, user_supported: false };
    return res.json();
  },

  async getNearbyProblems(params: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    radius_km?: number;
    category?: string;
    status?: string;
    severity?: string;
    sort?: string;
  } = {}): Promise<NearbyProblem[]> {
    const query = new URLSearchParams();
    if (params.latitude) query.set('latitude', params.latitude.toString());
    if (params.longitude) query.set('longitude', params.longitude.toString());
    query.set('radius', (params.radius || (params.radius_km ? params.radius_km * 1000 : 2000)).toString());
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.severity && params.severity !== 'all') query.set('severity', params.severity);
    if (params.sort) query.set('sort', params.sort);

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/nearby/problems?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch nearby civic problems.');
    return res.json();
  },

  async getNearbyHotspots(lat: number = 24.9333, lon: number = 66.9833): Promise<any[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/nearby/hotspots?latitude=${lat}&longitude=${lon}`, { headers });
    if (!res.ok) return [];
    return res.json();
  },

  async getServices(params: {
    category?: string;
    service_type?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
    sort?: string;
  } = {}): Promise<CivicService[]> {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.service_type && params.service_type !== 'all') query.set('service_type', params.service_type);
    if (params.search) query.set('search', params.search);
    if (params.latitude) query.set('latitude', params.latitude.toString());
    if (params.longitude) query.set('longitude', params.longitude.toString());
    if (params.sort) query.set('sort', params.sort);

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/services?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch civic services.');
    return res.json();
  },

  async getServiceCategories(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/services/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  async getServiceDetail(id: string): Promise<CivicService> {
    const res = await fetch(`${API_BASE}/services/${id}`);
    if (!res.ok) throw new Error('Civic service not found.');
    return res.json();
  },

  async getMyComplaints(): Promise<ComplaintDetail[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/my`, { headers });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Failed to fetch your personal complaints.'); }
    return res.json();
  },

  async getComplaints(params: {
    date_filter?: string;
    category?: string;
    authority_id?: string;
    status?: string;
    search?: string;
    sort?: string;
  } = {}): Promise<ComplaintDetail[]> {
    const query = new URLSearchParams();
    if (params.date_filter) query.set('date_filter', params.date_filter);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.authority_id && params.authority_id !== 'all') query.set('authority_id', params.authority_id);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints?${query.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch complaints.');
    return res.json();
  },

  async getComplaint(id: string): Promise<ComplaintDetail> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${id}`, { headers });
    if (!res.ok) throw new Error('Complaint not found.');
    return res.json();
  },

  async deleteComplaint(id: string): Promise<{ success: boolean; message: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Failed to delete complaint.');
    }
    return data;
  },

  async getAuthorities(): Promise<Authority[]> {
    const res = await fetch(`${API_BASE}/authorities`);
    if (!res.ok) throw new Error('Failed to load authorities.');
    return res.json();
  },

  async getCategories(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to load categories.');
    return res.json();
  },

  async getUserProfile(): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me/profile`, { headers });
    if (!res.ok) return null;
    return res.json();
  },

  async updateProfile(updates: any): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me/profile`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async getSavedServices(): Promise<CivicService[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me/saved-services`, { headers });
    if (!res.ok) return [];
    return res.json();
  },

  async saveService(serviceId: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me/saved-services`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ service_id: serviceId })
    });
    return res.json();
  },

  async removeSavedService(serviceId: string): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/me/saved-services/${serviceId}`, {
      method: 'DELETE',
      headers
    });
    return res.json();
  }
};
