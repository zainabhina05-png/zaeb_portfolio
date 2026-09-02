"use client";

import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { useRef, useState, useEffect } from "react";
import {
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Code2
} from "lucide-react";
import "./experience-zaeb.css";

interface ExperienceItem {
  id: number;
  color: string;
  label: string;
  detail: string;
  image: string;
  period: string;
  role: string;
  description: string;
  skills: string[];
  metrics?: string;
}

const ITEMS: ExperienceItem[] = [
  {
    id: 1,
    color: "#E17D3A",
    label: "Yalla E-Commerce",
    detail: "MERN STACK / HIGH-VOLUME TECH HUB",
    image: "/experience-gallery/yalla-ecommerce.png",
    period: "2024 — PRESENT",
    role: "Full Stack Engineer",
    description:
      "Architected scalable MERN microservices, automated real-time inventory syncing across distributed nodes, and enhanced checkout performance by 40% using Redis caching and streamlined GraphQL resolvers.",
    skills: ["React / Next.js", "Node.js", "MongoDB", "Redis", "GraphQL"],
    metrics: "40% faster checkout & 99.9% uptime",
  },
  {
    id: 2,
    color: "#39AEA6",
    label: "Elite Coders",
    detail: "OPEN SOURCE / COMMUNITY PLATFORM",
    image: "/experience-gallery/open-source.png",
    period: "2023 — 2024",
    role: "Core Contributor",
    description:
      "Led open-source architecture initiatives, authored production-ready React component primitives, and established automated CI/CD verification workflows with strict accessibility and performance standards.",
    skills: ["TypeScript", "Design Systems", "CI/CD", "Testing Library", "TailwindCSS"],
    metrics: "50+ merged PRs & 1.2k community users",
  },
  {
    id: 3,
    color: "#A493D5",
    label: "NICF Campus",
    detail: "AMBASSADOR / UNIVERSITY OF FAISALABAD",
    image: "/experience-gallery/campus-ambassador.jpg",
    period: "2023 — 2024",
    role: "Campus Ambassador",
    description:
      "Fostered strategic partnerships between regional tech industry leaders and student developers, organizing 5+ hackathons and hands-on developer bootcamps in cloud computing and modern full-stack development.",
    skills: ["Technical Mentorship", "Event Leadership", "Developer Outreach", "Hackathons"],
    metrics: "500+ student participants engaged",
  },
  {
    id: 4,
    color: "#E17D3A",
    label: "Atom Camp × GDG",
    detail: "UPSKILL SERIES / GOOGLE DEV GROUPS",
    image: "/experience-gallery/gdg-upskill.png",
    period: "2023",
    role: "Workshop Lead",
    description:
      "Designed and delivered interactive workshops on modern frontend architecture, state synchronization, and reactive UI patterns for over 300 emerging software engineers across Pakistan.",
    skills: ["React Deep Dive", "State Management", "Public Speaking", "API Architecture"],
    metrics: "300+ developers upskilled",
  },
  {
    id: 5,
    color: "#39AEA6",
    label: "DEV WEEKEND",
    detail: "AIR UNIVERSITY / INTENSIVE BOOTCAMP",
    image: "/experience-gallery/dev-weekend.jpg",
    period: "2023",
    role: "Technical Mentor",
    description:
      "Mentored cross-functional teams through rapid prototyping, agile sprint cycles, and architectural code reviews to ship 8 deployable MVP web applications within 48-hour sprint windows.",
    skills: ["Sprint Leadership", "Code Reviews", "Full Stack MVP", "System Design"],
    metrics: "8 MVPs successfully deployed",
  },
  {
    id: 6,
    color: "#A493D5",
    label: "MLSA Influencer",
    detail: "CLOUD PRACTITIONERS / MICROSOFT",
    image: "/experience-gallery/mlsa.png",
    period: "2022 — 2023",
    role: "Community Lead",
    description:
      "Conducted cloud practitioner webinars, hosted Azure cloud developer workshops, and published technical articles guiding university students on cloud architectures and DevOps tooling.",
    skills: ["Microsoft Azure", "Cloud Computing", "DevOps Basics", "Community Building"],
    metrics: "15+ technical sessions hosted",
  },
];

function getCardKeyframes(index: number, total: number) {
  const p = index / (total - 1);
  const halfSpan = 1 / (total - 1); // 0.2 for 6 items

  if (index === 0) {
    return {
      input: [0, halfSpan * 0.85, Math.min(1, halfSpan * 1.6)],
      scale: [1.0, 0.82, 0.76],
      opacity: [1.0, 0.65, 0.45],
    };
  }
  if (index === total - 1) {
    return {
      input: [Math.max(0, 1 - halfSpan * 1.6), 1 - halfSpan * 0.85, 1],
      scale: [0.76, 0.82, 1.0],
      opacity: [0.45, 0.65, 1.0],
    };
  }

  const prev = Math.max(0, p - halfSpan * 0.9);
  const next = Math.min(1, p + halfSpan * 0.9);
  return {
    input: [prev, p, next],
    scale: [0.8, 1.0, 0.8],
    opacity: [0.55, 1.0, 0.55],
  };
}

interface CardItemProps {
  item: ExperienceItem;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  cardWidth: number;
}

function ExperienceCardItem({
  item,
  index,
  total,
  scrollYProgress,
  cardWidth,
}: CardItemProps) {
  const { input, scale, opacity } = getCardKeyframes(index, total);

  // Dynamic transform driven by scroll:
  // Normal/compact size (scale ~0.8) on entry -> expands to web page size (scale 1.0) when centered -> shrinks back (scale ~0.8) as it goes left
  const cardScale = useTransform(scrollYProgress, input, scale, { clamp: true });
  const cardOpacity = useTransform(scrollYProgress, input, opacity, { clamp: true });

  return (
    <motion.div
      className="experience-card-slot"
      style={{
        width: `${cardWidth}px`,
        scale: cardScale,
        opacity: cardOpacity,
      }}
    >
      <div
        className="experience-card-split"
        style={{
          "--item-accent": item.color,
        } as React.CSSProperties}
      >
        {/* ── Half 1: Image Frame (Black & White by default, color on hover) ── */}
        <div className="experience-card-image-half">
          <div className="experience-image-container">
            <img
              src={item.image}
              alt={item.label}
              className="experience-card-img"
              loading="lazy"
            />
            {/* Color tint vignette on hover */}
            <div className="experience-image-gradient-overlay" />
            
            {/* Image Corner Badges */}
            <div className="experience-image-badge-top">
              <span className="experience-image-index">0{item.id}</span>
              <span className="experience-image-status">
                <span className="experience-status-dot" style={{ backgroundColor: item.color }} />
                FEATURED
              </span>
            </div>

            <div className="experience-image-badge-bottom">
              <span className="experience-image-hint">
                <Sparkles size={11} className="inline mr-1 text-[#dac6bd]" />
                HOVER FOR COLOR
              </span>
            </div>
          </div>
        </div>

        {/* ── Half 2: Content Details (Title, Role, Period, Paragraph, Stack — No overlapping) ── */}
        <div className="experience-card-content-half">
          {/* Top Meta Header */}
          <div className="experience-content-header">
            <div className="experience-eyebrow-row">
              <span className="experience-category-tag">
                <Code2 size={12} className="text-[#dac6bd]" />
                <span>{item.detail}</span>
              </span>
              <span className="experience-period-badge">
                <Calendar size={11} className="text-[#dac6bd]" />
                <span>{item.period}</span>
              </span>
            </div>

            {/* Clean Title — Distinct column, non-overlapping */}
            <h2 className="experience-title">{item.label}</h2>
            <div className="experience-role-row">
              <span className="experience-role-title" style={{ color: item.color }}>
                {item.role}
              </span>
            </div>
          </div>

          {/* Description Paragraph */}
          <div className="experience-content-body">
            <p className="experience-description">{item.description}</p>

            {item.metrics && (
              <div className="experience-metric-banner">
                <ShieldCheck size={13} className="text-[#39AEA6] shrink-0" />
                <span>{item.metrics}</span>
              </div>
            )}
          </div>

          {/* Bottom Skills & Status */}
          <div className="experience-content-footer">
            <div className="experience-skills-list">
              {item.skills.map((skill, sIdx) => (
                <span key={sIdx} className="experience-skill-chip">
                  {skill}
                </span>
              ))}
            </div>

            <div className="experience-action-row">
              <span className="experience-verified-tag">
                <Layers size={11} className="text-[#dac6bd]" />
                <span>EXPERIENCE ARCHIVE</span>
              </span>
              <div className="experience-hover-indicator" style={{ color: item.color }}>
                <span>ENGAGEMENT LOGGED</span>
                <ArrowUpRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ cardWidth: 1040, gap: 48 });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth <= 1024;
      
      let width = 1040;
      let gap = 48;

      if (isMobile) {
        width = Math.min(window.innerWidth - 36, 420);
        gap = 20;
      } else if (isTablet) {
        width = Math.min(window.innerWidth * 0.88, 880);
        gap = 32;
      } else {
        width = Math.min(window.innerWidth * 0.82, 1080);
        gap = 48;
      }

      setDimensions({ cardWidth: width, gap });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Calculate distance from card 1 centered to card 6 centered
  const totalDistance = (ITEMS.length - 1) * (dimensions.cardWidth + dimensions.gap);
  const x = useTransform(scrollYProgress, [0, 1], [0, -totalDistance]);

  return (
    <div id="experience" className="experience-reference-root">
      {/* Intro section */}
      <section className="experience-intro-section">
        <span className="experience-intro-eyebrow">03 // EXPERIENCE CHRONICLES</span>
        <h1 className="experience-impact">WORK IN MOTION</h1>
        <p className="experience-intro-desc">
          Scroll down to expand each engagement into full panoramic view. Hover over the imagery to reveal vivid colors and technical milestones.
        </p>
      </section>

      {/* Sticky horizontal scroll runway */}
      <div ref={containerRef} className="experience-scroll-container">
        <div
          className="experience-sticky-wrapper"
          style={{ width: `${dimensions.cardWidth}px` }}
        >
          <motion.div
            className="experience-gallery"
            style={{ x, gap: `${dimensions.gap}px` }}
          >
            {ITEMS.map((item, index) => (
              <ExperienceCardItem
                key={item.id}
                item={item}
                index={index}
                total={ITEMS.length}
                scrollYProgress={scrollYProgress}
                cardWidth={dimensions.cardWidth}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Outro section */}
      <section className="experience-outro-section">
        <div className="experience-outro-pill">
          <span>04 // FEATURED WORK &amp; CASE ARCHIVES AHEAD ↓</span>
        </div>
      </section>
    </div>
  );
}
