export type LeadStatus = 'new' | 'contacted' | 'replied' | 'converted' | 'bad_lead' | 'no_response' | 'follow_up';

export type PitchAngle =
  | 'no_website'
  | 'slow_website'
  | 'outdated_tech'
  | 'no_mobile_app'
  | 'poor_mobile'
  | 'bad_reviews'
  | 'general';

export type ContactChannel = 'email' | 'whatsapp' | 'linkedin' | 'phone' | 'other';
export type ContactOutcome = 'sent' | 'replied' | 'no_reply' | 'bounced' | 'wrong_number' | 'positive' | 'negative';

export type ServiceType =
  | 'website'
  | 'web_app'
  | 'mobile_app'
  | 'booking_system'
  | 'crm'
  | 'automation'
  | 'ecommerce'
  | 'custom_software';

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  website: 'Website',
  web_app: 'Web Application',
  mobile_app: 'Mobile App',
  booking_system: 'Booking System',
  crm: 'CRM / Dashboard',
  automation: 'Automation Script',
  ecommerce: 'E-Commerce',
  custom_software: 'Custom Software',
};

export interface ScoreBreakdown {
  website_existence: number;
  desktop_speed: number;
  mobile_speed: number;
  fcp: number;
  lcp: number;
  cls: number;
  tti: number;
  tech_freshness: number;
  ssl: number;
  mobile_responsive: number;
  accessibility: number;
  seo_basics: number;
  image_optimization: number;
  no_app: number;
  no_web_app: number;
  social_gaps: number;
  business_health: number;
  review_volume: number;
  contact_reachability: number;
  online_booking: number;
  content_freshness: number;
  structured_data: number;
  pwa: number;
}

export const SCORE_FACTOR_LABELS: Record<keyof ScoreBreakdown, { label: string; maxPoints: number; description: string }> = {
  website_existence: { label: 'Website Existence', maxPoints: 8, description: 'No website = massive opportunity' },
  desktop_speed: { label: 'Desktop Speed', maxPoints: 6, description: 'PageSpeed desktop performance score' },
  mobile_speed: { label: 'Mobile Speed', maxPoints: 7, description: 'PageSpeed mobile performance score' },
  fcp: { label: 'First Contentful Paint', maxPoints: 4, description: 'Time until first content visible' },
  lcp: { label: 'Largest Contentful Paint', maxPoints: 4, description: 'Time until main content loaded' },
  cls: { label: 'Cumulative Layout Shift', maxPoints: 3, description: 'Visual stability while loading' },
  tti: { label: 'Time to Interactive', maxPoints: 4, description: 'Time until page is usable' },
  tech_freshness: { label: 'Tech Stack Age', maxPoints: 5, description: 'Outdated frameworks = opportunity' },
  ssl: { label: 'SSL / HTTPS', maxPoints: 2, description: 'Missing SSL certificate' },
  mobile_responsive: { label: 'Mobile Responsive', maxPoints: 5, description: 'Viewport & responsive design' },
  accessibility: { label: 'Accessibility', maxPoints: 4, description: 'Missing alt tags, ARIA, contrast' },
  seo_basics: { label: 'SEO Basics', maxPoints: 5, description: 'Meta tags, headings, OG tags' },
  image_optimization: { label: 'Image Optimization', maxPoints: 3, description: 'Uncompressed or lazy load missing' },
  no_app: { label: 'No Mobile App', maxPoints: 4, description: 'Business could benefit from an app' },
  no_web_app: { label: 'No Web App / Portal', maxPoints: 4, description: 'Could use booking/CRM/scripts' },
  social_gaps: { label: 'Social Media Gaps', maxPoints: 4, description: 'Missing key platforms' },
  business_health: { label: 'Business Health', maxPoints: 5, description: 'High rating + bad site = gold' },
  review_volume: { label: 'Review Volume', maxPoints: 4, description: 'Established = has budget' },
  contact_reachability: { label: 'Contact Reachability', maxPoints: 5, description: 'Easy to reach via email/phone' },
  online_booking: { label: 'Online Booking', maxPoints: 3, description: 'No booking when they should' },
  content_freshness: { label: 'Content Freshness', maxPoints: 3, description: 'Old copyright, stale content' },
  structured_data: { label: 'Schema / Rich Snippets', maxPoints: 2, description: 'Missing structured data' },
  pwa: { label: 'PWA Capability', maxPoints: 2, description: 'Not installable, no service worker' },
};

export interface Search {
  id: string;
  niche: string;
  city: string;
  country: string | null;
  total_results: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Lead {
  id: string;
  search_id: string;
  business_name: string;
  google_maps_url: string | null;
  google_place_id: string | null;
  rating: number | null;
  review_count: number;
  address: string | null;
  website_url: string | null;
  phone: string | null;
  whatsapp_link: string | null;
  has_website: boolean;
  emails: string[];
  social_links: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  has_mobile_app: boolean;
  app_store_url: string | null;
  play_store_url: string | null;
  tech_stack: string[];
  page_speed_score: number | null;
  mobile_friendly: boolean | null;
  load_time_ms: number | null;
  pitch_angles: PitchAngle[];
  pitch_summary: string | null;
  ai_email_draft: string | null;
  status: LeadStatus;
  email_valid: boolean | null;
  phone_valid: boolean | null;
  website_valid: boolean | null;
  notes: string | null;
  contacted_at: string | null;
  replied_at: string | null;
  converted_at: string | null;
  enriched_at: string | null;
  created_at: string;
  updated_at: string;
  // Opportunity scoring
  opportunity_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  service_opportunities: string[];
  // Detailed metrics
  fcp_ms: number | null;
  lcp_ms: number | null;
  cls_score: number | null;
  tti_ms: number | null;
  has_ssl: boolean | null;
  has_viewport_meta: boolean | null;
  has_meta_description: boolean | null;
  has_og_tags: boolean | null;
  has_structured_data: boolean | null;
  has_alt_tags: boolean | null;
  image_optimization_score: number | null;
  content_freshness_year: number | null;
  has_online_booking: boolean | null;
  has_pwa: boolean | null;
  // Follow-up
  follow_up_at: string | null;
  follow_up_count: number;
  last_contacted_at: string | null;
  follow_up_interval_days: number;
  // Contact tracking
  contact_channel: ContactChannel | null;
  contact_outcome: ContactOutcome | null;
  // Joined data
  search?: Search;
}

export interface ContactLog {
  id: string;
  lead_id: string;
  channel: ContactChannel;
  outcome: ContactOutcome | null;
  notes: string | null;
  contacted_at: string;
  created_at: string;
}

export interface SearchRequest {
  id: string;
  niche: string;
  city: string;
  country: string | null;
  max_results: number;
  skip_crawl: boolean;
  skip_analysis: boolean;
  skip_ai: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message: string | null;
  search_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface SearchPreset {
  id: string;
  name: string;
  niche: string;
  city: string;
  country: string | null;
  max_results: number;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  lead_id: string | null;
  search_id: string | null;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface KPIData {
  totalLeads: number;
  leadsContacted: number;
  responseRate: number;
  conversionRate: number;
  emailsFound: number;
  websitesFound: number;
  avgRating: number;
  totalSearches: number;
  badLeads: number;
  noResponse: number;
  withoutWebsite: number;
  withoutApp: number;
  avgOpportunityScore: number;
  followUpsDue: number;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: 'New', color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.15)' },
  contacted: { label: 'Contacted', color: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.15)' },
  replied: { label: 'Replied', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)' },
  follow_up: { label: 'Follow Up', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  converted: { label: 'Converted', color: '#34d399', bgColor: 'rgba(52, 211, 153, 0.15)' },
  bad_lead: { label: 'Bad Lead', color: '#f87171', bgColor: 'rgba(248, 113, 113, 0.15)' },
  no_response: { label: 'No Response', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.15)' },
};

export const PITCH_ANGLE_LABELS: Record<PitchAngle, string> = {
  no_website: 'No Website',
  slow_website: 'Slow Website',
  outdated_tech: 'Outdated Tech',
  no_mobile_app: 'No Mobile App',
  poor_mobile: 'Poor Mobile UX',
  bad_reviews: 'Bad Reviews',
  general: 'General',
};

export const KANBAN_COLUMNS: LeadStatus[] = [
  'new',
  'contacted',
  'follow_up',
  'replied',
  'converted',
  'bad_lead',
  'no_response',
];
