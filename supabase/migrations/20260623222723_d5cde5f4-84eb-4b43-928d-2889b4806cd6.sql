
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  university TEXT NOT NULL,
  member_number INT NOT NULL UNIQUE,
  member_id TEXT NOT NULL UNIQUE,
  course TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Member number sequence
CREATE SEQUENCE public.member_number_seq START 1001;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Has role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Admin policies on profiles
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Handle new user trigger: create profile + assign member_id + auto-admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _num INT;
  _full_name TEXT;
  _university TEXT;
BEGIN
  _num := nextval('public.member_number_seq');
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _university := COALESCE(NEW.raw_user_meta_data->>'university', 'Not specified');

  INSERT INTO public.profiles (id, full_name, university, member_number, member_id)
  VALUES (NEW.id, _full_name, _university, _num, 'UNX-2026-' || LPAD(_num::TEXT, 5, '0'));

  -- Auto-promote admin email
  IF NEW.email = 'b.aconnect254@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Universities
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.universities TO anon, authenticated;
GRANT ALL ON public.universities TO service_role;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are public" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Admins manage universities" ON public.universities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed common Kenyan universities
INSERT INTO public.universities (name, location) VALUES
  ('University of Nairobi', 'Nairobi'),
  ('Kenyatta University', 'Nairobi'),
  ('Jomo Kenyatta University of Agriculture and Technology', 'Juja'),
  ('Moi University', 'Eldoret'),
  ('Egerton University', 'Nakuru'),
  ('Strathmore University', 'Nairobi'),
  ('United States International University - Africa', 'Nairobi'),
  ('Maseno University', 'Kisumu'),
  ('Technical University of Kenya', 'Nairobi'),
  ('Kenya Methodist University', 'Meru'),
  ('Mount Kenya University', 'Thika'),
  ('Multimedia University of Kenya', 'Nairobi'),
  ('Daystar University', 'Nairobi'),
  ('Africa Nazarene University', 'Nairobi'),
  ('Dedan Kimathi University of Technology', 'Nyeri');

-- Programs & Events
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  location TEXT,
  cover_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are public" ON public.programs FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage programs" ON public.programs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.programs (title, description, category, event_date, location) VALUES
  ('Inter-Universities Innovation Summit 2026', 'A flagship summit bringing together student innovators, entrepreneurs, and thought leaders across Kenya to share ideas, pitch projects and build partnerships.', 'Summit', '2026-08-15 09:00:00+03', 'KICC, Nairobi'),
  ('Youth Leadership & Governance Forum', 'A national forum equipping student leaders with practical leadership, policy engagement and civic education skills.', 'Forum', '2026-09-20 10:00:00+03', 'University of Nairobi'),
  ('Tech & AI Bootcamp', 'Hands-on bootcamp introducing students to AI tools, prompt engineering and building real products.', 'Bootcamp', '2026-10-05 08:30:00+03', 'Strathmore University'),
  ('Creative Arts & Talent Showcase', 'A celebration of student creativity featuring music, spoken word, fashion, dance and visual arts.', 'Showcase', '2026-11-15 18:00:00+03', 'Kenyatta University'),
  ('Mental Health Awareness Week', 'A week of conversations, workshops and free counselling sessions on campus mental wellness.', 'Wellness', '2026-07-10 09:00:00+03', 'Multi-Campus');

-- Feedback wall
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  university TEXT,
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feedback TO anon, authenticated;
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved feedback is public" ON public.feedback FOR SELECT USING (approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can post feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
