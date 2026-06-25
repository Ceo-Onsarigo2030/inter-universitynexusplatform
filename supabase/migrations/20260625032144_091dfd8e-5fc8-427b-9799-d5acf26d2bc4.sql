
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_disability boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disability_type text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles directory view" ON public.profiles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _num INT; _full_name TEXT; _university TEXT; _has_dis BOOLEAN; _dis_type TEXT;
BEGIN
  _num := nextval('public.member_number_seq');
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _university := COALESCE(NEW.raw_user_meta_data->>'university', 'Not specified');
  _has_dis := COALESCE((NEW.raw_user_meta_data->>'has_disability')::boolean, false);
  _dis_type := NEW.raw_user_meta_data->>'disability_type';
  INSERT INTO public.profiles (id, full_name, university, member_number, member_id, has_disability, disability_type)
  VALUES (NEW.id, _full_name, _university, _num, 'UNX-2026-' || LPAD(_num::TEXT, 5, '0'), _has_dis, _dis_type);
  IF NEW.email = 'b.aconnect254@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL, university text,
  category text NOT NULL DEFAULT 'event',
  message text NOT NULL,
  approved boolean NOT NULL DEFAULT true,
  upvotes int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.suggestions TO anon, authenticated;
GRANT ALL ON public.suggestions TO service_role;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved suggestions public" ON public.suggestions FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone can suggest" ON public.suggestions FOR INSERT
  WITH CHECK (char_length(trim(message)) BETWEEN 3 AND 2000 AND char_length(trim(name)) BETWEEN 1 AND 100);
CREATE POLICY "Admins manage suggestions" ON public.suggestions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.feedback_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid REFERENCES public.feedback(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text NOT NULL, resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.feedback_reports TO anon, authenticated;
GRANT ALL ON public.feedback_reports TO service_role;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report" ON public.feedback_reports FOR INSERT
  WITH CHECK (char_length(trim(reason)) BETWEEN 3 AND 500);
CREATE POLICY "Admins view reports" ON public.feedback_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage reports" ON public.feedback_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, slug text UNIQUE NOT NULL,
  excerpt text, body text NOT NULL, cover_url text,
  category text NOT NULL DEFAULT 'news',
  status text NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articles_search_idx ON public.articles USING gin (to_tsvector('english', title || ' ' || COALESCE(excerpt,'') || ' ' || body));
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles public" ON public.articles FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS overview text,
  ADD COLUMN IF NOT EXISTS ticket_url text,
  ADD COLUMN IF NOT EXISTS ticket_regular int,
  ADD COLUMN IF NOT EXISTS ticket_vip int,
  ADD COLUMN IF NOT EXISTS ticket_vvip int,
  ADD COLUMN IF NOT EXISTS pillar text;

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_tier text NOT NULL DEFAULT 'regular',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own rsvps" ON public.event_rsvps FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view rsvps" ON public.event_rsvps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.university_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_name text NOT NULL,
  voter_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS univ_votes_name_idx ON public.university_votes (university_name);
GRANT SELECT, INSERT ON public.university_votes TO anon, authenticated;
GRANT ALL ON public.university_votes TO service_role;
ALTER TABLE public.university_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.university_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.university_votes FOR INSERT
  WITH CHECK (char_length(trim(university_name)) BETWEEN 2 AND 150);

CREATE TABLE IF NOT EXISTS public.partner_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization text NOT NULL, contact_name text NOT NULL,
  email text NOT NULL, phone text, partnership_type text,
  message text NOT NULL, proposal_url text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.partner_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.partner_inquiries TO authenticated;
GRANT ALL ON public.partner_inquiries TO service_role;
ALTER TABLE public.partner_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit partner inquiry" ON public.partner_inquiries FOR INSERT
  WITH CHECK (char_length(trim(organization))>0 AND char_length(trim(email))>3);
CREATE POLICY "Admins view inquiries" ON public.partner_inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update inquiries" ON public.partner_inquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.universities (name, location) VALUES
  ('University of Nairobi (UoN)','Nairobi'),
  ('Kenyatta University (KU)','Nairobi'),
  ('Jomo Kenyatta University of Agriculture and Technology (JKUAT)','Kiambu'),
  ('Moi University','Eldoret'),
  ('Egerton University','Nakuru'),
  ('Maseno University','Kisumu'),
  ('Strathmore University','Nairobi'),
  ('United States International University Africa (USIU-A)','Nairobi'),
  ('Technical University of Kenya (TUK)','Nairobi'),
  ('Technical University of Mombasa (TUM)','Mombasa'),
  ('Kabarak University','Nakuru'),
  ('Daystar University','Nairobi'),
  ('Catholic University of Eastern Africa (CUEA)','Nairobi'),
  ('Kenya Methodist University (KEMU)','Meru'),
  ('Mount Kenya University (MKU)','Thika'),
  ('Africa Nazarene University (ANU)','Nairobi'),
  ('Pwani University','Kilifi'),
  ('Maasai Mara University','Narok'),
  ('Dedan Kimathi University of Technology (DeKUT)','Nyeri'),
  ('Multimedia University of Kenya (MMU)','Nairobi'),
  ('Karatina University','Karatina'),
  ('Chuka University','Chuka'),
  ('Meru University of Science and Technology (MUST)','Meru'),
  ('South Eastern Kenya University (SEKU)','Kitui'),
  ('University of Eldoret (UoE)','Eldoret'),
  ('Masinde Muliro University of Science and Technology (MMUST)','Kakamega'),
  ('Jaramogi Oginga Odinga University of Science and Technology (JOOUST)','Bondo'),
  ('Kisii University','Kisii'),
  ('Laikipia University','Nyahururu'),
  ('Machakos University','Machakos'),
  ('Murang''a University of Technology','Murang''a'),
  ('Taita Taveta University','Voi'),
  ('Garissa University','Garissa'),
  ('Kibabii University','Bungoma'),
  ('Rongo University','Migori'),
  ('Cooperative University of Kenya','Nairobi'),
  ('Kirinyaga University','Kerugoya'),
  ('Tom Mboya University','Homa Bay'),
  ('Alupe University','Busia'),
  ('Tharaka University','Tharaka Nithi'),
  ('Riara University','Nairobi'),
  ('KCA University','Nairobi'),
  ('Zetech University','Nairobi'),
  ('Pan Africa Christian University (PAC)','Nairobi'),
  ('Gretsa University','Thika'),
  ('Adventist University of Africa','Nairobi'),
  ('Kenya Highlands University','Kericho'),
  ('Great Lakes University of Kisumu','Kisumu'),
  ('Lukenya University','Machakos'),
  ('Kenya Institute of Special Education (KISE)','Nairobi'),
  ('Kenya Medical Training College (KMTC)','Nairobi'),
  ('Kenya Technical Trainers College (KTTC)','Nairobi'),
  ('Kenya School of Government','Nairobi'),
  ('Railway Training Institute','Nairobi'),
  ('Kenya Institute of Mass Communication (KIMC)','Nairobi'),
  ('Kenya Utalii College','Nairobi'),
  ('Nairobi Technical Training Institute','Nairobi'),
  ('Kabete National Polytechnic','Nairobi'),
  ('Kisumu National Polytechnic','Kisumu'),
  ('Eldoret National Polytechnic','Eldoret'),
  ('Kenya Coast National Polytechnic','Mombasa'),
  ('Nyeri National Polytechnic','Nyeri'),
  ('Sigalagala National Polytechnic','Kakamega'),
  ('Meru National Polytechnic','Meru'),
  ('Kitale National Polytechnic','Kitale'),
  ('Other','N/A')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.programs (title, description, overview, category, event_date, location, is_published, ticket_regular, ticket_vip, ticket_vvip, ticket_url, pillar)
VALUES
  ('Inter-Universities Nexus Gala Awards','A flagship gala celebrating talent, innovation and student leadership across Kenya.',
   'An evening of recognition for outstanding students, creatives, innovators and changemakers from universities and colleges nationwide. Expect performances, awards, networking with industry leaders and the unveiling of the next cohort of Nexus ambassadors.',
   'Gala','2026-11-06 18:00:00+03','KISE (Kenya Institute of Special Education), Kasarani',true,450,1000,2000,'https://madfun.com','Talent & Innovation'),
  ('16 Days of Activism Walk','Stand with us against gender-based violence in a CBD solidarity walk.',
   'Join students, partners and allies in a powerful CBD walk marking the global 16 Days of Activism Against Gender-Based Violence. The day includes spoken word, testimonies, partner exhibitions and a public pledge wall.',
   'Advocacy','2026-11-23 08:00:00+03','Nairobi CBD',true,NULL,NULL,NULL,NULL,'Gender Equity'),
  ('Inter-Universities National Debate','The premier inter-campus debate competition.',
   'Top campus debaters face off on the defining issues of our generation including governance, AI, climate, mental health and the youth economy. National finalists earn scholarships and mentorship.',
   'Debate','2027-03-21 09:00:00+03','To be announced',true,NULL,NULL,NULL,NULL,'Civic Education');

INSERT INTO public.articles (title, slug, excerpt, body, category, status, published_at)
VALUES
  ('How we protect your data','data-protection',
   'Your information is encrypted, access-controlled and never sold. Here is exactly how the Nexus keeps you safe.',
   E'## Our promise\n\nThe Inter-Universities Nexus Platform takes student data seriously. Here is exactly what happens to the information you share with us.\n\n### What we collect\nName, email, university, and (optionally) whether you live with a disability so we can build a more inclusive community. Nothing more is required to get your Member ID.\n\n### Where it lives\nAll data is stored on encrypted, access-controlled databases. Passwords are never stored in plain text. Sessions are signed and time-limited.\n\n### Who can see it\n- Your public profile: name, university and Member ID, visible in the members directory.\n- Private to you: phone, email, disability status. Only you and verified platform admins can ever see these.\n- Never shared: we do not sell, rent or trade student data with third parties. Ever.\n\n### Your rights\nYou can update or delete your profile at any time. Email uninexusplatformke@gmail.com to request a full export or full deletion of your account.',
   'policy','published', now())
ON CONFLICT (slug) DO NOTHING;
