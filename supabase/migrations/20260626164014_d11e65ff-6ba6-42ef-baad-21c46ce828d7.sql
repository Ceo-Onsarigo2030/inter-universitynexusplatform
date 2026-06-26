
-- Service role: full access to everything
GRANT ALL ON public.programs, public.feedback, public.suggestions, public.articles,
              public.universities, public.university_votes, public.profiles,
              public.user_roles, public.event_rsvps, public.partner_inquiries,
              public.feedback_reports TO service_role;

-- Authenticated users (RLS still applies)
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.programs, public.feedback, public.suggestions, public.articles,
  public.universities, public.university_votes, public.profiles,
  public.user_roles, public.event_rsvps, public.partner_inquiries,
  public.feedback_reports TO authenticated;

-- Anonymous (public website visitors) — read public content + post feedback/suggestions/votes/inquiries
GRANT SELECT ON public.programs, public.feedback, public.suggestions, public.articles,
                 public.universities, public.university_votes, public.profiles TO anon;
GRANT INSERT ON public.feedback, public.suggestions, public.university_votes,
                 public.partner_inquiries, public.feedback_reports TO anon;

-- Sequences used by inserts
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
