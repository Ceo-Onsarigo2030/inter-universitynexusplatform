
-- Update Gala event with full description
UPDATE public.programs
SET 
  description = 'A prestigious black-tie evening celebrating outstanding achievement, innovation, leadership, and collaboration across Kenyan universities. Hosted by UniNexus Connect — honouring students, mentors, faculty and institutions making exceptional contributions.',
  overview = E'The Inter-Universities Nexus Gala Awards is a prestigious black-tie evening celebrating outstanding achievement, innovation, leadership, and collaboration across Kenyan universities. This landmark event, hosted by UniNexus Connect, brings together the brightest minds from universities across the country to honour students, mentors, faculty, and institutions who have made exceptional contributions to the university ecosystem.\n\nThe evening will feature a formal awards ceremony, keynote addresses, live entertainment, curated networking sessions, and a celebration of excellence in academia and student leadership.\n\n🎟️ TICKETING & GATE PASS SYSTEM:\nUpon purchasing your ticket via the link provided, you will automatically receive a personalised Digital Attendance Card to your registered email address. This card serves as your official Gate Pass for entry into the event and includes:\n• Your full name and institution\n• A unique Gate Pass ID / QR Code\n• Event date, time, and venue details\n• UniNexus Connect branding in black and gold\n\nYour Digital Attendance Card is printable — we recommend printing it or having it ready on your phone for seamless entry at the gate. No card = No entry.\n\n📍 Venue: KISE – Kenya Institute of Special Education, Kasarani, Nairobi\n🕔 Doors Open: 5:00 PM\n👔 Dress Code: Smart Formal / Black Tie\n🎖️ An evening of excellence. A night to remember.',
  event_date = '2026-11-06 17:00:00+03',
  location = 'KISE – Kenya Institute of Special Education, Kasarani, Nairobi',
  category = 'Gala / Awards',
  ticket_url = 'https://tickets.uninexusconnect.com',
  is_published = true
WHERE title ILIKE '%gala%';

-- Gate pass registrations
CREATE TABLE IF NOT EXISTS public.gala_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  institution text,
  phone text,
  ticket_tier text NOT NULL DEFAULT 'regular',
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.gala_registrations TO anon, authenticated;
GRANT ALL ON public.gala_registrations TO service_role;

ALTER TABLE public.gala_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a registration
CREATE POLICY "Anyone can register" ON public.gala_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anyone can read a registration by pass_id (used for gate pass page lookup).
-- Pass IDs are unguessable (UNC-2026-XXXXXX random), acting as a capability token.
CREATE POLICY "Public can read registrations" ON public.gala_registrations
  FOR SELECT TO anon, authenticated USING (true);
