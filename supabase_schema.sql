-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Stores Firebase UID
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISABLE Supabase RLS for now because we are using Firebase Auth
-- Instead, we will handle security through our application logic or custom RLS if needed later
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;

-- 4. Create Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  application_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;

-- 5. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;

-- 6. Seed Initial Services
INSERT INTO public.services (name, description, required_documents) 
VALUES
('PAN Card', 'Apply for new PAN or update existing', '["Aadhaar Card", "Photo", "Signature"]'),
('Passport Application', 'Fresh passport application assistance', '["Aadhaar Card", "Address Proof", "Education Proof"]'),
('Driving License', 'Apply for learner''s or permanent license', '["Aadhaar Card", "Age Proof", "Address Proof"]'),
('Income Certificate', 'Get your income certificate online', '["Aadhaar Card", "Ration Card", "Income Declaration"]'),
('Aadhaar Update', 'Update Aadhaar details easily', '["Aadhaar Card", "Supporting Documents"]')
ON CONFLICT DO NOTHING;

-- 7. Setup Storage
-- Note: These commands might require manual execution in Supabase SQL Editor if they fail here
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access for the documents bucket
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING ( bucket_id = 'documents' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'documents' );

-- 8. Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_application_id ON public.applications(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
