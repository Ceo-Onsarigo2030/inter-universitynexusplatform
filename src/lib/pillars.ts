export type Pillar = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  deep: string;
  events: { title: string; when: string; what: string }[];
  accent: string;
  icon: string;
};

export const PILLARS: Pillar[] = [
  {
    slug: "disability-inclusion",
    title: "Disability Inclusion & Accessibility",
    tagline: "No campus left behind.",
    summary:
      "We champion a higher-education space where students with disabilities lead, learn and thrive on equal footing — through accessible events, assistive-tech access and policy advocacy.",
    deep:
      "Across Kenyan campuses, students with disabilities still navigate inaccessible lecture halls, scarce assistive technology and exam systems that were not built with them in mind. Inter-Universities Nexus partners with disability rights organisations, learning institutions like KISE, and student leaders living with disabilities to co-design programs that move from charity to genuine inclusion. We track accessibility commitments by university, publish progress, and elevate disabled students into leadership rooms where decisions actually get made.",
    events: [
      { title: "Accessibility Audit Bootcamp", when: "Feb 2027", what: "Hands-on training for student leaders to audit their campuses against the 2003 Persons with Disabilities Act." },
      { title: "Inclusive Tech Showcase", when: "Apr 2027", what: "Demo day for assistive-tech startups built by and for students with disabilities." },
      { title: "Sign-Language Leadership Camp", when: "Jul 2027", what: "Three-day camp for Deaf student leaders, with KSL interpretation throughout." },
    ],
    accent: "from-amber-400 to-yellow-600",
    icon: "Accessibility",
  },
  {
    slug: "talent-innovation",
    title: "Talent & Innovation Development",
    tagline: "Where future-makers get seen.",
    summary:
      "From music and art to AI prototypes and startup pitches, we give Kenya's most gifted students a stage, a network and a runway.",
    deep:
      "Talent without exposure dies quietly. We exist so it does not. The Nexus runs national showcases, pitch competitions and creator residencies that put student talent in front of investors, recruiters, labels and industry leaders. We back the winners with cash prizes, mentorship and warm introductions, and we follow up — because one trophy night is not a career.",
    events: [
      { title: "Inter-Universities Nexus Gala Awards", when: "6 Nov 2026", what: "The flagship night of recognition for top student talent, innovators and changemakers." },
      { title: "Campus Creators Pitch Day", when: "May 2027", what: "Top 20 student-built startups pitch to a panel of Kenyan VCs and angel investors." },
      { title: "National Talent Showcase", when: "Aug 2027", what: "Music, dance, spoken word and fashion from across every region of Kenya." },
    ],
    accent: "from-rose-500 to-orange-500",
    icon: "Sparkles",
  },
  {
    slug: "gender-equity",
    title: "Gender Equity, Inclusion & Empowerment",
    tagline: "Safe campuses. Equal seats.",
    summary:
      "We mobilise students around gender-based violence prevention, sexual reproductive health rights and equal economic opportunity — anchored in ratified UN and AU instruments.",
    deep:
      "Gender equity is not a slogan to us. It is a measurable outcome: how safe a woman feels walking back to her hostel, how many female student leaders sit on senate committees, how survivors are believed and supported. We anchor our work in instruments Kenya has ratified — CEDAW, the Maputo Protocol, the Sexual Offences Act — and we translate them into campus-level programs, peer-led training and direct action during the global 16 Days of Activism.",
    events: [
      { title: "16 Days of Activism CBD Walk", when: "23 Nov 2026", what: "Solidarity walk through Nairobi CBD against gender-based violence." },
      { title: "Sexual Assault Awareness Month Forum", when: "Apr 2027", what: "Survivor-centred dialogues, legal clinics and SRH services on campuses." },
      { title: "Women in Leadership Mentor Circle", when: "Quarterly", what: "Female students paired with senior women leaders across sectors." },
    ],
    accent: "from-pink-500 to-fuchsia-600",
    icon: "Heart",
  },
  {
    slug: "mental-health",
    title: "Mental Health Awareness & Wellness Advocacy",
    tagline: "It is okay to not be okay.",
    summary:
      "Suicide is now a leading cause of death among Kenyan students. We bring mental wellness out of the shadows through walks, peer-counselling training and access to affordable therapy.",
    deep:
      "Behind every academic transcript is a student carrying invisible weight. Anxiety, depression, financial pressure, post-traumatic stress, loneliness — the data tells us they are everywhere, and the silence around them costs lives. We partner with the Kenya Counselling and Psychological Association, university wellness offices and licensed practitioners to make mental health support normal, affordable and stigma-free on every campus we touch.",
    events: [
      { title: "Annual Mental Health Walk", when: "Oct 2027 (World Mental Health Month)", what: "A national walk and free-screening day across major campuses." },
      { title: "Peer Counsellor Certification", when: "Mar 2027", what: "Six-week certified training preparing students to support peers and refer safely." },
      { title: "Wellness Wednesdays", when: "Weekly", what: "Free online talks with therapists and recovery advocates." },
    ],
    accent: "from-emerald-400 to-teal-600",
    icon: "Brain",
  },
  {
    slug: "civic-leadership",
    title: "GenZ Civic Education, Leadership & Governance",
    tagline: "A generation that knows the constitution.",
    summary:
      "We equip the next generation of Kenyan leaders to understand the constitution, engage policy and run for office — fearlessly, ethically and well-informed.",
    deep:
      "Kenya's GenZ is the most politically awake generation in our history, but raw energy without civic literacy can be redirected, misled, or burnt out. We build that literacy: constitutional rights, devolution, public finance, the legislative process, peaceful organising and digital civic safety. We host debates, simulations of parliament and county assemblies, and direct engagement with sitting leaders — so that when this generation shows up, it shows up prepared.",
    events: [
      { title: "Inter-Universities National Debate", when: "21 Mar 2027", what: "Kenya's premier inter-campus debate on the defining policy issues of the day." },
      { title: "Youth Policy & Governance Summit", when: "Jun 2027", what: "Students draft and present policy briefs to MPs and Senate committees." },
      { title: "Digital Civic Safety Bootcamp", when: "Sep 2027", what: "Tools, rights and tactics for organising safely online during civic action." },
    ],
    accent: "from-blue-500 to-indigo-700",
    icon: "Scale",
  },
];