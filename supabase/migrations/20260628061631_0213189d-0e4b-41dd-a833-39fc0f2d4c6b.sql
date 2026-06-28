
-- 1. Grant Data API access to public tables (was missing -> queries silently failed)
GRANT SELECT ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;

GRANT SELECT, INSERT ON public.feedback TO anon, authenticated;
GRANT UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;

GRANT SELECT, INSERT ON public.suggestions TO anon, authenticated;
GRANT UPDATE, DELETE ON public.suggestions TO authenticated;
GRANT ALL ON public.suggestions TO service_role;

GRANT INSERT ON public.feedback_reports TO anon, authenticated;
GRANT SELECT, UPDATE ON public.feedback_reports TO authenticated;
GRANT ALL ON public.feedback_reports TO service_role;

GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;

GRANT SELECT ON public.universities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.universities TO authenticated;
GRANT ALL ON public.universities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;

GRANT INSERT ON public.university_votes TO anon, authenticated;
GRANT SELECT ON public.university_votes TO authenticated;
GRANT ALL ON public.university_votes TO service_role;

GRANT INSERT ON public.partner_inquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON public.partner_inquiries TO authenticated;
GRANT ALL ON public.partner_inquiries TO service_role;

GRANT INSERT ON public.gala_registrations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.gala_registrations TO authenticated;
GRANT ALL ON public.gala_registrations TO service_role;

-- Sequence access (for tables with serial/identity columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Restrict gala_registrations SELECT (was publicly readable -> PII exposure)
DROP POLICY IF EXISTS "Public can read registrations" ON public.gala_registrations;
CREATE POLICY "Admins view registrations" ON public.gala_registrations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow public gate-pass lookup by pass_id only (acts as bearer token)
CREATE OR REPLACE FUNCTION public.get_gala_pass(p_pass_id text)
RETURNS TABLE (pass_id text, full_name text, email text, institution text, ticket_tier text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pass_id, full_name, email, institution, ticket_tier, created_at
  FROM public.gala_registrations WHERE pass_id = p_pass_id LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_gala_pass(text) TO anon, authenticated;

-- 3. Restrict profiles SELECT (was readable by any authenticated user -> PII exposure)
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
-- Admin SELECT is covered by the existing "Admins manage profiles" ALL policy.
