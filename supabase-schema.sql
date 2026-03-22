-- ============================================
-- China Global Study — Supabase Schema Setup
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. UNIVERSITIES (Partnered institutions)
-- ============================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT '',
  china_ranking INTEGER,
  scholarship_percentage INTEGER DEFAULT 0,
  instruction_languages TEXT[] DEFAULT ARRAY['English'],
  intake_seasons TEXT[] DEFAULT ARRAY['Fall'],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROGRAMS (The core entity — program at a university)
-- ============================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  degree_level TEXT DEFAULT 'Master',
  field_of_study TEXT DEFAULT '',
  tuition_cny INTEGER DEFAULT 0,
  dorm_fee_cny INTEGER DEFAULT 0,
  service_fee_cny INTEGER DEFAULT 0,
  total_fee_cny INTEGER DEFAULT 0,
  total_fee_mad DECIMAL DEFAULT 0,
  scholarship_percentage INTEGER DEFAULT 0,
  duration_years DECIMAL DEFAULT 1,
  intake_season TEXT DEFAULT 'Fall',
  status TEXT DEFAULT 'Available' CHECK (status IN ('Available', 'Expired', 'Full')),
  requirements TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. APPLICANTS
-- ============================================
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  passport_number TEXT DEFAULT '',
  application_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. APPLICATIONS (Pipeline — links applicant to program)
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  custom_university TEXT,
  custom_program TEXT,
  status TEXT DEFAULT 'Inquiry' CHECK (status IN ('Inquiry', 'Documents Collecting', 'Submitted', 'Under Review', 'Accepted', 'Visa Processing', 'Enrolled', 'Rejected')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
  amount_paid_cny INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. DOCUMENTS (Per application tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  label TEXT DEFAULT '',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received', 'Verified', 'Expired')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. CITY GUIDES (Editable, pre-seeded)
-- ============================================
CREATE TABLE IF NOT EXISTS city_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_name TEXT NOT NULL,
  province TEXT DEFAULT '',
  description TEXT DEFAULT '',
  population TEXT DEFAULT '',
  climate TEXT DEFAULT '',
  cost_of_living TEXT DEFAULT '',
  essential_apps JSONB DEFAULT '[]'::JSONB,
  accommodation_info TEXT DEFAULT '',
  transportation TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TASKS (Global + per-applicant tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'General' CHECK (category IN ('Pre-Departure', 'Arrival', 'Documentation', 'General')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  due_date DATE,
  applicant_tags UUID[] DEFAULT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. SETTINGS (Single row for app config)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT DEFAULT '',
  agency_id TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  theme TEXT DEFAULT 'obsidian',
  mad_exchange_rate DECIMAL DEFAULT 1.38,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (Disable for simplicity — single admin dashboard)
-- ============================================
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (single admin, no auth)
CREATE POLICY "Allow all for anon" ON universities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON applicants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON city_guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONE! Your database is now ready.
-- ============================================

-- If you are updating an existing database, run these commands:
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid'));
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS amount_paid_cny INTEGER DEFAULT 0;
