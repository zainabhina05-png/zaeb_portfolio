import type { SkillCategory } from "./types";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    categoryName: "Game Dev & 3D Graphics",
    skills: [
      "C++ (OOP & Memory)",
      "Three.js / WebGL",
      "React Three Fiber",
      "Godot 4 / GDScript",
      "ECS Architecture",
      "Game Physics & Loops",
      "A* & AI Behavior Trees",
      "GLSL Shaders"
    ]
  },
  {
    categoryName: "Frontend Engineering",
    skills: [
      "React 19 / React.js",
      "Next.js 15 (App Router)",
      "TypeScript",
      "Tailwind CSS v4",
      "Zustand State",
      "GSAP Motion",
      "HTML5 Canvas API",
      "Responsive UI/UX"
    ]
  },
  {
    categoryName: "Backend & Cloud",
    skills: [
      "Node.js / Express.js",
      "RESTful APIs",
      "MongoDB / Mongoose",
      "PostgreSQL / SQL",
      "Snowflake Data Warehouse",
      "JWT Authentication",
      "WebSockets / Real-Time"
    ]
  },
  {
    categoryName: "AI Integration & Tools",
    skills: [
      "Ollama (Local LLMs)",
      "RAG & Vector Search",
      "LangChain Basics",
      "Git / GitHub",
      "Vercel Deployment",
      "Docker Basics",
      "Python / Pandas"
    ]
  }
];


// Re-export everything from data folder
export { PROJECT_PLACEHOLDERS } from "./data/projects";
export { EXPERIENCE_PLACEHOLDERS, LEADERSHIP_PLACEHOLDERS } from "./data/experience";
export { EDUCATION_PLACEHOLDERS } from "./data/education";
export { CERTIFICATION_PLACEHOLDERS } from "./data/certifications";
