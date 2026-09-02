export interface StackFile {
  id: string;
  name: string;
  folder: string;
  language: string;
  intro: string; // Short description shown above code
  code: string;
}

export interface StackFolder {
  id: string;
  name: string;
  label: string;
  files: StackFile[];
}

export const IDE_FOLDERS: StackFolder[] = [
  {
    id: "overview",
    name: "overview",
    label: "Overview",
    files: [
      {
        id: "readme-md",
        name: "README.md",
        folder: "overview",
        language: "markdown",
        intro: "ZAEB engineering stack overview — languages, systems, frontend, 3D, backend, data, testing, and DevOps",
        code: `// ── ZAEB · ENGINEERING STACK ─────────────────────────────────────────
//
// CATEGORY         │ CORE TECHNOLOGIES & TOOLS
// ─────────────────┼──────────────────────────────────────────────────────────
LANGUAGES           │ C · C++ · Python · JavaScript · TypeScript
COMPUTER SCIENCE    │ Data Structures & Algorithms (DSA) · OOP · DSP
SYSTEM ARCHITECTURE │ Systems Thinking · Modular Architecture · State Machines
FRONTEND FRAMEWORKS │ React · Next.js · React Router · Vite
STYLING & UI        │ HTML5 · CSS3 · SCSS · Bootstrap · Tailwind CSS · jQuery
MOTION & 3D         │ Three.js · React Three Fiber · GSAP · Motion · GLSL
BACKEND RUNTIME     │ Node.js · Express.js · Python REST APIs
AUTH & SECURITY     │ JWT · Webhooks · Middleware Pipelines · CSRF Shield
DATABASE & ORM      │ PostgreSQL · MongoDB · MySQL · Snowflake · Neon · Prisma
TESTING & QA        │ Vitest · Jest · Supertest · Postman
TOOLING & DEVOPS    │ Git · GitHub Actions · Docker · Vercel · Agile/Scrum
GAME DEVELOPMENT    │ C++ · C# · SFML · 2D Physics Engine
// ─────────────────┴──────────────────────────────────────────────────────────
// Click any file in the left sidebar to inspect production code excerpts.`,
      },
    ],
  },
  {
    id: "frontend",
    name: "frontend",
    label: "Frontend",
    files: [
      {
        id: "react-tsx",
        name: "react.tsx",
        folder: "frontend",
        language: "tsx",
        intro: "React · Next.js · Vite · React Router — production component with Motion micro-interaction",
        code: `import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ProjectCardProps {
  title: string;
  stack: string[];
  href: string;
}

export function ProjectCard({ title, stack, href }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={href}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="project-card"
    >
      <h3>{title}</h3>
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="stack-tags"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {stack.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}`,
      },
      {
        id: "tailwind-css",
        name: "tailwind.css",
        folder: "frontend",
        language: "css",
        intro: "Tailwind CSS · SCSS · CSS3 · Bootstrap — custom design token layer on top of Tailwind",
        code: `/* Design token overrides for production build */
@layer base {
  :root {
    --brand-bg:      #050608;
    --brand-primary: #f5f0ea;
    --brand-brass:   #c9a24b;
    --brand-ember:   #e0455f;
    --ease-reveal:   cubic-bezier(0.52, 0.01, 0, 1);
  }
}

@layer utilities {
  /* Scroll curtain clip reveal */
  .clip-curtain {
    clip-path: inset(0 50% 0 50%);
    transition: clip-path 420ms var(--ease-reveal);
  }
  .clip-curtain-open {
    clip-path: inset(0 0% 0 0%);
  }

  /* Glass morphism surface */
  .glass-surface {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(14px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
}`,
      },
      {
        id: "nextjs-config",
        name: "nextjs.config.ts",
        folder: "frontend",
        language: "typescript",
        intro: "Next.js · TypeScript — production config with image optimization and bundle splitting",
        code: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "@radix-ui/react-dialog"],
    ppr: true,  // Partial Pre-Rendering
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Enable React Server Components streaming
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;`,
      },
    ],
  },
  {
    id: "three-anim",
    name: "3d-animation",
    label: "3D & Animation",
    files: [
      {
        id: "three-module",
        name: "three.module.js",
        folder: "3d-animation",
        language: "javascript",
        intro: "Three.js · React Three Fiber · GSAP — interactive 3D scene with shader animation",
        code: `import * as THREE from "three";
import gsap from "gsap";

export function createParticleField(container) {
  const scene   = new THREE.Scene();
  const camera  = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 500);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Particle geometry
  const count = 3200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 80;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.18, color: 0xc9a24b, sizeAttenuation: true,
  });

  const mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
  camera.position.z = 32;

  // GSAP timeline entrance
  gsap.from(mesh.rotation, { y: Math.PI, duration: 2.4, ease: "expo.out" });

  const animate = () => {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.0006;
    renderer.render(scene, camera);
  };
  animate();
}`,
      },
      {
        id: "gsap-scroll",
        name: "gsap.scroll.js",
        folder: "3d-animation",
        language: "javascript",
        intro: "GSAP ScrollTrigger — pinned horizontal scroll sequence with stagger reveals",
        code: `import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initScrollSequence(container) {
  const panels = gsap.utils.toArray(".panel", container);

  // Horizontal scroll pin
  gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1.4,
      snap: { snapTo: 1 / (panels.length - 1), duration: 0.3 },
      end: () => "+=" + container.offsetWidth * (panels.length - 1),
    },
  });

  // Stagger copy reveal on each panel entry
  panels.forEach((panel) => {
    gsap.from(panel.querySelectorAll("h2, p, .tag"), {
      opacity: 0, y: 28, stagger: 0.08, duration: 0.72,
      ease: "power3.out",
      scrollTrigger: { trigger: panel, containerAnimation: ScrollTrigger.getAll()[0], start: "left 80%" },
    });
  });
}`,
      },
    ],
  },
  {
    id: "backend",
    name: "backend",
    label: "Backend",
    files: [
      {
        id: "server-route",
        name: "server.route.js",
        folder: "backend",
        language: "javascript",
        intro: "Node.js · Express.js · REST APIs · JWT · Webhooks — authenticated project route",
        code: `import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { rateLimiter }  from "../middleware/rateLimit.js";
import { Project }      from "../models/Project.js";
import { log }          from "../utils/winston.js";  // Winston logger

const router = Router();

const CreateProjectSchema = z.object({
  title:       z.string().min(2).max(120),
  stack:       z.array(z.string()).min(1),
  repoUrl:     z.string().url().optional(),
  isPublished: z.boolean().default(false),
});

// POST /api/projects — authenticated, rate-limited
router.post("/api/projects", rateLimiter(60), authenticate, async (req, res) => {
  const parsed = CreateProjectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.issues });

  const project = await Project.create({ ...parsed.data, ownerId: req.user.id });
  log.info("project.created", { id: project.id, user: req.user.email });

  return res.status(201).json(project);
});

export default router;`,
      },
      {
        id: "express-middleware",
        name: "middleware.js",
        folder: "backend",
        language: "javascript",
        intro: "Express middleware — rate limiter with Morgan request logging and Winston error tracking",
        code: `import morgan  from "morgan";
import winston from "winston";

// Winston structured logger
export const log = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

// Morgan HTTP request logger (uses Winston stream)
export const httpLogger = morgan("combined", {
  stream: { write: (msg) => log.http(msg.trim()) },
});

// Rate limiter — sliding window per IP
export const rateLimiter = (limit = 100, windowMs = 60_000) => {
  const store = new Map();
  return (req, res, next) => {
    const key  = req.ip ?? req.headers["x-forwarded-for"];
    const now  = Date.now();
    const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= limit) return res.status(429).json({ error: "Too many requests" });
    store.set(key, [...hits, now]);
    next();
  };
};`,
      },
    ],
  },
  {
    id: "database",
    name: "database",
    label: "Database",
    files: [
      {
        id: "schema-prisma",
        name: "schema.prisma",
        folder: "database",
        language: "prisma",
        intro: "MongoDB Atlas · Neon · Supabase · Snowflake · MySQL — Prisma schema for multi-model app",
        code: `datasource db {
  provider = "postgresql"  // Neon / Supabase serverless Postgres
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id          String   @id @default(cuid())
  title       String
  stack       String[]
  repoUrl     String?
  isPublished Boolean  @default(false)
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@index([ownerId])
  @@index([isPublished])
}`,
      },
      {
        id: "mongo-query",
        name: "mongo.query.js",
        folder: "database",
        language: "javascript",
        intro: "MongoDB · MongoDB Atlas — aggregation pipeline with geo-index and full-text search",
        code: `import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const db     = client.db("zaeb_portfolio");

// Full-text search across projects with stack filter
export async function searchProjects({ query, stack, limit = 12 }) {
  return db.collection("projects").aggregate([
    {
      $search: {
        index: "projects_search",
        text: { query, path: ["title", "description"] },
      },
    },
    // Filter by stack if provided
    ...(stack?.length ? [{ $match: { stack: { $in: stack } } }] : []),
    { $sort: { score: { $meta: "searchScore" }, createdAt: -1 } },
    { $limit: limit },
    { $project: { _id: 1, title: 1, stack: 1, repoUrl: 1, score: { $meta: "searchScore" } } },
  ]).toArray();
}`,
      },
    ],
  },
  {
    id: "game-dev",
    name: "game-dev",
    label: "Game Dev",
    files: [
      {
        id: "player-controller",
        name: "player.controller.cpp",
        folder: "game-dev",
        language: "cpp",
        intro: "C++ · SFML · C# — physics-based player controller with state machine and collision detection",
        code: `#include "Player.hpp"
#include "PhysicsWorld.hpp"

// ─── Player state machine ───────────────────────────────────────
enum class PlayerState { Idle, Running, Jumping, Falling };

void Player::update(float dt) {
  // Apply gravity
  velocity.y += GRAVITY * dt;

  // Horizontal movement
  float input = sf::Keyboard::isKeyPressed(sf::Keyboard::Right) ? 1.f
              : sf::Keyboard::isKeyPressed(sf::Keyboard::Left)  ? -1.f : 0.f;
  velocity.x  = input * MOVE_SPEED;

  // Jump
  if (sf::Keyboard::isKeyPressed(sf::Keyboard::Space) && isGrounded) {
    velocity.y  = JUMP_FORCE;
    isGrounded  = false;
    state       = PlayerState::Jumping;
  }

  // Integrate position
  position += velocity * dt;

  // Ground collision
  if (position.y >= GROUND_LEVEL) {
    position.y = GROUND_LEVEL;
    velocity.y = 0.f;
    isGrounded = true;
    state = (std::abs(velocity.x) > 0.1f) ? PlayerState::Running : PlayerState::Idle;
  } else if (velocity.y > 0.f) {
    state = PlayerState::Falling;
  }

  sprite.setPosition(position);
}`,
      },
      {
        id: "physics-sfml",
        name: "physics.world.cpp",
        folder: "game-dev",
        language: "cpp",
        intro: "C++ · SFML — broad-phase AABB collision, rigid body integration, constraint solver",
        code: `#include "PhysicsWorld.hpp"
#include <algorithm>

void PhysicsWorld::step(float dt) {
  // Integrate forces
  for (auto& body : bodies) {
    if (body->isStatic) continue;
    body->applyForce(gravity * body->mass);
    body->velocity += (body->force / body->mass) * dt;
    body->position += body->velocity * dt;
    body->force = Vector2f(0.f, 0.f);
  }

  // Broad-phase: sweep-and-prune on X axis
  std::sort(bodies.begin(), bodies.end(), [](const auto& a, const auto& b) {
    return a->getAABB().left < b->getAABB().left;
  });

  // Narrow-phase: AABB overlap test & impulse resolution
  for (size_t i = 0; i < bodies.size(); ++i) {
    for (size_t j = i + 1; j < bodies.size(); ++j) {
      if (!bodies[i]->getAABB().intersects(bodies[j]->getAABB())) break;
      resolveCollision(*bodies[i], *bodies[j]);
    }
  }
}`,
      },
    ],
  },
  {
    id: "tooling",
    name: "tooling",
    label: "Tools & CI/CD",
    files: [
      {
        id: "docker-compose",
        name: "docker-compose.yml",
        folder: "tooling",
        language: "yaml",
        intro: "Docker · Vercel · Git · CI/CD — multi-service compose with Postgres, Redis, and app container",
        code: `# docker-compose.yml — local dev stack
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://zaeb:secret@db:5432/zaeb_dev
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zaeb
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: zaeb_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zaeb"]
      interval: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:`,
      },
      {
        id: "ci-pipeline",
        name: "ci.pipeline.yml",
        folder: "tooling",
        language: "yaml",
        intro: "GitHub Actions · Agile/Scrum · Jest · Supertest — full CI pipeline: test, lint, build, deploy",
        code: `name: CI / CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: test_db, POSTGRES_PASSWORD: test }
        options: --health-cmd pg_isready --health-interval 5s --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run test          # Jest + Supertest integration tests
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db

  build-and-deploy:
    name: Build & Deploy
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: \${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: \${{ secrets.ORG_ID }}
          vercel-project-id: \${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"`,
      },
      {
        id: "jest-test",
        name: "api.test.js",
        folder: "tooling",
        language: "javascript",
        intro: "Jest · Supertest · Postman — integration test suite for the projects REST API",
        code: `import request    from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import app          from "../src/app.js";
import { db }       from "../src/db.js";

let authToken;

beforeAll(async () => {
  await db.$connect();
  // Seed test user & get JWT
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@zaeb.dev", password: "testpass" });
  authToken = res.body.token;
});

afterAll(() => db.$disconnect());

describe("POST /api/projects", () => {
  it("creates a project for authenticated user", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", \`Bearer \${authToken}\`)
      .send({ title: "Portfolio v3", stack: ["Next.js", "Three.js", "Prisma"] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Portfolio v3" });
  });

  it("returns 401 without token", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({ title: "No Auth" });
    expect(res.status).toBe(401);
  });
});`,
      },
    ],
  },
];

export const INITIAL_FILE = IDE_FOLDERS[0].files[0];
