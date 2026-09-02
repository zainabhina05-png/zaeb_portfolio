"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "motion/react";
import {
  ArrowUpRight,
  ExternalLink,
  X,
  Layers,
  Terminal,
  Clock,
  Sparkles,
  CheckCircle2,
  FolderGit2
} from "lucide-react";
import "./work-index.css";

export interface Project {
  name: string;
  tagline: string;
  stack: string[];
  image: string;
  link: string | null;
  year: string;
  status: "live" | "in-progress";
  description?: string;
  category?: string;
}

export const PROJECTS: Project[] = [
  {
    name: "WordleForge",
    tagline: "Hardened Production Wordle Architecture with Full Test Suite & Zero-Trust Auth",
    stack: ["Next.js", "TypeScript", "Clerk Auth", "Prisma ORM", "Neon PostgreSQL", "Zod", "Vitest"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    link: "https://wordleforge.vercel.app",
    year: "2024",
    status: "live",
    category: "FULL STACK // SECURITY & TESTING",
    description:
      "Production-grade Wordle platform engineered beyond standard clones. Features hardened database pooling via Neon, zero-trust API validation, comprehensive test coverage (96 passing tests), and real-time state synchronization.",
  },
  {
    name: "How Ball",
    tagline: "High-Performance 3D WebGL Endless Runner Game Engine with ECS Architecture",
    stack: ["Next.js", "Three.js", "React Three Fiber", "GLSL Shaders", "Zustand", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    link: "https://howball.vercel.app",
    year: "2024",
    status: "live",
    category: "3D GRAPHICS // GAME SYSTEMS",
    description:
      "Interactive 3D WebGL endless runner demonstrating real-time browser game mechanics, procedural geometry generation, responsive camera tracking, and custom vertex/fragment shader lighting graphs.",
  },
  {
    name: "Awaaznama",
    tagline: "Bilingual Urdu Voice-to-Form AI Application for Social Good & Civic Accessibility",
    stack: ["React", "Python FastAPI", "Whisper AI", "WhatsApp Business API", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    link: null,
    year: "2024",
    status: "in-progress",
    category: "AI PRODUCT // ACCESSIBILITY",
    description:
      "Empowers non-literate community members to dictate official legal and NGO forms in Urdu. Leverages fine-tuned speech models, WhatsApp document bots, and automated PDF rendering pipelines.",
  },
  {
    name: "Logpose",
    tagline: "Enterprise Snowflake to Supabase Distributed Migration Tool with Integrity Verification",
    stack: ["Node.js", "TypeScript", "Snowflake SDK", "Supabase", "PostgreSQL Pooler", "Docker"],
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
    link: null,
    year: "2024",
    status: "in-progress",
    category: "DATA SYSTEMS // INFRASTRUCTURE",
    description:
      "High-throughput data extraction and ingestion pipeline migrating heavy analytical Snowflake data warehouses into PostgreSQL transaction pools with zero downtime and verified record integrity.",
  },
  {
    name: "LeadFlow",
    tagline: "CRM dashboard for tracking leads and pipeline with real-time conversion stages",
    stack: ["Next.js", "MongoDB", "Express", "Tailwind CSS", "Chart.js"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    link: null,
    year: "2025",
    status: "in-progress",
    category: "ENTERPRISE // SAAS DASHBOARD",
    description:
      "Interactive sales pipeline and lead management system with real-time stage transitions, automated reminders, and granular role-based access control for distributed teams.",
  },
];

export default function WorkIndex() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth floating cursor follower position for desktop hover preview (Skiper6 style)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 26, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const toggleExpand = (name: string) => {
    setExpandedProject((prev) => (prev === name ? null : name));
  };

  return (
    <section
      id="projects"
      className="work-index-root relative py-24 px-6 md:px-16 bg-[#0a0a0d] text-[#f2ece2] border-t border-[#2e2b2a] overflow-hidden"
      aria-label="Engineering Work & Case Studies Index"
    >
      <div className="max-w-7xl mx-auto space-y-12 relative z-10" ref={containerRef} onMouseMove={handleMouseMove}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2e2b2a] pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] text-[#e0455f] uppercase font-semibold">
              <Terminal size={14} />
              <span>04 // CASE INDEX &amp; ARCHITECTURE REVIEWS</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f2ece2] font-['Space_Grotesk']">
              WORK INDEX
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#a89f91] flex items-center gap-2 bg-[#140e15] border border-[#2e2b2a] px-3 py-1.5 rounded-lg">
              <FolderGit2 size={14} className="text-[#e0455f]" />
              <span>5 CASE STUDIES // EXPANDABLE</span>
            </span>
          </div>
        </div>

        {/* Skiper6 Floating Cursor Preview (Desktop Only — disabled when a panel is open) */}
        {!isMobile && hoveredProject && !expandedProject && (
          <motion.div
            className="work-floating-preview pointer-events-none"
            style={{
              left: smoothX,
              top: smoothY,
            }}
            initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 1 }}
            exit={{ opacity: 0, scale: 0.85, rotate: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="work-floating-card">
              <img
                src={hoveredProject.image}
                alt={hoveredProject.name}
                className="work-floating-img"
              />
              <div className="work-floating-meta">
                <span className="font-mono text-[10px] text-[#e0455f] uppercase tracking-wider">
                  {hoveredProject.year} • {hoveredProject.status === "live" ? "LIVE DEMO" : "IN PROGRESS"}
                </span>
                <p className="font-['Space_Grotesk'] text-xs font-bold text-[#ffffff] mt-0.5 line-clamp-1">
                  {hoveredProject.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Interactive Case Study Accordion Table ── */}
        <div className="work-index-table border-t border-[#2e2b2a]">
          {PROJECTS.map((project, idx) => {
            const isExpanded = expandedProject === project.name;
            const isLive = project.status === "live";

            return (
              <div
                key={project.name}
                className={`work-row-wrapper border-b border-[#2e2b2a] transition-colors duration-200 ${
                  isExpanded ? "work-row-expanded" : "hover:bg-[#140e15]/40"
                }`}
                onMouseEnter={() => setHoveredProject(project)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Clickable Row Header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(project.name)}
                  className="w-full text-left py-6 md:py-8 px-2 md:px-4 flex items-center justify-between gap-4 cursor-pointer group select-none outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-baseline gap-4 md:gap-8 flex-1 min-w-0">
                    {/* Index Number */}
                    <span className="font-mono text-xs md:text-sm text-[#736b63] font-semibold w-6 shrink-0">
                      0{idx + 1}
                    </span>

                    {/* Project Name with Persistent Burgundy Underline when expanded or hovered */}
                    <div className="relative">
                      <span
                        className={`text-xl md:text-3xl font-bold font-['Space_Grotesk'] tracking-tight transition-colors ${
                          isExpanded
                            ? "text-[#ffffff]"
                            : "text-[#cfc7ba] group-hover:text-[#ffffff]"
                        }`}
                      >
                        {project.name}
                      </span>
                      {/* Burgundy underline */}
                      <span
                        className={`absolute left-0 -bottom-1 h-[2px] bg-[#8c2438] transition-all duration-300 ${
                          isExpanded
                            ? "w-full opacity-100"
                            : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                        }`}
                      />
                    </div>

                    {/* Tagline / Subtitle (Desktop preview in row) */}
                    <span className="hidden lg:inline-block font-mono text-xs text-[#a89f91] truncate max-w-md ml-4">
                      {project.tagline}
                    </span>
                  </div>

                  {/* Status & Action Indicator */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border flex items-center gap-1.5 ${
                        isLive
                          ? "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]"
                          : "border-[#736b63]/30 bg-[#736b63]/10 text-[#a89f91]"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLive ? "bg-[#4ade80]" : "bg-[#736b63]"
                        }`}
                      />
                      <span>{isLive ? "LIVE" : "IN-PROGRESS"}</span>
                    </span>

                    <span className="font-mono text-xs text-[#736b63] hidden sm:inline-block">
                      {project.year}
                    </span>

                    <span
                      className={`font-mono text-xs text-[#e0455f] transition-transform duration-300 ${
                        isExpanded ? "rotate-45" : "group-hover:translate-x-1"
                      }`}
                    >
                      {isExpanded ? "✕" : "→"}
                    </span>
                  </div>
                </button>

                {/* ── Case Study In-Place Accordion Panel ── */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${project.name}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.08, duration: 0.25 }}
                        className="work-expanded-panel p-4 md:p-8 space-y-6"
                      >
                        {/* Larger Full-Width Case Image (~400px height, tungsten 1px border, no radius) */}
                        <div className="work-expanded-image-frame">
                          <img
                            src={project.image}
                            alt={`${project.name} architecture preview`}
                            className="work-expanded-image"
                          />
                          <div className="work-image-overlay-bar">
                            <span className="font-mono text-[10px] text-[#dac6bd] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={12} className="text-[#e0455f]" />
                              <span>{project.category || "SYSTEM ARCHITECTURE"}</span>
                            </span>
                            <span className="font-mono text-[10px] text-[#a89f91]">
                              BUILD YEAR // {project.year}
                            </span>
                          </div>
                        </div>

                        {/* Tagline as a prominent sentence */}
                        <div className="space-y-2">
                          <h3 className="font-sans text-lg md:text-xl text-[#f2ece2] font-semibold leading-snug">
                            {project.tagline}
                          </h3>
                          {project.description && (
                            <p className="font-mono text-xs md:text-sm text-[#cfc7ba] leading-relaxed max-w-4xl">
                              {project.description}
                            </p>
                          )}
                        </div>

                        {/* Full Stack Tags List (Mono tungsten-colored pills) */}
                        <div className="space-y-2 pt-2 border-t border-[#2e2b2a]/60">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#a89f91] flex items-center gap-1.5">
                            <Layers size={11} className="text-[#e0455f]" />
                            <span>STACK &amp; INFRASTRUCTURE</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {project.stack.map((tech) => (
                              <span
                                key={tech}
                                className="font-mono text-[11px] text-[#cfc7ba] bg-[#0a0a0d] px-3 py-1 rounded border border-[#2e2b2a]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* CTA Row at the bottom */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#2e2b2a] text-xs font-mono">
                          {isLive && project.link ? (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-[#e0455f] hover:text-[#f2a6b9] font-bold uppercase tracking-wider transition-colors"
                            >
                              <span>View live →</span>
                              <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            <span className="text-[#736b63] font-mono text-xs uppercase tracking-wider opacity-75 select-none">
                              In progress — case study coming soon
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProject(null);
                            }}
                            className="inline-flex items-center gap-1 text-[#a89f91] hover:text-[#f2ece2] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <X size={13} />
                            <span>Close</span>
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
