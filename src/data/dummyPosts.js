/**
 * Static dummy dataset of 10 realistic career and job-search posts.
 * TODO: Replace with GET /api/v1/posts when Spring Boot backend API is integrated.
 */

export const dummyPosts = [
  {
    id: "post_1",
    author: {
      name: "Sarah Jenkins",
      handle: "@sarah_j",
      role: "Senior Product Designer @ Stripe",
      initials: "SJ",
      avatarBg: "bg-emerald-700",
    },
    timestamp: "2h ago",
    content:
      "Just wrapped up redesigning our checkout workflow! 🚀 A major takeaway: simplifying form fields by 30% led to a 14% increase in completion rate. Always focus on user clarity over complex layouts. What's your top UX tip for 2026?",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    likesCount: 142,
    commentsCount: 28,
    tags: ["UXDesign", "ProductDesign", "Stripe"],
  },
  {
    id: "post_2",
    author: {
      name: "Devon Cole",
      handle: "@devon_c",
      role: "Full Stack Engineer | Ex-Meta",
      initials: "DC",
      avatarBg: "bg-amber-600",
    },
    timestamp: "4h ago",
    content:
      "After 3 weeks of tailoring resumes and practicing system design, I just signed an offer with a series B AI startup! 🎉 Big thanks to the SkillCart community for the mock interview feedback. Never underestimate the power of structured prep!",
    image: null,
    likesCount: 389,
    commentsCount: 76,
    tags: ["CareerWin", "SoftwareEngineering", "JobSearch"],
  },
  {
    id: "post_3",
    author: {
      name: "SkillCart Team",
      handle: "@skillcart_official",
      role: "Official Updates",
      initials: "SC",
      avatarBg: "bg-[#123c2c]",
    },
    timestamp: "6h ago",
    content:
      "💡 Quick Resume Tip: Modern ATS screening algorithms prioritize quantified results over generic responsibility bullet points. Instead of writing 'Responsible for improving app speed', try 'Optimized bundle size by 35%, reducing load time by 1.2s'.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    likesCount: 512,
    commentsCount: 43,
    tags: ["ATSHacks", "ResumeTips", "CareerAdvice"],
  },
  {
    id: "post_4",
    author: {
      name: "Elena Rostova",
      handle: "@elena_dev",
      role: "Lead Frontend Architect @ Vercel",
      initials: "ER",
      avatarBg: "bg-purple-700",
    },
    timestamp: "9h ago",
    content:
      "React 19 Server Actions & View Transitions have completely changed how I think about layout state management. Building seamless, instant-loading SaaS UI without client bloat feels amazing. Anyone else shipping React 19 in production yet?",
    image: null,
    likesCount: 215,
    commentsCount: 34,
    tags: ["ReactJS", "WebDev", "Frontend"],
  },
  {
    id: "post_5",
    author: {
      name: "Marcus Vance",
      handle: "@marcus_v",
      role: "Engineering Director",
      initials: "MV",
      avatarBg: "bg-blue-600",
    },
    timestamp: "12h ago",
    content:
      "We're hiring! 📣 Opening 4 remote positions for Senior Backend Engineers (Java / Spring Boot / PostgreSQL). We care deeply about clean code, high concurrency, and team autonomy. DM me or check out our careers page!",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    likesCount: 430,
    commentsCount: 91,
    tags: ["Hiring", "Java", "SpringBoot", "RemoteJobs"],
  },
  {
    id: "post_6",
    author: {
      name: "Priya Sharma",
      handle: "@priya_tech",
      role: "Data Scientist @ Google",
      initials: "PS",
      avatarBg: "bg-rose-600",
    },
    timestamp: "1d ago",
    content:
      "Demystifying AI for job seekers: AI isn't here to replace engineers—it's here to amplify engineers who know how to ask the right questions. Master prompt structuring and core fundamentals together.",
    image: null,
    likesCount: 184,
    commentsCount: 19,
    tags: ["AI", "DataScience", "CareerGrowth"],
  },
  {
    id: "post_7",
    author: {
      name: "Alex Rivera",
      handle: "@alex_r",
      role: "DevOps Engineer @ AWS",
      initials: "AR",
      avatarBg: "bg-teal-700",
    },
    timestamp: "1d ago",
    content:
      "Automated CI/CD pipelines are your best friend. Cut down our staging deployment cycle from 45 minutes to 4 minutes flat. Happy deployment Friday everyone! ☕",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    likesCount: 97,
    commentsCount: 12,
    tags: ["DevOps", "CI_CD", "AWS"],
  },
  {
    id: "post_8",
    author: {
      name: "Chloe Bennett",
      handle: "@chloe_b",
      role: "Talent Acquisition Lead @ Notion",
      initials: "CB",
      avatarBg: "bg-[#19714e]",
    },
    timestamp: "2d ago",
    content:
      "What recruiters look for in the first 7 seconds of reviewing a application:\n1. Clear target title & summary\n2. Relevant tech stack matching the JD\n3. Scannable bullet hierarchy\n4. Links to live portfolio or GitHub repositories.",
    image: null,
    likesCount: 620,
    commentsCount: 88,
    tags: ["Recruiting", "HiringTips", "InterviewPrep"],
  },
  {
    id: "post_9",
    author: {
      name: "Liam O'Connor",
      handle: "@liam_oc",
      role: "Cloud Architect",
      initials: "LO",
      avatarBg: "bg-cyan-700",
    },
    timestamp: "2d ago",
    content:
      "Just passed my AWS Certified Solutions Architect Professional exam! 📜 3 months of late-night practice exams paid off. Onwards to Kubernetes CKA next!",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    likesCount: 310,
    commentsCount: 45,
    tags: ["AWS", "Cloud", "Certification"],
  },
  {
    id: "post_10",
    author: {
      name: "Maya Lin",
      handle: "@maya_lin",
      role: "Engineering Manager @ Figma",
      initials: "ML",
      avatarBg: "bg-indigo-600",
    },
    timestamp: "3d ago",
    content:
      "Great 1-on-1 conversations are built on active listening and actionable goal setting. Here is a framework I use to help engineers track their path to promotion every quarter.",
    image: null,
    likesCount: 265,
    commentsCount: 31,
    tags: ["Leadership", "Management", "CareerPath"],
  },
];
