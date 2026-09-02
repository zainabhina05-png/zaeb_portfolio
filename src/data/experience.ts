import type { ExperienceItem, LeadershipItem } from "../types";

export const EXPERIENCE_ROW_1: ExperienceItem[] = [
  {
    id: "exp-01",
    rolePlaceholder: "Full-Stack MERN Engineer",
    companyPlaceholder: "Tech Hub Innovation",
    periodPlaceholder: "2024 — PRESENT",
    descriptionPlaceholder: "Architected and delivered scalable production systems including live UAE client e-commerce platforms. Engineered high-throughput Express REST APIs, optimized complex MongoDB schemas, and integrated seamless payment & authentication workflows.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB Atlas", "REST APIs", "Tailwind CSS", "JWT", "Postman"]
  },
  {
    id: "exp-02",
    rolePlaceholder: "Frontend & Motion UI Engineer",
    companyPlaceholder: "Tech Hub / Hyper Nexus",
    periodPlaceholder: "2024",
    descriptionPlaceholder: "Developed high-fidelity user interfaces for the Hypernexis.tech enterprise ecosystem. Built fluid GSAP micro-interactions, responsive design systems with Tailwind & SCSS, and optimized Web Vitals for sub-second page loads.",
    technologies: ["React.js", "Next.js", "TypeScript", "GSAP", "Tailwind CSS", "SCSS", "JavaScript ES6+"]
  },
  {
    id: "exp-03",
    rolePlaceholder: "Interactive UI Systems & Component Labs",
    companyPlaceholder: "Independent / UI Systems",
    periodPlaceholder: "2024 — PRESENT",
    descriptionPlaceholder: "Built atomic component design systems with strict accessibility, custom CSS variable token pipelines, state machine driven modal flows, and resilient client-side caching strategies for complex web apps.",
    technologies: ["TypeScript", "Tailwind CSS", "XState", "Framer Motion", "Storybook", "Vite"]
  }
];

export const EXPERIENCE_ROW_2: ExperienceItem[] = [
  {
    id: "exp-04",
    rolePlaceholder: "3D WebGL & Game Systems Architect",
    companyPlaceholder: "Independent / Creative Engineering",
    periodPlaceholder: "2024 — PRESENT",
    descriptionPlaceholder: "Engineered browser-based 3D WebGL experiences (How_Ball 3D Runner) and C++ desktop game prototypes. Implemented custom GLSL vertex/fragment shaders, procedural level generation, collision physics engines, and local LLM AI agents via Ollama.",
    technologies: ["C++", "Three.js", "React Three Fiber", "GLSL Shaders", "SFML", "Zustand", "Ollama / AI"]
  },
  {
    id: "exp-05",
    rolePlaceholder: "Data Infrastructure & Backend Systems",
    companyPlaceholder: "Systems & Data Architecture",
    periodPlaceholder: "2024",
    descriptionPlaceholder: "Designed enterprise data pipelines (Logpose) migrating high-volume Snowflake analytical tables to Supabase / PostgreSQL. Implemented transaction pooling, automated schema mapping, Prisma ORM queries, and Dockerized microservice deployments.",
    technologies: ["Node.js", "TypeScript", "PostgreSQL", "Snowflake", "Supabase", "Prisma", "Docker", "CI/CD"]
  },
  {
    id: "exp-06",
    rolePlaceholder: "Open Source Contributor & Dev Community",
    companyPlaceholder: "Build In Public / Global Open Source",
    periodPlaceholder: "2024 — PRESENT",
    descriptionPlaceholder: "Active contributor to open-source codebases (WorkSphere, CampusConnect, LinkID) with merged PRs covering webhook engines, rate limiters, offline sync retries, and WebAuthn security. Mentoring aspiring Pakistani software engineers.",
    technologies: ["Git", "GitHub Actions", "WebSockets", "WebAuthn", "Vitest", "Jest", "Agile / Scrum"]
  }
];

export const EXPERIENCE_PLACEHOLDERS: ExperienceItem[] = [
  ...EXPERIENCE_ROW_1,
  ...EXPERIENCE_ROW_2,
];

export const LEADERSHIP_PLACEHOLDERS: LeadershipItem[] = [
  {
    id: "lead-01",
    rolePlaceholder: "Tech Community & Open Source Developer",
    organizationPlaceholder: "Build In Public / Open Source",
    periodPlaceholder: "2024 — PRESENT",
    descriptionPlaceholder: "Actively building and documenting projects in public across GitHub and LinkedIn. Sharing 3D web graphics, game engine architecture insights, and helping fellow Pakistani CS students get started with modern stacks."
  }
];

export const EXPERIENCE_BOOK_ENTRIES = [
  ...EXPERIENCE_PLACEHOLDERS.map((entry) => ({ type: "experience" as const, entry })),
  ...LEADERSHIP_PLACEHOLDERS.map((entry) => ({ type: "leadership" as const, entry })),
];
