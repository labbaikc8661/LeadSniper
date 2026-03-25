-- LeadSniper Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all required tables, enums, and policies.

-- ═══════════════════════════════════════════════════════════
-- 1. ENUMS
-- ═══════════════════════════════════════════════════════════

CREATE TYPE ms_lead_status AS ENUM (
  'new', 'contacted', 'follow_up', 'replied', 'converted', 'bad_lead', 'no_response'
);

CREATE TYPE ms_search_status AS ENUM (
  'pending', 'running', 'completed', 'failed'
);

-- ═══════════════════════════════════════════════════════════
-- 2. SEARCHES
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  total_results INTEGER DEFAULT 0,
  status ms_search_status DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════
-- 3. LEADS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES ms_searches(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  google_place_id TEXT UNIQUE,
  google_maps_url TEXT,
  rating NUMERIC(2,1),
  review_count INTEGER DEFAULT 0,
  address TEXT,
  website_url TEXT,
  phone TEXT,
  whatsapp_link TEXT,
  has_website BOOLEAN DEFAULT false,
  emails TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  has_mobile_app BOOLEAN DEFAULT false,
  app_store_url TEXT,
  play_store_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN,
  load_time_ms INTEGER,
  pitch_angles TEXT[] DEFAULT '{}',
  pitch_summary TEXT,
  ai_email_draft TEXT,
  status ms_lead_status DEFAULT 'new',
  email_valid BOOLEAN,
  phone_valid BOOLEAN,
  website_valid BOOLEAN,
  notes TEXT,
  contacted_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Opportunity scoring
  opportunity_score INTEGER,
  score_breakdown JSONB,
  service_opportunities TEXT[] DEFAULT '{}',

  -- Detailed metrics (PageSpeed + crawl)
  fcp_ms INTEGER,
  lcp_ms INTEGER,
  cls_score NUMERIC(6,3),
  tti_ms INTEGER,
  has_ssl BOOLEAN,
  has_viewport_meta BOOLEAN,
  has_meta_description BOOLEAN,
  has_og_tags BOOLEAN,
  has_structured_data BOOLEAN,
  has_alt_tags BOOLEAN,
  image_optimization_score INTEGER,
  content_freshness_year INTEGER,
  has_online_booking BOOLEAN,
  has_pwa BOOLEAN,

  -- Follow-up system
  follow_up_at TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  follow_up_interval_days INTEGER DEFAULT 7,

  -- Contact tracking
  contact_channel TEXT,
  contact_outcome TEXT
);

-- ═══════════════════════════════════════════════════════════
-- 4. SETTINGS (API keys, user info)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 5. ANALYTICS EVENTS
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES ms_leads(id) ON DELETE SET NULL,
  search_id UUID REFERENCES ms_searches(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 6. SEARCH REQUESTS (dashboard → scraper queue)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_search_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  niche TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  max_results INTEGER DEFAULT 100,
  skip_crawl BOOLEAN DEFAULT false,
  skip_analysis BOOLEAN DEFAULT false,
  skip_ai BOOLEAN DEFAULT false,
  status ms_search_status DEFAULT 'pending',
  error_message TEXT,
  search_id UUID REFERENCES ms_searches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════
-- 7. SEARCH PRESETS (saved search templates)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_search_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  max_results INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 8. CONTACT LOG (per-lead contact history)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE ms_contact_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES ms_leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  outcome TEXT,
  notes TEXT,
  contacted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY (allow all — this is a personal tool)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE ms_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_search_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_search_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_contact_log ENABLE ROW LEVEL SECURITY;

-- Allow-all policies (personal tool — add auth if you expose publicly)
CREATE POLICY "Allow all" ON ms_searches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_analytics_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_search_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_search_presets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON ms_contact_log FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- 10. REALTIME (enable for live dashboard updates)
-- ═══════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE ms_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE ms_searches;
ALTER PUBLICATION supabase_realtime ADD TABLE ms_search_requests;
