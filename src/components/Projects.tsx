import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderGit2, ExternalLink, Github, Terminal, ShieldCheck, Layers, GitPullRequest, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";

interface CaseProject {
  id: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  stack: string[];
  metrics: string[];
  description: string;
  githubUrl: string;
  liveUrl: string;
  featured?: boolean;
}

const CASE_PROJECTS: CaseProject[] = [
  {
    id: "wordleforge",
    title: "WordleForge",
    tagline: "Hardened Production Wordle Architecture with Full Test Suite",
    category: "FULL STACK // SECURITY & TESTING",
    year: "2024",
    stack: ["Next.js", "TypeScript", "Clerk Auth", "Prisma ORM", "Neon PostgreSQL", "Zod", "Vitest"],
    metrics: [
      "96 Passing Vitest Unit & Integration Tests",
      "Strict Security Headers (CSP, CORS, CSRF Defense)",
      "Zod Schema Validation & In-Memory Rate Limiting",
    ],
    description: "Production-grade Wordle platform engineered beyond standard clones. Features hardened database pooling via Neon, zero-trust API validation, comprehensive test coverage, and real-time state synchronization.",
    githubUrl: "https://github.com/zaeb",
    liveUrl: "https://wordleforge.vercel.app",
    featured: true,
  },
  {
    id: "how-ball",
    title: "How Ball (3D Runner)",
    tagline: "High-Performance 3D WebGL Endless Runner Game Engine",
    category: "3D GRAPHICS // GAME SYSTEMS",
    year: "2024",
    stack: ["Next.js", "Three.js", "React Three Fiber", "GLSL Shaders", "Zustand", "Tailwind CSS"],
    metrics: [
      "Smooth 60fps WebGL Physics & Render Loop",
      "Procedural Dynamic Track & Collision Pipeline",
      "Custom Vertex & Fragment Shaders",
    ],
    description: "Interactive 3D WebGL endless runner demonstrating real-time browser game mechanics, procedural geometry generation, responsive camera tracking, and custom shader lighting graphs.",
    githubUrl: "https://github.com/zaeb",
    liveUrl: "https://howball.vercel.app",
    featured: true,
  },
  {
    id: "awaaznama",
    title: "Awaaznama",
    tagline: "Bilingual Urdu Voice-to-Form AI Application for Social Good",
    category: "AI PRODUCT // ACCESSIBILITY",
    year: "2024",
    stack: ["React", "Python FastAPI", "Whisper AI", "WhatsApp Business API", "Tailwind CSS"],
    metrics: [
      "Real-time Urdu & English Speech-to-Text Parsing",
      "Automated WhatsApp NGO Document Generation Pipeline",
      "Offline-first Voice Buffering & Form Autofill",
    ],
    description: "Empowers non-literate community members to dictate official legal and NGO forms in Urdu. Leverages fine-tuned speech models and automated document rendering pipelines.",
    githubUrl: "https://github.com/zaeb",
    liveUrl: "https://awaaznama.vercel.app",
  },
  {
    id: "logpose",
    title: "Logpose",
    tagline: "Enterprise Snowflake to Supabase Distributed Migration Tool",
    category: "DATA SYSTEMS // INFRASTRUCTURE",
    year: "2024",
    stack: ["Node.js", "TypeScript", "Snowflake SDK", "Supabase", "PostgreSQL Pooler", "Docker"],
    metrics: [
      "Zero Data-Loss High-Throughput Batch Processing",
      "Transaction Pooler Auto-Reconnection Resiliency",
      "Automated Schema Translation & Index Verification",
    ],
    description: "High-throughput data extraction and ingestion pipeline migrating heavy analytical Snowflake data warehouses into PostgreSQL transaction pools with zero downtime and verified record integrity.",
    githubUrl: "https://github.com/zaeb",
    liveUrl: "https://github.com/zaeb",
  },
];

const OPEN_SOURCE_CONTRIBUTIONS = [
  {
    repo: "WorkSphere",
    area: "Enterprise Workspace Suite",
    prs: "Tax export module, Discord webhook engine, rate limiting middleware, offline sync retry handler, WebAuthn cross-origin fix",
    status: "MERGED",
  },
  {
    repo: "CampusConnect",
    area: "Academic Management Platform",
    prs: "Real-time websocket notifications, course schedule conflict resolver, responsive table filters",
    status: "MERGED",
  },
  {
    repo: "linkid",
    area: "Developer Identity API",
    prs: "OAuth2 refresh token rotation fix, dynamic profile card SVG generator, rate limiter tests",
    status: "MERGED",
  },
];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const filters = ["ALL", "FULL STACK", "3D / GAME", "AI / ACCESSIBILITY", "DATA / INFRA", "FRONTEND", "C++ / SYSTEMS"];
  const filteredProjects = CASE_PROJECTS.filter((project) => {
    if (activeFilter === "ALL") return true;
    const haystack = `${project.category} ${project.title} ${project.stack.join(" ")}`.toUpperCase();
    if (activeFilter === "FULL STACK") return haystack.includes("FULL") || haystack.includes("BACKEND");
    if (activeFilter === "3D / GAME") return haystack.includes("3D") || haystack.includes("GAME") || haystack.includes("THREE");
    if (activeFilter === "AI / ACCESSIBILITY") return haystack.includes("AI") || haystack.includes("ACCESS") || haystack.includes("WHISPER");
    if (activeFilter === "DATA / INFRA") return haystack.includes("DATA") || haystack.includes("INFRA") || haystack.includes("SNOWFLAKE") || haystack.includes("SUPABASE");
    if (activeFilter === "FRONTEND") return haystack.includes("FRONTEND") || haystack.includes("REACT") || haystack.includes("NEXT") || haystack.includes("GSAP");
    return haystack.includes("C++") || haystack.includes("SYSTEM");
  });

  return (
    <section
      id="projects"
      className="relative py-28 px-6 md:px-16 bg-[#0a0a0d] text-[#f2ece2] border-t border-[#2e2b2a] overflow-hidden"
      aria-label="Engineering Projects"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-[#e0455f]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#8c2438]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2e2b2a] pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-[#e0455f] uppercase font-semibold">
              <Terminal size={14} />
              <span>05 // CASE ARCHIVES // PRODUCTION BUILDS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f2ece2] font-['Space_Grotesk']">
              FEATURED PROJECTS
            </h2>
          </div>

          <span className="font-mono text-xs text-[#a89f91] flex items-center gap-2 bg-[#140e15] border border-[#2e2b2a] px-3 py-1.5 rounded-lg">
            <FolderGit2 size={14} className="text-[#e0455f]" />
            <span>4 CORE CASE STUDIES + OPEN SOURCE</span>
          </span>
        </div>

        {/* ── Interactive Project Filters ── */}
        <div className="flex flex-wrap items-center gap-2" aria-label="Filter projects">
          <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#a89f91]">FILTER BY</span>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${activeFilter === filter ? "border-[#e0455f] bg-[#e0455f]/15 text-[#f2ece2]" : "border-[#2e2b2a] bg-[#140e15] text-[#a89f91] hover:border-[#e0455f]/60 hover:text-[#f2ece2]"}`}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
          <span className="ml-auto font-mono text-[10px] text-[#a89f91]">{filteredProjects.length} / {CASE_PROJECTS.length} SHOWN</span>
        </div>

        {/* ── Project Case Files Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
          {filteredProjects.map((proj, idx) => (
            <motion.article
              key={proj.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="bg-[#140e15]/90 border border-[#2e2b2a] hover:border-[#e0455f]/60 p-6 md:p-8 rounded-xl shadow-[0_1rem_3rem_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            >
              {/* Top Meta Line */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#2e2b2a] pb-3 text-xs font-mono">
                  <span className="text-[#e0455f] font-semibold tracking-wider uppercase">
                    {proj.category}
                  </span>
                  <span className="text-[#a89f91] bg-[#0a0a0d] px-2.5 py-0.5 rounded border border-[#2e2b2a]">
                    {proj.year}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-[#f2ece2] font-['Space_Grotesk'] group-hover:text-[#f2a6b9] transition-colors flex items-center gap-2">
                    <span>{proj.title}</span>
                    {proj.featured && (
                      <span className="text-[10px] font-mono text-[#e0455f] bg-[#e0455f]/10 border border-[#e0455f]/30 px-2 py-0.5 rounded-full font-normal">
                        FEATURED
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[#a89f91] font-mono mt-1">
                    {proj.tagline}
                  </p>
                </div>

                <p className="text-xs md:text-sm text-[#cfc7ba] font-mono leading-relaxed">
                  {proj.description}
                </p>

                {/* Metrics / Fact bullets */}
                <div className="space-y-1.5 bg-[#0a0a0d]/60 border border-[#2e2b2a] p-3 rounded-lg">
                  {proj.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2 text-xs font-mono text-[#cfc7ba]">
                      <CheckCircle2 size={13} className="text-[#4ade80] flex-shrink-0 mt-0.5" />
                      <span>{metric}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Tech Stack & Action Links */}
              <div className="pt-6 border-t border-[#2e2b2a] mt-6 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {proj.stack.map((tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[10px] text-[#cfc7ba] bg-[#0a0a0d] px-2.5 py-1 rounded border border-[#2e2b2a]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-mono">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#cfc7ba] hover:text-[#f2ece2] transition-colors"
                  >
                    <Github size={14} />
                    <span>Source Code</span>
                  </a>

                  <a
                    href={proj.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#e0455f] hover:text-[#f2a6b9] font-semibold transition-colors"
                  >
                    <span>Live Preview</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
          </AnimatePresence>
        </div>

        {/* ── Open-Source Contributions Sub-Block ── */}
        <div className="space-y-4 pt-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#e0455f] uppercase tracking-wider font-semibold">
            <GitPullRequest size={14} />
            <span>OPEN SOURCE CONTRIBUTIONS &amp; MERGED CODE</span>
          </div>

          <div className="bg-[#140e15]/85 border border-[#2e2b2a] rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#2e2b2a] bg-[#0a0a0d]/80 text-[#a89f91]">
                    <th className="py-3.5 px-5 font-semibold">REPOSITORY</th>
                    <th className="py-3.5 px-5 font-semibold">PROJECT SCOPE</th>
                    <th className="py-3.5 px-5 font-semibold">CONTRIBUTIONS MERGED</th>
                    <th className="py-3.5 px-5 font-semibold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2e2b2a]/60 text-[#cfc7ba]">
                  {OPEN_SOURCE_CONTRIBUTIONS.map((item, i) => (
                    <tr key={i} className="hover:bg-[#0a0a0d]/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#f2ece2]">{item.repo}</td>
                      <td className="py-3.5 px-5 text-[#a89f91]">{item.area}</td>
                      <td className="py-3.5 px-5 text-xs">{item.prs}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="text-[10px] text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/30 px-2 py-0.5 rounded font-semibold">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
