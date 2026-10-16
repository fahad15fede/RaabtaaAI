export interface Authority {
  id: string;
  name: string;
  short_name: string;
  email: string | null;
  phone: string | null;
  email_configured: boolean;
  routing_confidence: number;
  routing_reason: string;
}

export interface LocationInfo {
  latitude: number | null;
  longitude: number | null;
  location_accuracy?: number | null;
  location_source: string; // 'gps' | 'exif' | 'text' | 'voice' | 'map' | 'manual' | 'geocoded'
  location_confidence: number;
  address: string;
  area: string;
  town?: string;
  district?: string;
  location_text?: string;
}

export interface Classification {
  category: string;
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location_text: string;
  confidence: number;
  reasoning_summary: string;
}

export interface DuplicateInfo {
  is_duplicate: boolean;
  duplicate_of: string | null;
  duplicate_confidence: number;
  report_count: number;
  existing_complaint_id?: string | null;
  message?: string | null;
}

export interface ComplaintText {
  english: string;
  urdu: string;
}

export interface AnalyzeResponse {
  complaint_id: string;
  reference_id: string;
  input_type: string;
  original_text: string | null;
  normalized_english: string | null;
  classification: Classification;
  location: LocationInfo;
  authority: Authority;
  duplicate: DuplicateInfo;
  complaint: ComplaintText;
  status: string;
  created_at: string;
  image_url?: string | null;
  audio_url?: string | null;
}

export interface ComplaintEvent {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ComplaintDetail {
  id: string;
  reference_id: string;
  user_id?: string | null;
  input_type: string;
  original_text: string | null;
  transcript: string | null;
  normalized_english: string | null;
  english_complaint: string | null;
  urdu_complaint: string | null;
  category: string;
  subcategory?: string | null;
  authority: Authority;
  severity: string;
  ai_confidence: number;
  status: 'analyzing' | 'ready' | 'sent' | 'email_pending' | 'email_failed' | 'duplicate' | 'resolved';
  duplicate_of: string | null;
  duplicate_confidence: number;
  report_count: number;
  location: LocationInfo;
  image_url?: string | null;
  audio_url?: string | null;
  email_sent_at?: string | null;
  email_error?: string | null;
  created_at: string;
  updated_at: string;
  events: ComplaintEvent[];
}
