GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.programs, public.feedback, public.suggestions, public.articles, public.universities, public.university_vote_counts TO anon, authenticated;
GRANT INSERT ON public.feedback, public.suggestions, public.university_votes, public.partner_inquiries, public.feedback_reports, public.gala_registrations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.user_roles, public.programs, public.feedback, public.suggestions, public.articles, public.universities, public.event_rsvps, public.partner_inquiries, public.feedback_reports, public.gala_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.university_votes TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_gala_pass(text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Published programs are public" ON public.programs;
CREATE POLICY "Published programs are public"
ON public.programs
FOR SELECT
TO public
USING (is_published = true);

DROP POLICY IF EXISTS "Approved feedback is public" ON public.feedback;
CREATE POLICY "Approved feedback is public"
ON public.feedback
FOR SELECT
TO public
USING (approved = true);

DROP POLICY IF EXISTS "Approved suggestions public" ON public.suggestions;
CREATE POLICY "Approved suggestions public"
ON public.suggestions
FOR SELECT
TO public
USING (approved = true);

DROP POLICY IF EXISTS "Published articles public" ON public.articles;
CREATE POLICY "Published articles public"
ON public.articles
FOR SELECT
TO public
USING (status = 'published');

DROP POLICY IF EXISTS "Anyone can view votes" ON public.university_votes;
ALTER VIEW public.university_vote_counts SET (security_invoker = false);
GRANT SELECT ON public.university_vote_counts TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS TABLE (
  registered_members bigint,
  universities_on_board bigint,
  members_with_disability bigint,
  published_programs bigint,
  published_articles bigint,
  approved_feedback bigint,
  approved_suggestions bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.profiles),
    (SELECT count(*) FROM public.universities),
    (SELECT count(*) FROM public.profiles WHERE has_disability = true),
    (SELECT count(*) FROM public.programs WHERE is_published = true),
    (SELECT count(*) FROM public.articles WHERE status = 'published'),
    (SELECT count(*) FROM public.feedback WHERE approved = true),
    (SELECT count(*) FROM public.suggestions WHERE approved = true);
$$;
REVOKE ALL ON FUNCTION public.platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.platform_stats() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.next_member_number_for_backfill()
RETURNS integer
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.member_number_seq')::integer;
$$;
REVOKE ALL ON FUNCTION public.next_member_number_for_backfill() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_member_number_for_backfill() TO service_role;