"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Layers,
  Sparkles,
  Server,
  Database,
  Terminal,
  Cpu,
  Boxes,
  ArrowUpRight,
  ExternalLink,
  Flame
} from "lucide-react";
import "./isometric-stack.css";

export interface StackItem {
  id: string;
  name: string;
  role: string;
  color: string;
  glow: string;
  fileTarget?: string;
  icon: string | React.ReactNode;
}

export interface StackCategory {
  id: string;
  title: string;
  tag: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: StackItem[];
}

export const STACK_CATEGORIES: StackCategory[] = [
  {
    id: "frontend",
    title: "Frontend Frameworks & UI",
    tag: "CLIENT RUNTIME",
    icon: Code2,
    items: [
      {
        id: "react",
        name: "React 19",
        role: "Component Architecture",
        color: "#61DAFB",
        glow: "rgba(97, 218, 251, 0.4)",
        fileTarget: "react-tsx",
        icon: (
          <svg viewBox="-11.5 -10.23174 23 20.46348" className="cat-icon-svg" fill="none" stroke="#61DAFB" strokeWidth="1.3">
            <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
            <g stroke="#61DAFB">
              <ellipse rx="11" ry="4.2" />
              <ellipse rx="11" ry="4.2" transform="rotate(60)" />
              <ellipse rx="11" ry="4.2" transform="rotate(120)" />
            </g>
          </svg>
        ),
      },
      {
        id: "nextjs",
        name: "Next.js 15",
        role: "App Router & SSR",
        color: "#ffffff",
        glow: "rgba(255, 255, 255, 0.35)",
        fileTarget: "nextjs-config",
        icon: (
          <svg viewBox="0 0 180 180" className="cat-icon-svg" fill="currentColor">
            <circle cx="90" cy="90" fill="#000000" r="90" />
            <path d="M149.508 157.438L69.1478 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.137 149.508 157.438Z" fill="white" />
            <rect fill="white" height="72" width="12" x="115" y="54" />
          </svg>
        ),
      },
      {
        id: "typescript",
        name: "TypeScript",
        role: "Strict Type Systems",
        color: "#3178C6",
        glow: "rgba(49, 120, 198, 0.45)",
        fileTarget: "react-tsx",
        icon: (
          <div className="cat-ts-badge">
            <span>TS</span>
          </div>
        ),
      },
      {
        id: "tailwind",
        name: "Tailwind CSS",
        role: "Design Token Layer",
        color: "#38BDF8",
        glow: "rgba(56, 189, 248, 0.4)",
        fileTarget: "tailwind-css",
        icon: (
          <svg viewBox="0 0 24 24" className="cat-icon-svg" fill="#38BDF8">
            <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C9.337,13.382,7.976,12,6.001,12z" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "motion-3d",
    title: "3D Graphics & Kinetic Motion",
    tag: "WEBGL & PHYSICS",
    icon: Sparkles,
    items: [
      {
        id: "threejs",
        name: "Three.js",
        role: "WebGL Shaders & Scenes",
        color: "#ffffff",
        glow: "rgba(255, 255, 255, 0.4)",
        fileTarget: "three-module",
        icon: (
          <img
            src="https://cdn.simpleicons.org/threedotjs/F8F8F2"
            alt="Three.js"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "r3f",
        name: "React Three Fiber",
        role: "Declarative 3D Canvas",
        color: "#E0455F",
        glow: "rgba(224, 69, 95, 0.4)",
        fileTarget: "three-module",
        icon: (
          <div className="cat-r3f-badge">
            <span>R3F</span>
          </div>
        ),
      },
      {
        id: "gsap",
        name: "GSAP",
        role: "ScrollTrigger Timelines",
        color: "#88CE02",
        glow: "rgba(136, 206, 2, 0.45)",
        fileTarget: "gsap-scroll",
        icon: (
          <span className="cat-gsap-text">GSAP</span>
        ),
      },
      {
        id: "motion",
        name: "Motion",
        role: "Spring Micro-Interactions",
        color: "#FFE600",
        glow: "rgba(255, 230, 0, 0.45)",
        fileTarget: "react-tsx",
        icon: (
          <div className="cat-motion-badge">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v8l-8 8-8-8V4zm8 11.172L16.586 10H7.414L12 15.172z" />
            </svg>
          </div>
        ),
      },
    ],
  },
  {
    id: "backend",
    title: "Backend & Distributed APIs",
    tag: "SERVER ARCHITECTURE",
    icon: Server,
    items: [
      {
        id: "nodejs",
        name: "Node.js",
        role: "Async Event-Loop Engine",
        color: "#83CD29",
        glow: "rgba(131, 205, 41, 0.4)",
        fileTarget: "server-route",
        icon: (
          <img
            src="https://cdn.simpleicons.org/nodedotjs/83CD29"
            alt="Node.js"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "express",
        name: "Express.js",
        role: "REST & Middleware Pipes",
        color: "#ffffff",
        glow: "rgba(255, 255, 255, 0.35)",
        fileTarget: "server-route",
        icon: (
          <img
            src="https://cdn.simpleicons.org/express/F8F8F2"
            alt="Express"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "python",
        name: "Python REST",
        role: "FastAPI & Speech AI",
        color: "#FFD43B",
        glow: "rgba(255, 212, 59, 0.4)",
        fileTarget: "server-route",
        icon: (
          <img
            src="https://cdn.simpleicons.org/python/FFD43B"
            alt="Python"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "jwt",
        name: "JWT & Security",
        role: "Zero-Trust Auth & CSRF",
        color: "#F92672",
        glow: "rgba(249, 38, 114, 0.4)",
        fileTarget: "server-route",
        icon: (
          <img
            src="https://cdn.simpleicons.org/jsonwebtokens/F92672"
            alt="JWT"
            className="cat-img-icon"
          />
        ),
      },
    ],
  },
  {
    id: "database",
    title: "Database, ORM & Cloud Storage",
    tag: "PERSISTENCE LAYER",
    icon: Database,
    items: [
      {
        id: "postgres",
        name: "PostgreSQL",
        role: "Relational & Neon Pools",
        color: "#4169E1",
        glow: "rgba(65, 105, 225, 0.4)",
        fileTarget: "schema-prisma",
        icon: (
          <img
            src="https://cdn.simpleicons.org/postgresql/4169E1"
            alt="PostgreSQL"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "mongodb",
        name: "MongoDB Atlas",
        role: "Document & Aggregations",
        color: "#47A248",
        glow: "rgba(71, 162, 72, 0.4)",
        fileTarget: "mongo-query",
        icon: (
          <img
            src="https://cdn.simpleicons.org/mongodb/47A248"
            alt="MongoDB"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "prisma",
        name: "Prisma ORM",
        role: "Schema & Migrations",
        color: "#5A67D8",
        glow: "rgba(90, 103, 216, 0.4)",
        fileTarget: "schema-prisma",
        icon: (
          <img
            src="https://cdn.simpleicons.org/prisma/F8F8F2"
            alt="Prisma"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "redis",
        name: "Redis Cache",
        role: "In-Memory Rate Limiting",
        color: "#DC382D",
        glow: "rgba(220, 56, 45, 0.4)",
        fileTarget: "docker-compose",
        icon: (
          <img
            src="https://cdn.simpleicons.org/redis/DC382D"
            alt="Redis"
            className="cat-img-icon"
          />
        ),
      },
    ],
  },
  {
    id: "devops-systems",
    title: "Tooling, CI/CD & Systems",
    tag: "INFRASTRUCTURE & C++",
    icon: Cpu,
    items: [
      {
        id: "docker",
        name: "Docker",
        role: "Container Orchestration",
        color: "#2496ED",
        glow: "rgba(36, 150, 237, 0.4)",
        fileTarget: "docker-compose",
        icon: (
          <img
            src="https://cdn.simpleicons.org/docker/2496ED"
            alt="Docker"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "github-actions",
        name: "GitHub Actions",
        role: "Automated CI Pipelines",
        color: "#2088FF",
        glow: "rgba(32, 136, 255, 0.4)",
        fileTarget: "ci-pipeline",
        icon: (
          <img
            src="https://cdn.simpleicons.org/githubactions/2088FF"
            alt="GitHub Actions"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "cpp",
        name: "C++ / SFML",
        role: "Game Engine & ECS",
        color: "#00599C",
        glow: "rgba(0, 89, 156, 0.4)",
        fileTarget: "player-controller",
        icon: (
          <img
            src="https://cdn.simpleicons.org/cplusplus/00599C"
            alt="C++"
            className="cat-img-icon"
          />
        ),
      },
      {
        id: "vitest",
        name: "Vitest / Jest",
        role: "Unit & Integration Tests",
        color: "#FCC72B",
        glow: "rgba(252, 199, 43, 0.4)",
        fileTarget: "jest-test",
        icon: (
          <img
            src="https://cdn.simpleicons.org/jest/C21325"
            alt="Jest"
            className="cat-img-icon"
          />
        ),
      },
    ],
  },
];

interface CategorizedStackGridProps {
  onSelectFile?: (fileId: string) => void;
}

export function CategorizedStackGrid({ onSelectFile }: CategorizedStackGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const displayedCategories =
    activeCategory === "all"
      ? STACK_CATEGORIES
      : STACK_CATEGORIES.filter((cat) => cat.id === activeCategory);

  return (
    <div className="cat-stack-wrapper">
      {/* ── Top Filter Bar ── */}
      <div className="cat-filter-header">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[#e0455f]" />
          <span className="cat-filter-title">STACK MATRIX // CATEGORIZED 3D BLOCKS</span>
        </div>

        {/* Filter Pills */}
        <div className="cat-filter-pills">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`cat-filter-pill${activeCategory === "all" ? " is-active" : ""}`}
          >
            ALL CATEGORIES
          </button>
          {STACK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`cat-filter-pill${activeCategory === cat.id ? " is-active" : ""}`}
            >
              {cat.tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category Groups Container ── */}
      <div className="cat-groups-scroll">
        {displayedCategories.map((category) => {
          const CategoryIcon = category.icon;

          return (
            <div key={category.id} className="cat-group-card">
              {/* Category Box Header */}
              <div className="cat-group-header">
                <div className="flex items-center gap-2.5">
                  <div className="cat-group-icon-wrap">
                    <CategoryIcon size={14} className="text-[#dac6bd]" />
                  </div>
                  <div>
                    <h3 className="cat-group-title">{category.title}</h3>
                    <span className="cat-group-tag">{category.tag}</span>
                  </div>
                </div>

                <span className="cat-group-count">
                  {category.items.length} MODULES
                </span>
              </div>

              {/* Upright 3D Glow Block Grid */}
              <div className="cat-blocks-grid">
                {category.items.map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => item.fileTarget && onSelectFile?.(item.fileTarget)}
                    whileHover={{
                      y: -6,
                      scale: 1.03,
                      transition: { type: "spring", stiffness: 350, damping: 20 },
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="cat-block-btn group"
                    style={
                      {
                        "--block-accent": item.color,
                        "--block-glow": item.glow,
                      } as React.CSSProperties
                    }
                  >
                    {/* Block Face Surface */}
                    <div className="cat-block-surface">
                      {/* Micro Grid Lines Texture */}
                      <div className="cat-block-grid-mesh" />

                      {/* Top Action Icon & Indicator */}
                      <div className="cat-block-top-row">
                        <div className="cat-icon-container">{item.icon}</div>
                        <span className="cat-arrow-indicator">
                          <ArrowUpRight size={12} />
                        </span>
                      </div>

                      {/* Name & Role */}
                      <div className="cat-block-meta">
                        <h4 className="cat-block-name">{item.name}</h4>
                        <p className="cat-block-role">{item.role}</p>
                      </div>

                      {/* Specular Glare Glow */}
                      <div className="cat-block-glow-aura" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Status Bar ── */}
      <div className="cat-bottom-bar">
        <div className="flex items-center gap-2 text-xs font-mono text-[#dac6bd]">
          <Terminal size={12} className="text-[#e0455f]" />
          <span>CLICK ANY 3D BLOCK TO LOAD ITS PRODUCTION SOURCE FILE</span>
        </div>

        <span className="font-mono text-[10px] text-[#736b63] uppercase">
          {STACK_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0)} VERIFIED MODULES
        </span>
      </div>
    </div>
  );
}

export default CategorizedStackGrid;
