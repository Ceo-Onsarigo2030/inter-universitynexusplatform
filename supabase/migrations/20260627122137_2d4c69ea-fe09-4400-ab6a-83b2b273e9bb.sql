
-- 1) profiles: drop public SELECT, allow signed-in users only
DROP POLICY IF EXISTS "Profiles directory view" ON public.profiles;
CREATE POLICY "Authenticated can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 2) university_votes: hide fingerprint from public; expose aggregated counts via a view
DROP POLICY IF EXISTS "Anyone can view votes" ON public.university_votes;
CREATE POLICY "Admins read votes" ON public.university_votes
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.university_vote_counts
WITH (security_invoker = on) AS
  SELECT university_name, count(*)::int AS votes
  FROM public.university_votes
  GROUP BY university_name;

GRANT SELECT ON public.university_vote_counts TO anon, authenticated;
REVOKE SELECT ON public.university_votes FROM anon;
