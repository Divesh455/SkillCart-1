/**
 * Mock data structure matching backend API expectation for POST /api/v1/resume/analyze
 */

export const mockResumeAnalysis = {
  overall_score: 86,
  summary:
    "Strong technical profile with 4+ years of software development experience. High ATS parsability with clean structural formatting. Focus on quantifying key accomplishments to maximize recruiter response rate.",
  scores: [
    { category: "Grammar", score: 92, status: "Excellent" },
    { category: "Structure", score: 88, status: "Good" },
    { category: "Formatting", score: 95, status: "Excellent" },
    { category: "Content Impact", score: 76, status: "Needs Improvement" },
    { category: "ATS Optimization", score: 84, status: "Good" },
  ],
  grammar_analysis: {
    title: "Grammar & Tone",
    bullet_insights: [
      "Strong active voice and confident action verbs (e.g. Architected, Spearheaded, Optimized)",
      "Consistent past-tense usage for completed roles and present-tense for active role",
      "No major spelling or grammatical errors detected",
    ],
  },
  structure_analysis: {
    title: "Structure & Hierarchy",
    bullet_insights: [
      "Standard reverse-chronological layout easily parsed by all major ATS platforms",
      "Section headers are clearly labeled without ambiguous naming",
      "Contact information is positioned at the top without header/footer embedding",
    ],
  },
  formatting_analysis: {
    title: "Formatting & Style",
    bullet_insights: [
      "Clean, readable typography with consistent font hierarchy and line height",
      "Standard 0.75-inch margins with proper bullet spacing throughout",
      "Free of complex tables, columns, or graphic elements that break ATS parsing",
    ],
  },
  content_analysis: {
    title: "Content & Impact",
    bullet_insights: [
      "Technical skills are well categorized into Frontend, Backend, and Tools",
      "Recommendation: Add quantifiable metrics (e.g., '% performance boost', '$ cost saved')",
      "Project descriptions effectively detail problem, tech stack, and deliverable",
    ],
  },
  ats_analysis: {
    title: "ATS Compatibility",
    bullet_insights: [
      "Contains 18 high-relevance industry keywords for Full Stack & Frontend roles",
      "Contact info format passes 100% of standard parser regex checks",
      "File format and structure are 100% compatible with Workday, Greenhouse, and Lever",
    ],
  },
  strengths: [
    "High overall ATS parsability score (86/100)",
    "Comprehensive and well-structured skills taxonomy",
    "Clean single-column structure preferred by modern recruiters",
    "Strong project section demonstrating hands-on technical capabilities",
  ],
  weaknesses: [
    "Work experience bullet points lack quantitative metrics and ROI data",
    "Summary section is slightly generic and could align more closely with target role",
    "Missing a few secondary keywords like 'CI/CD Pipelines' and 'Unit Testing'",
  ],
  suggestions: [
    {
      category: "High Impact",
      text: "Quantify work outcomes with metrics (e.g., 'Reduced initial load time by 40% using code splitting')",
      priority: "high",
    },
    {
      category: "Quick Wins",
      text: "Add target keywords 'Docker', 'Jest/Testing Library', and 'CI/CD' to your skills list",
      priority: "medium",
    },
    {
      category: "Formatting Fixes",
      text: "Ensure all date ranges follow the standardized format: 'MMM YYYY – MMM YYYY'",
      priority: "low",
    },
  ],
  targetJobTitle: "Senior Full Stack Engineer",
  skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "PostgreSQL", "REST APIs", "GraphQL"],
};
