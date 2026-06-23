
-- Restrict SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;

-- Replace permissive feedback insert with basic validation
DROP POLICY "Anyone can post feedback" ON public.feedback;
CREATE POLICY "Anyone can post valid feedback" ON public.feedback
  FOR INSERT
  WITH CHECK (
    char_length(trim(message)) BETWEEN 3 AND 2000
    AND char_length(trim(name)) BETWEEN 1 AND 100
  );
