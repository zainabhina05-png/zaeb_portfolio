import type { ExperienceItem, LeadershipItem } from "../types";

export const EXPERIENCE_PLACEHOLDERS: ExperienceItem[] = [
  {
    id: "exp-01",
    rolePlaceholder: "Open Source Contributor",
    companyPlaceholder: "Elite Coders: Summer of Code 2026",
    periodPlaceholder: "2026 — PRESENT",
    descriptionPlaceholder: "Ongoing contributor to a fast-moving open-source MERN codebase, merging 107+ pull requests that resolved production bugs, refactored legacy components, and strengthened React component architecture. Reviewed incoming pull requests for code quality and best practices, providing structured feedback to help contributors ship cleaner code.",
    technologies: ["React.js", "Node.js", "MongoDB", "Git", "GitHub", "Code Review", "Agile/Scrum", "AI-Assisted Development"]
  },
  {
    id: "exp-02",
    rolePlaceholder: "MERN Stack Developer (Front-End Focus)",
    companyPlaceholder: "Tech Hub Innovation, Faisalabad",
    periodPlaceholder: "2024",
    descriptionPlaceholder: "Built, tested, and deployed full-stack production applications end-to-end. Developed Yalla, a live large-scale UAE-based e-commerce platform with reusable React components, REST API integrations, MongoDB schemas, and SSR/SSG with Next.js. The live storefront's real-user Interaction to Next Paint (INP) measures 68ms, well within Google's 200ms 'good' threshold.",
    technologies: ["React.js", "Next.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "Tailwind CSS", "SSR/SSG"]
  }

export const LEADERSHIP_PLACEHOLDERS: LeadershipItem[] = [
  {
    id: "lead-01",
    rolePlaceholder: "Community Influencer",
    organizationPlaceholder: "Microsoft Student Ambassador Program",
    periodPlaceholder: "2026 — PRESENT",
    descriptionPlaceholder: "Contribute through technical content creation, event promotion, and campus outreach, communicating technical concepts clearly to a broad student audience."
  },
  {
    id: "lead-02",
    rolePlaceholder: "Campus Ambassador",
    organizationPlaceholder: "National Incubation Center Faisalabad (NICF)",
    periodPlaceholder: "2026 — PRESENT",
    descriptionPlaceholder: "Selected as Campus Ambassador for NICF's ambassador team, representing the incubation center's programs and initiatives on campus."
  },
  {
    id: "lead-03",
    rolePlaceholder: "Member of Cohort",
    organizationPlaceholder: "Summer Upskill Series, AtomCamp × GDG on Campus (IM Sciences)",
    periodPlaceholder: "2026",
    descriptionPlaceholder: "Completed a multi-track upskilling program covering personal profile/brand building, web development, LinkedIn optimization, freelancing fundamentals, agentic AI workflows, and AI image generation."
  }
];

export const EXPERIENCE_BOOK_ENTRIES = [
  ...EXPERIENCE_PLACEHOLDERS.map((entry) => ({ type: "experience" as const, entry })),
  ...LEADERSHIP_PLACEHOLDERS.map((entry) => ({ type: "leadership" as const, entry })),
];
