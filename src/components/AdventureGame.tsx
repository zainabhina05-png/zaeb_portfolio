import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sliders,
  Sparkles,
  Award,
  Terminal,
  Volume2,
  VolumeX,
  Compass,
  Play,
  RotateCcw,
  CheckCircle2,
  Sword,
  Shield,
  Heart,
  Zap,
  User,
  ShoppingBag,
  ListTodo,
  FileDown,
  Navigation,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Calendar,
  MapPin,
  Mail,
  Copy,
  Check,
  ArrowUp,
  Info,
  BookOpen,
  MousePointerClick,
  Maximize2,
  Minimize2,
  Layers,
  Flame,
  Star,
  GraduationCap,
  Briefcase,
  Code,
  FolderGit2,
  Radar,
  Trophy,
  HelpCircle
} from "lucide-react";

import ThreeTownScene from "./ThreeTownScene";
import PortfolioBookstall from "./PortfolioBookstall";

import { PROJECT_PLACEHOLDERS } from "../data/projects";
import { EXPERIENCE_PLACEHOLDERS, LEADERSHIP_PLACEHOLDERS } from "../data/experience";
import { SKILL_CATEGORIES } from "../data";
import { EDUCATION_PLACEHOLDERS } from "../data/education";
import { SOCIAL_LINKS } from "../data/contact";
import { CERTIFICATION_PLACEHOLDERS } from "../data/certifications";

// Interfaces for Game State
interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  design: number;
  logic: number;
  speed: number;
  scalability: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

interface InventoryItem {
  id: string;
  name: string;
  slot: "weapon" | "shield" | "accessory" | "boots";
  description: string;
  bonusText: string;
  statModifier: { design?: number; logic?: number; speed?: number; scalability?: number };
  equipped: boolean;
  icon: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  targetSection: string;
  completed: boolean;
  xpReward: number;
}

interface MapNode {
  row: number;
  col: number;
  name: string;
  section: string;
  description: string;
  color: string;
  radius: number;
  icon: React.ReactNode;
}

interface Chest {
  row: number;
  col: number;
  looted: boolean;
  itemId: string;
}

interface Gem {
  row: number;
  col: number;
  color: string;
  value: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

// Coordinate Constants for Isometric Grid
const MAP_SIZE = 12; // 12x12 grid
const TILE_W = 72;
const TILE_H = 36;

interface AdventureGameProps {
  teleportSection?: string | null;
  onTeleportComplete?: () => void;
  onSwitchToScrollMode?: () => void;
}

export default function AdventureGame({ teleportSection, onTeleportComplete, onSwitchToScrollMode }: AdventureGameProps = {}) {
  // Helper to safely load state from localStorage
  const getSavedValue = (key: string, defaultValue: any) => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const saved = localStorage.getItem("adventure_game_v2_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }
    return defaultValue;
  };

  // Game Setup & Customization states
  const [gameState, setGameState] = useState<"prologue" | "loading" | "playing">(() => getSavedValue("gameState", "playing"));
  const [bookstallOpen, setBookstallOpen] = useState(false);
  const [playerName, setPlayerName] = useState(() => getSavedValue("playerName", "Zainab"));
  const [playerClass, setPlayerClass] = useState<"spellblade" | "pyromancer" | "alchemist">(() => getSavedValue("playerClass", "spellblade"));
  const [soundEnabled, setSoundEnabled] = useState(() => getSavedValue("soundEnabled", true));
  const [activeCodexTab, setActiveCodexTab] = useState(() => getSavedValue("activeCodexTab", "about"));
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isClassSheetOpen, setIsClassSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "game" | "text">(() => getSavedValue("viewMode", "split"));

  // Hover tile tracking for canvas
  const [hoverTile, setHoverTile] = useState<{ row: number; col: number } | null>(null);

  // Floating notifications
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // 3D Tilt State for Prologue
  const [prologueTilt, setPrologueTilt] = useState({ x: 0, y: 0 });
  const handlePrologueMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPrologueTilt({ x: x * 10, y: -y * 10 });
  };

  // Player Stats
  const [stats, setStats] = useState<PlayerStats>(() => getSavedValue("stats", {
    hp: 100,
    maxHp: 100,
    mp: 80,
    maxMp: 80,
    design: 15,
    logic: 20,
    speed: 18,
    scalability: 22,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
  }));

  // Synthesize game sounds via Web Audio API
  const synthBeep = (freqs: number[], type: OscillatorType, duration: number, gainVal: number = 0.03) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      freqs.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.07);
        gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime + index * 0.07);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.07 + duration);
        osc.start(audioCtx.currentTime + index * 0.07);
        osc.stop(audioCtx.currentTime + index * 0.07 + duration);
      });
    } catch (e) {}
  };

  // Quests Ledger
  const [quests, setQuests] = useState<Quest[]>(() => getSavedValue("quests", [
    { id: "quest-about", title: "Developer Profile", description: "Visit Developer Profile node to read Bio & Manifesto.", targetSection: "about", completed: false, xpReward: 40 },
    { id: "quest-skills", title: "Technical Stack", description: "Discover the Technical Skills node.", targetSection: "skills", completed: false, xpReward: 50 },
    { id: "quest-experience", title: "Work Experience", description: "Review Experience timeline.", targetSection: "experience", completed: false, xpReward: 50 },
    { id: "quest-projects", title: "Featured Projects", description: "Inspect projects & engines.", targetSection: "projects", completed: false, xpReward: 60 },
    { id: "quest-leadership", title: "Leadership Roles", description: "Explore leadership achievements.", targetSection: "leadership", completed: false, xpReward: 45 },
    { id: "quest-education", title: "Academic Foundations", description: "Review CS degree foundations.", targetSection: "education", completed: false, xpReward: 40 },
    { id: "quest-certs", title: "Verified Certifications", description: "Examine professional certifications.", targetSection: "certifications", completed: false, xpReward: 40 },
    { id: "quest-resume", title: "Resume Document", description: "Interact with the Resume node.", targetSection: "resume", completed: false, xpReward: 40 },
    { id: "quest-contact", title: "Contact Hub", description: "Send an email contact signal.", targetSection: "contact", completed: false, xpReward: 30 }
  ]));

  // Inventory & Equippable Items
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getSavedValue("inventory", [
    {
      id: "sword-ts",
      name: "TypeScript Core Engine",
      slot: "weapon",
      description: "Strict typing architecture preventing runtime null-pointer exceptions.",
      bonusText: "+30 Logic, +15 Scalability",
      statModifier: { logic: 30, scalability: 15 },
      equipped: false,
      icon: "âš¡"
    },
    {
      id: "shield-react",
      name: "React 19 Framework",
      slot: "shield",
      description: "Modern virtual DOM & server components for ultra-smooth UI rendering.",
      bonusText: "+25 Design, +15 Speed",
      statModifier: { design: 25, speed: 15 },
      equipped: false,
      icon: "ðŸ›¡ï¸"
    },
    {
      id: "amulet-node",
      name: "Node.js Architecture",
      slot: "accessory",
      description: "Non-blocking event loop engine powering scalable microservices.",
      bonusText: "+35 Scalability, +15 Logic",
      statModifier: { scalability: 35, logic: 15 },
      equipped: false,
      icon: "ðŸŒ"
    },
    {
      id: "boots-tailwind",
      name: "Tailwind Styling System",
      slot: "boots",
      description: "Utility-first CSS engine for responsive, pixel-perfect user interfaces.",
      bonusText: "+30 Speed, +15 Design",
      statModifier: { speed: 30, design: 15 },
      equipped: false,
      icon: "ðŸŽ¨"
    }
  ]));

  // Landmarks Definition
  const landmarks: MapNode[] = [
    { row: 2, col: 2, name: "Developer Profile", section: "about", description: "Bio & Systems Manifesto", color: "#e07a5f", radius: 20, icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
    { row: 2, col: 9, name: "Technical Skills", section: "skills", description: "Core Technical Stack", color: "#3d405b", radius: 20, icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> },
    { row: 9, col: 2, name: "Work Experience", section: "experience", description: "Career & Work Timeline", color: "#81b29a", radius: 20, icon: <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> },
    { row: 9, col: 9, name: "Featured Projects", section: "projects", description: "3D Engines & Web Apps", color: "#f2cc8f", radius: 20, icon: <FolderGit2 className="w-3.5 h-3.5 text-amber-600" /> },
    { row: 9, col: 5, name: "Leadership Roles", section: "leadership", description: "Community & Mentorship", color: "#708d81", radius: 20, icon: <Award className="w-3.5 h-3.5 text-teal-600" /> },
    { row: 5, col: 5, name: "Academic Foundations", section: "education", description: "Degree & CS Fundamentals", color: "#457b9d", radius: 20, icon: <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> },
    { row: 5, col: 2, name: "Certifications", section: "certifications", description: "Verified Credentials", color: "#e76f51", radius: 20, icon: <Star className="w-3.5 h-3.5 text-orange-500" /> },
    { row: 2, col: 5, name: "Resume & Dossier", section: "resume", description: "Download CV Document", color: "#2a9d8f", radius: 20, icon: <BookOpen className="w-3.5 h-3.5 text-teal-500" /> },
    { row: 5, col: 9, name: "Get In Touch", section: "contact", description: "Contact & Network Links", color: "#e9c46a", radius: 20, icon: <Mail className="w-3.5 h-3.5 text-yellow-600" /> }
  ];

  // Chest positions
  const [chests, setChests] = useState<Chest[]>(() => getSavedValue("chests", [
    { row: 4, col: 4, looted: false, itemId: "sword-ts" },
    { row: 7, col: 4, looted: false, itemId: "shield-react" },
    { row: 4, col: 7, looted: false, itemId: "amulet-node" },
    { row: 7, col: 7, looted: false, itemId: "boots-tailwind" }
  ]));

  // Gem states
  const [gems, setGems] = useState<Gem[]>(() => getSavedValue("gems", [
    { row: 1, col: 4, color: "#10b981", value: 15 },
    { row: 4, col: 1, color: "#f59e0b", value: 15 },
    { row: 8, col: 4, color: "#3b82f6", value: 15 },
    { row: 4, col: 8, color: "#ec4899", value: 15 },
    { row: 10, col: 5, color: "#8b5cf6", value: 15 }
  ]));

  // Loading Screen States
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [loadMessage, setLoadMessage] = useState("Initializing Overworld...");

  // Trigger floating text animation over canvas
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    setFloatingTexts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x, y, text, color, life: 60 }
    ]);
  };

  // Launch Game
  const handleLaunchGame = () => {
    let baseStats = { ...stats };
    if (playerClass === "spellblade") {
      baseStats = { ...baseStats, hp: 100, maxHp: 100, mp: 80, maxMp: 80, design: 15, logic: 20, speed: 18, scalability: 22 };
    } else if (playerClass === "pyromancer") {
      baseStats = { ...baseStats, hp: 90, maxHp: 90, mp: 120, maxMp: 120, design: 12, logic: 30, speed: 15, scalability: 25 };
    } else if (playerClass === "alchemist") {
      baseStats = { ...baseStats, hp: 110, maxHp: 110, mp: 70, maxMp: 70, design: 30, logic: 15, speed: 25, scalability: 15 };
    }
    setStats(baseStats);
    setGameState("loading");
    synthBeep([261.63, 329.63, 392.00, 523.25], "sine", 0.4, 0.05);
  };

  // Canvas Refs & Game Engine Variables
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getSavedPosition = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("adventure_game_v2_state");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.playerPosition) {
            return parsed.playerPosition;
          }
        }
      } catch (e) {}
    }
    return { row: 2, col: 2, x: 2, y: 2 };
  };
  const playerPosRef = useRef(getSavedPosition());
  const targetPosRef = useRef({ row: playerPosRef.current.row, col: playerPosRef.current.col, isMoving: false });

  // Save progress to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stateToSave = {
        gameState,
        playerName,
        playerClass,
        soundEnabled,
        activeCodexTab,
        viewMode,
        stats,
        quests,
        inventory,
        chests,
        gems,
        playerPosition: playerPosRef.current
      };
      localStorage.setItem("adventure_game_v2_state", JSON.stringify(stateToSave));
    } catch (err) {
      console.error("Failed to save state to localStorage:", err);
    }
  }, [gameState, playerName, playerClass, soundEnabled, activeCodexTab, viewMode, stats, quests, inventory, chests, gems]);

  // Teleport listener
  useEffect(() => {
    if (teleportSection) {
      handleCodexTabClick(teleportSection);
      if (onTeleportComplete) {
        onTeleportComplete();
      }
    }
  }, [teleportSection]);

  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);

  // Complete a Quest
  const completeQuest = (section: string) => {
    setQuests((prevQuests) => {
      return prevQuests.map((q) => {
        if (q.targetSection === section && !q.completed) {
          synthBeep([523.25, 659.25, 783.99, 1046.50], "sine", 0.3, 0.05);

          // Particles
          const px = playerPosRef.current.x;
          const py = playerPosRef.current.y;
          for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3;
            particlesRef.current.push({
              x: px,
              y: py,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 1,
              color: i % 2 === 0 ? "#10b981" : "#f59e0b",
              size: 2.5 + Math.random() * 3,
              alpha: 1,
              life: 40 + Math.random() * 30
            });
          }

          // Add XP & Level Up
          setStats((prevStats) => {
            let newXp = prevStats.xp + q.xpReward;
            let newLvl = prevStats.level;
            let nextXp = prevStats.nextLevelXp;
            
            if (newXp >= nextXp) {
              newXp -= nextXp;
              newLvl += 1;
              nextXp = Math.floor(nextXp * 1.5);
              setTimeout(() => {
                synthBeep([523.25, 783.99, 1318.51, 1567.98], "triangle", 0.5, 0.06);
              }, 300);
            }

            return {
              ...prevStats,
              level: newLvl,
              xp: newXp,
              nextLevelXp: nextXp
            };
          });

          return { ...q, completed: true };
        }
        return q;
      });
    });
  };

  // Synchronise clicking a tab in the Quest Codex
  const handleCodexTabClick = (section: string) => {
    setActiveCodexTab(section);
    const node = landmarks.find((n) => n.section === section);
    if (node) {
      playerPosRef.current = {
        row: node.row,
        col: node.col,
        x: node.row,
        y: node.col
      };
      targetPosRef.current = {
        row: node.row,
        col: node.col,
        isMoving: false
      };
      synthBeep([440, 880], "sine", 0.15, 0.03);
      completeQuest(section);
    }
  };

  // Loading Screen Timer
  useEffect(() => {
    if (gameState !== "loading") return;

    setLoadPercentage(0);
    const messages = [
      "COMPILING GAME ASSETS...",
      "GENERATING ISOMETRIC TERRAIN...",
      "CALIBRATING LOGPOSE NAVIGATION...",
      "SPAWNING CHESTS & CRYSTALS...",
      "ENABLING PATHFINDING ENGINE...",
      "WELCOME TO ZAINAB'S OVERWORLD!"
    ];

    const interval = setInterval(() => {
      setLoadPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGameState("playing");
          }, 250);
          return 100;
        }
        const step = Math.floor((prev / 100) * messages.length);
        setLoadMessage(messages[Math.min(messages.length - 1, step)]);
        return prev + 3;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard Movement
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return;
        }
        e.preventDefault();
      }

      let dR = 0;
      let dC = 0;
      if (e.code === "ArrowUp" || e.code === "KeyW") dR = -1;
      else if (e.code === "ArrowDown" || e.code === "KeyS") dR = 1;
      else if (e.code === "ArrowLeft" || e.code === "KeyA") dC = -1;
      else if (e.code === "ArrowRight" || e.code === "KeyD") dC = 1;

      if (dR !== 0 || dC !== 0) {
        const curR = playerPosRef.current.row;
        const curC = playerPosRef.current.col;
        const nextR = Math.max(0, Math.min(MAP_SIZE - 1, curR + dR));
        const nextC = Math.max(0, Math.min(MAP_SIZE - 1, curC + dC));

        targetPosRef.current = {
          row: nextR,
          col: nextC,
          isMoving: true
        };
        synthBeep([300], "sine", 0.05, 0.015);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // Main Canvas Rendering Engine
  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      frameCountRef.current++;
      const pCount = frameCountRef.current;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      const isDark = document.documentElement.classList.contains("dark");
      
      // Beautiful high-contrast color scheme
      const colBg = isDark ? "#0f172a" : "#f8fafc";
      const colGrass = isDark ? "#1e293b" : "#e2e8f0";
      const colGrassDark = isDark ? "#0f172a" : "#cbd5e1";
      const colPath = isDark ? "#334155" : "#f1f5f9";
      const colGrid = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.08)";

      // Clear Canvas
      ctx.fillStyle = colBg;
      ctx.fillRect(0, 0, w, h);

      // Isometric Center Offset
      const centerOffset = {
        x: w / 2,
        y: h / 2 - (MAP_SIZE * TILE_H) / 4 - 10
      };

      // Grid coordinate to screen pixel conversion
      const gridToScreen = (r: number, c: number) => {
        const sx = centerOffset.x + (c - r) * (TILE_W / 2);
        const sy = centerOffset.y + (c + r) * (TILE_H / 2);
        return { x: sx, y: sy };
      };

      // 1. Draw Isometric Grid Tiles
      for (let r = 0; r < MAP_SIZE; r++) {
        for (let c = 0; c < MAP_SIZE; c++) {
          const s = gridToScreen(r, c);
          const isPath = r === c || r === 2 || c === 2 || r === 9 || c === 9 || r === 5 || c === 5;
          const isHovered = hoverTile && hoverTile.row === r && hoverTile.col === c;

          // Tile Base
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + TILE_W / 2, s.y + TILE_H / 2);
          ctx.lineTo(s.x, s.y + TILE_H);
          ctx.lineTo(s.x - TILE_W / 2, s.y + TILE_H / 2);
          ctx.closePath();

          if (isHovered) {
            ctx.fillStyle = isDark ? "#3b82f6" : "#60a5fa";
          } else if (isPath) {
            ctx.fillStyle = colPath;
          } else {
            ctx.fillStyle = (r + c) % 2 === 0 ? colGrass : colGrassDark;
          }
          ctx.fill();

          // Grid Line Border
          ctx.strokeStyle = isHovered ? "#2563eb" : colGrid;
          ctx.lineWidth = isHovered ? 2 : 1;
          ctx.stroke();

          // Tile Depth 3D edge
          ctx.beginPath();
          ctx.moveTo(s.x - TILE_W / 2, s.y + TILE_H / 2);
          ctx.lineTo(s.x, s.y + TILE_H);
          ctx.lineTo(s.x, s.y + TILE_H + 4);
          ctx.lineTo(s.x - TILE_W / 2, s.y + TILE_H / 2 + 4);
          ctx.closePath();
          ctx.fillStyle = isDark ? "#020617" : "#94a3b8";
          ctx.fill();
        }
      }

      // 2. Smooth Player Interpolation
      const player = playerPosRef.current;
      const target = targetPosRef.current;
      if (target.isMoving) {
        const dx = target.row - player.x;
        const dy = target.col - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.04) {
          player.x += dx * 0.18;
          player.y += dy * 0.18;
          player.row = Math.round(player.x);
          player.col = Math.round(player.y);
        } else {
          player.x = target.row;
          player.y = target.col;
          player.row = target.row;
          player.col = target.col;
          target.isMoving = false;

          const nearNode = landmarks.find(
            (n) => Math.hypot(n.row - player.row, n.col - player.col) <= 1.2
          );
          if (nearNode) {
            setActiveCodexTab(nearNode.section);
            completeQuest(nearNode.section);
          }
        }
      }

      // 3. Render Companion Pet "Logic Wisp"
      const petAngle = pCount * 0.06;
      const petR = 0.75;
      const petRow = player.x + Math.cos(petAngle) * petR;
      const petCol = player.y + Math.sin(petAngle) * petR;
      const petS = gridToScreen(petRow, petCol);

      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#34d399";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(petS.x, petS.y + TILE_H / 2 - 10, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Render Gems
      gems.forEach((gem, idx) => {
        const s = gridToScreen(gem.row, gem.col);
        const floatY = Math.sin(pCount * 0.08 + idx) * 4;

        ctx.save();
        ctx.translate(s.x, s.y + TILE_H / 2 + floatY);

        ctx.fillStyle = gem.color;
        ctx.beginPath();
        ctx.moveTo(0, -7);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 7);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Collision with player
        const distToGem = Math.hypot(player.x - gem.row, player.y - gem.col);
        if (distToGem < 0.6) {
          setStats((prev) => {
            let nXp = prev.xp + gem.value;
            let nLvl = prev.level;
            let nextXp = prev.nextLevelXp;
            if (nXp >= nextXp) {
              nXp -= nextXp;
              nLvl += 1;
              nextXp = Math.floor(nextXp * 1.5);
              setTimeout(() => synthBeep([523.25, 783.99, 1318.51, 1567.98], "triangle", 0.5, 0.05), 200);
            }
            return { ...prev, xp: nXp, level: nLvl, nextLevelXp: nextXp };
          });

          synthBeep([587.33, 880], "sine", 0.1, 0.03);

          gem.row = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
          gem.col = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        }
      });

      // 5. Render Chests
      chests.forEach((chest) => {
        const s = gridToScreen(chest.row, chest.col);
        ctx.save();
        ctx.translate(s.x, s.y + TILE_H / 2 - 2);

        ctx.fillStyle = chest.looted ? "#64748b" : "#d97706";
        ctx.strokeStyle = isDark ? "#f8fafc" : "#0f172a";
        ctx.lineWidth = 1.5;

        // Chest Body
        ctx.beginPath();
        ctx.rect(-10, -6, 20, 12);
        ctx.fill();
        ctx.stroke();

        // Lock
        ctx.fillStyle = chest.looted ? "#cbd5e1" : "#fef08a";
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        const distToChest = Math.hypot(player.x - chest.row, player.y - chest.col);
        if (distToChest < 0.6 && !chest.looted) {
          chest.looted = true;
          setInventory((prevInv) =>
            prevInv.map((item) => (item.id === chest.itemId ? { ...item, equipped: true } : item))
          );
          synthBeep([523.25, 659.25, 783.99, 1046.50], "sine", 0.35, 0.04);
        }
      });

      // 6. Render Map Landmarks
      landmarks.forEach((node) => {
        const s = gridToScreen(node.row, node.col);
        const isHovered = activeCodexTab === node.section;

        ctx.save();
        ctx.translate(s.x, s.y + TILE_H / 2);

        // Ground Ring
        ctx.fillStyle = isHovered ? "rgba(59, 130, 246, 0.25)" : "rgba(15, 23, 42, 0.1)";
        ctx.beginPath();
        ctx.ellipse(0, 2, node.radius, node.radius / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Distinct Landmark Icons & Structures
        if (node.section === "about") {
          // Hearth Flame
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(0, -10, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (node.section === "skills") {
          // Floating Crystal Spire
          const cryBob = Math.sin(pCount * 0.08) * 3;
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.moveTo(0, -22 + cryBob);
          ctx.lineTo(8, -8 + cryBob);
          ctx.lineTo(0, 6 + cryBob);
          ctx.lineTo(-8, -8 + cryBob);
          ctx.closePath();
          ctx.fill();
        } else if (node.section === "experience") {
          // Lore Temple
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-12, -18, 24, 20);
        } else if (node.section === "projects") {
          // Creation Keep
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(-12, -18, 24, 22);
        } else if (node.section === "leadership") {
          // Command Fortress
          ctx.fillStyle = "#14b8a6";
          ctx.fillRect(-14, -14, 28, 18);
        } else if (node.section === "education") {
          // Sages Academy
          ctx.fillStyle = "#6366f1";
          ctx.fillRect(-12, -12, 24, 16);
        } else if (node.section === "certifications") {
          // Runic Sanctuary
          ctx.fillStyle = "#f97316";
          ctx.beginPath();
          ctx.arc(0, -8, 10, Math.PI, 0);
          ctx.fill();
        } else if (node.section === "resume") {
          // Dossier Obelisk
          ctx.fillStyle = "#0f766e";
          ctx.fillRect(-4, -22, 8, 26);
        } else if (node.section === "contact") {
          // Beacon
          ctx.fillStyle = "#eab308";
          ctx.fillRect(-5, -20, 10, 24);
        }

        ctx.restore();
      });

      // 7. Render Player Character
      const screenP = gridToScreen(player.x, player.y);
      const bobY = target.isMoving ? Math.abs(Math.sin(pCount * 0.25)) * 4 : Math.sin(pCount * 0.05) * 1.5;

      ctx.save();
      ctx.translate(screenP.x, screenP.y + TILE_H / 2 - 14 - bobY);

      // Shadow
      ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 16 + bobY, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body / Robe
      ctx.fillStyle = playerClass === "spellblade" ? "#2563eb" : playerClass === "pyromancer" ? "#dc2626" : "#059669";
      ctx.beginPath();
      ctx.moveTo(-7, 14);
      ctx.lineTo(0, -6);
      ctx.lineTo(7, 14);
      ctx.closePath();
      ctx.fill();

      // Head / Crown
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(0, -8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(-2, -8, 1.2, 0, Math.PI * 2);
      ctx.arc(2, -8, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Particles loop
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life--;
        p.alpha = Math.max(0, p.life / 50);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [gameState, playerClass, activeCodexTab, soundEnabled, gems, chests, hoverTile]);

  // Click Canvas handler for Pathfinding Movement
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerOffset = {
      x: rect.width / 2,
      y: rect.height / 2 - (MAP_SIZE * TILE_H) / 4 - 10
    };

    const dx = mouseX - centerOffset.x;
    const dy = mouseY - centerOffset.y;

    const col = Math.round((dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2);
    const row = Math.round((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);

    if (row >= 0 && row < MAP_SIZE && col >= 0 && col < MAP_SIZE) {
      targetPosRef.current = {
        row: row,
        col: col,
        isMoving: true
      };
      synthBeep([349.23], "sine", 0.08, 0.02);
    }
  };

  // Canvas Mouse Move for Hover Tile Tracking
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerOffset = {
      x: rect.width / 2,
      y: rect.height / 2 - (MAP_SIZE * TILE_H) / 4 - 10
    };

    const dx = mouseX - centerOffset.x;
    const dy = mouseY - centerOffset.y;

    const col = Math.round((dx / (TILE_W / 2) + dy / (TILE_H / 2)) / 2);
    const row = Math.round((dy / (TILE_H / 2) - dx / (TILE_W / 2)) / 2);

    if (row >= 0 && row < MAP_SIZE && col >= 0 && col < MAP_SIZE) {
      setHoverTile({ row, col });
    } else {
      setHoverTile(null);
    }
  };

  // Copy Email action
  const [copied, setCopied] = useState(false);
  const triggerCopyEmail = () => {
    navigator.clipboard.writeText("zainab.hina05@gmail.com");
    setCopied(true);
    synthBeep([523.25, 659.25, 783.99], "sine", 0.15, 0.04);
    setTimeout(() => setCopied(false), 2000);
    completeQuest("contact");
  };

  // Download CV action simulation
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success">("idle");
  const triggerCVDoc = () => {
    setDownloadState("loading");
    synthBeep([330, 440, 554, 659], "sine", 0.2, 0.03);
    setTimeout(() => {
      setDownloadState("success");
      completeQuest("resume");
      synthBeep([523.25, 1046.50], "sine", 0.25, 0.04);
      setTimeout(() => setDownloadState("idle"), 3000);
    }, 1200);
  };

  // Skill Challenge & Abilities System
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const challengeQuestions: Record<string, { question: string; options: string[]; correctIndex: number; badgeName: string }> = {
    about: {
      question: "What is Zainab's core architectural philosophy for high-performance graphics & systems?",
      options: ["Data-oriented ECS & memory locality", "Monolithic blocking callbacks", "Unchecked global state mutation", "Single-threaded polling"],
      correctIndex: 0,
      badgeName: "Systems Architect Insignia"
    },
    skills: {
      question: "Which low-level modern graphics APIs power real-time 3D game engines?",
      options: ["Vulkan / WebGPU / DirectX 12", "HTML4 Canvas 2D", "Pure CSS Keyframes", "jQuery Animate"],
      correctIndex: 0,
      badgeName: "Graphics Specialist Medal"
    },
    experience: {
      question: "What design pattern guarantees decoupled game entity logic?",
      options: ["Entity Component System (ECS)", "Deep OOP Inheritance Chains", "Global Event Singleton", "Spaghetti Scripting"],
      correctIndex: 0,
      badgeName: "Engineering Pioneer Emblem"
    },
    projects: {
      question: "Which approach is optimal for real-time physics and game loops in modern React web applications?",
      options: ["Custom RequestAnimationFrame & HTML5 Canvas", "Static HTML tables", "PHP Render Loop", "Server-side Cron"],
      correctIndex: 0,
      badgeName: "Engine Master Trophy"
    }
  };

  // Spell Action: Teleport Dash
  const handleCastDash = () => {
    if (stats.mp < 15) {
      addFloatingText(200, 150, "Low Logic MP!", "#ef4444");
      return;
    }
    setStats((prev) => ({ ...prev, mp: Math.max(0, prev.mp - 15), xp: prev.xp + 20 }));
    const activeLandmark = landmarks.find((l) => l.section === activeCodexTab) || landmarks[0];
    targetPosRef.current = { row: activeLandmark.row, col: activeLandmark.col, isMoving: true };
    synthBeep([440, 587.33, 880], "triangle", 0.25, 0.05);
    addFloatingText(220, 180, "âš¡ Teleport Dash (+20 XP)", "#10b981");
  };

  // Spell Action: Scan Region
  const handleScanNode = () => {
    synthBeep([300, 400, 500, 600], "sine", 0.2, 0.04);
    setStats((prev) => ({ ...prev, mp: Math.min(prev.maxMp, prev.mp + 20), xp: prev.xp + 15 }));
    addFloatingText(200, 180, "ðŸ” Node Scanned (+15 XP & +20 MP)", "#3b82f6");
  };

  // Spell Action: Class Specialization Power
  const handleCastSpecialization = () => {
    synthBeep([523.25, 659.25, 783.99, 1046.50], "sawtooth", 0.3, 0.05);
    setStats((prev) => ({ ...prev, xp: prev.xp + 30 }));
    const spellName = playerClass === "spellblade" ? "Arcane Pulse" : playerClass === "pyromancer" ? "Flame Burst" : "Alchemical Synthesis";
    addFloatingText(210, 170, `âœ¨ ${spellName} (+30 XP)`, "#f59e0b");
  };

  // Answer Skill Challenge
  const handleAnswerChallenge = (index: number) => {
    const q = challengeQuestions[activeCodexTab] || challengeQuestions.about;
    if (index === q.correctIndex) {
      synthBeep([523.25, 659.25, 783.99, 1046.50], "sine", 0.35, 0.06);
      setChallengeFeedback(`Correct! Unlocked ${q.badgeName} (+50 XP)`);
      setStats((prev) => ({ ...prev, xp: prev.xp + 50 }));
      
      // Add Badge to Inventory if not present
      if (!inventory.some((i) => i.name === q.badgeName)) {
        setInventory((prev) => [
          ...prev,
          {
            id: `badge-${Date.now()}`,
            name: q.badgeName,
            slot: "accessory",
            description: `Awarded for solving the ${activeCodexTab.toUpperCase()} technical challenge.`,
            bonusText: "+40 Mastery",
            statModifier: { logic: 40 },
            equipped: true,
            icon: "ðŸ†"
          }
        ]);
      }
      setTimeout(() => {
        setIsChallengeOpen(false);
        setChallengeFeedback(null);
      }, 1800);
    } else {
      synthBeep([200, 150], "sawtooth", 0.2, 0.04);
      setChallengeFeedback("Incorrect answer! Review the codex notes and try again.");
      setTimeout(() => setChallengeFeedback(null), 2000);
    }
  };

  return (
    <div className="w-full relative flex flex-col justify-start items-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. PROLOGUE CHARACTER SELECTION MODULE */}
      <AnimatePresence mode="wait">
        {gameState === "prologue" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          >
            <div 
              className="w-full max-w-xl perspective-[1200px]"
              onMouseMove={handlePrologueMouseMove}
              onMouseLeave={() => setPrologueTilt({ x: 0, y: 0 })}
            >
              <motion.div
                style={{
                  rotateY: prologueTilt.x,
                  rotateX: prologueTilt.y,
                  transformStyle: "preserve-3d",
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-500/40 p-6 rounded-2xl relative text-slate-900 dark:text-slate-100 shadow-2xl space-y-6"
              >
                {/* Close Button */}
                <button
                  onClick={() => setGameState("playing")}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="Close Setup Modal"
                >
                  âœ•
                </button>

                {/* Header */}
                <div className="text-center space-y-1">
                  <span className="font-mono text-xs uppercase tracking-widest text-brand-accent font-bold block">
                    MISSION CONTROL // SESSION STARTUP
                  </span>
                  <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-brand-secondary">
                    Operator Console
                  </h1>
                  <p className="text-xs text-brand-tertiary">
                    Select your primary system focus to initialize the exploration session
                  </p>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-brand-tertiary block">
                    Operator Identification Name:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 18) || "Zainab")}
                      className="w-full h-11 px-4 bg-brand-surface-light border border-brand-border text-brand-secondary font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-xl"
                      placeholder="Enter Operator Name..."
                    />
                    <User className="absolute right-3.5 top-3.5 w-4 h-4 text-brand-accent" />
                  </div>
                </div>

                {/* Focus Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-tertiary block">
                    System Focus Mode:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    {/* Systems Architecture */}
                    <button
                      onClick={() => {
                        setPlayerClass("spellblade");
                        synthBeep([600, 800], "sine", 0.08, 0.03);
                      }}
                      className={`p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                        playerClass === "spellblade"
                          ? "border-brand-accent bg-brand-accent/10 shadow-xs"
                          : "border-brand-border hover:border-brand-accent/50 bg-brand-surface-light"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-brand-secondary">Systems Architecture</h4>
                          <span className="text-xs">âš¡</span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-accent font-bold block mt-0.5">
                          [C++ & Graphics]
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-tertiary mt-2">
                        WebGL 3D graphics, physics engine loops, and C++ memory models.
                      </p>
                    </button>

                    {/* Full Stack */}
                    <button
                      onClick={() => {
                        setPlayerClass("pyromancer");
                        synthBeep([700, 900], "sine", 0.08, 0.03);
                      }}
                      className={`p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                        playerClass === "pyromancer"
                          ? "border-brand-accent bg-brand-accent/10 shadow-xs"
                          : "border-brand-border hover:border-brand-accent/50 bg-brand-surface-light"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-brand-secondary">Full-Stack Systems</h4>
                          <span className="text-xs">ðŸŒ</span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-accent font-bold block mt-0.5">
                          [MERN & Cloud]
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-tertiary mt-2">
                        Express backends, MongoDB schemas, and real-time REST/GraphQL APIs.
                      </p>
                    </button>

                    {/* AI Systems */}
                    <button
                      onClick={() => {
                        setPlayerClass("alchemist");
                        synthBeep([800, 1000], "sine", 0.08, 0.03);
                      }}
                      className={`p-3.5 border rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer ${
                        playerClass === "alchemist"
                          ? "border-brand-accent bg-brand-accent/10 shadow-xs"
                          : "border-brand-border hover:border-brand-accent/50 bg-brand-surface-light"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-brand-secondary">Intelligent Agents</h4>
                          <span className="text-xs">ðŸ¤–</span>
                        </div>
                        <span className="text-[10px] font-mono text-brand-accent font-bold block mt-0.5">
                          [LLM & AI Workflows]
                        </span>
                      </div>
                      <p className="text-[10px] text-brand-tertiary mt-2">
                        Integration of Gemini API, local LLMs, and intelligent agentic pipelines.
                      </p>
                    </button>

                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleLaunchGame}
                  className="w-full py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold text-xs font-mono uppercase tracking-widest rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>INITIALIZE SESSION</span>
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CINEMATIC LOADING SCREEN */}
      <AnimatePresence mode="wait">
        {gameState === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <div className="w-full max-w-md text-center space-y-6 p-8 border border-emerald-500/30 bg-slate-900 rounded-2xl shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                <Compass className="w-8 h-8 text-emerald-400 animate-spin-slow" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">
                  Loading {playerName}'s Workspace...
                </h2>
                <p className="font-mono text-xs text-emerald-400 animate-pulse">
                  {loadMessage}
                </p>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-100"
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN GAMEPLAY INTERACTIVE EXPLORER */}
      {gameState === "playing" && (
        <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
          
          {/* Section Header & View Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-brand-surface border border-brand-border p-4.5 rounded-2xl shadow-xs gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
                <span className="font-mono text-xs tracking-wider text-brand-accent uppercase font-semibold">
                  Operator Console
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-secondary">
                Systems & Architecture Map
              </h2>
            </div>

            {/* Portfolio Exploration Progress Bar */}
            <div className="w-full md:w-64 space-y-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-brand-tertiary uppercase">Portfolio Explored</span>
                <span className="text-brand-accent font-bold">
                  {Math.round((quests.filter(q => q.completed).length / quests.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-brand-surface-light h-2 rounded-full overflow-hidden border border-brand-border">
                <div 
                  className="bg-brand-accent h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${Math.round((quests.filter(q => q.completed).length / quests.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* View Mode Controls & Audio Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-brand-surface-light p-1 rounded-xl border border-brand-border">
                <button
                  onClick={() => setViewMode("game")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "game"
                      ? "bg-brand-surface text-brand-accent shadow-xs"
                      : "text-brand-tertiary hover:text-brand-secondary"
                  }`}
                  title="Full Overworld Canvas"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "split"
                      ? "bg-brand-surface text-brand-accent shadow-xs"
                      : "text-brand-tertiary hover:text-brand-secondary"
                  }`}
                  title="Split Canvas and Inspector"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
                <button
                  onClick={() => setViewMode("text")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "text"
                      ? "bg-brand-surface text-brand-accent shadow-xs"
                      : "text-brand-tertiary hover:text-brand-secondary"
                  }`}
                  title="Full Node Codex"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Node Codex</span>
                </button>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-brand-tertiary hover:text-brand-accent bg-brand-surface cursor-pointer flex items-center gap-2 text-xs font-medium"
                title={soundEnabled ? "Mute Audio" : "Enable Audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-accent" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? "Audio On" : "Muted"}</span>
              </button>
            </div>

          </div>

          {/* Interactive Inventory Drawer */}
          <AnimatePresence>
            {isBagOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg overflow-hidden"
              >
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Discovered Portfolio Artifacts
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                        item.equipped ? "border-emerald-500 bg-emerald-500/10" : "border-slate-200 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">{item.slot}</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs">{item.name}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-500">{item.bonusText}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {isClassSheetOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-lg overflow-hidden"
              >
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Quantified Capabilities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-semibold block">Design Mastery</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.design}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-semibold block">Logic Engine</span>
                    <span className="text-xl font-bold text-blue-500">{stats.logic}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-semibold block">Layout Velocity</span>
                    <span className="text-xl font-bold text-amber-500">{stats.speed}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-semibold block">Scalability</span>
                    <span className="text-xl font-bold text-teal-500">{stats.scalability}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unified Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Canvas Viewport */}
            {viewMode !== "text" && (
              <div className={`${viewMode === "game" ? "lg:col-span-12" : "lg:col-span-6"} relative space-y-3`}>
                <ThreeTownScene
                  teleportLandmark={teleportSection}
                  onLandmarkSelect={(landmarkId) => {
                    if (landmarkId === "bookstall") {
                      setBookstallOpen(true);
                      if (onTeleportComplete) onTeleportComplete();
                      return;
                    }
                    handleCodexTabClick(landmarkId);
                    completeQuest(landmarkId);
                    if (onTeleportComplete) onTeleportComplete();
                  }}
                  paused={bookstallOpen}
                  onSwitchToScrollMode={onSwitchToScrollMode}
                />
                <PortfolioBookstall open={bookstallOpen} onClose={() => setBookstallOpen(false)} />
              </div>
            )}

            {/* Quest Codex / Portfolio Text Panel */}
            {viewMode !== "game" && (
              <div className={`${viewMode === "text" ? "lg:col-span-12" : "lg:col-span-6"} space-y-4`}>
                
                <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl shadow-xs space-y-6">
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-1.5 border-b border-brand-border/60 pb-3">
                    {landmarks.map((node) => (
                      <button
                        key={node.section}
                        onClick={() => handleCodexTabClick(node.section)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeCodexTab === node.section
                            ? "bg-brand-accent text-white shadow-xs"
                            : "text-brand-tertiary hover:bg-brand-surface-light hover:text-brand-secondary"
                        }`}
                      >
                        {node.icon}
                        <span className="capitalize">{node.section}</span>
                      </button>
                    ))}
                  </div>

                  {/* Section Content */}
                  <div className="min-h-[300px] max-h-[460px] overflow-y-auto pr-2 space-y-6">
                    <AnimatePresence mode="wait">
                      
                      {/* About */}
                      {activeCodexTab === "about" && (
                        <motion.div
                          key="about"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              LOCATION // FAISALABAD, PAKISTAN
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                              Zainab (Zaeb) â€” Developer Manifesto
                            </h3>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            I build 3D interactive games, high-performance MERN backends, and agentic AI systems. By mastering both systems programming and full-stack architecture, I bridge code logic with immersive user experiences.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-bold text-emerald-600 block">[SPECIALIZATION]</span>
                              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1 block">
                                C++, WebGL 3D, ECS game loops, A* pathfinding
                              </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-bold text-emerald-600 block">[FULL-STACK]</span>
                              <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1 block">
                                MERN platforms (Yalla E-Commerce), Snowflake cloud data
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Skills */}
                      {activeCodexTab === "skills" && (
                        <motion.div
                          key="skills"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Technical Skills & Mastery
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {SKILL_CATEGORIES.map((cat, idx) => (
                              <div key={cat.categoryName || idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <span className="text-xs font-bold text-emerald-600 uppercase block">{cat.categoryName}</span>
                                <div className="flex flex-wrap gap-1">
                                  {cat.skills.map((skill, sIdx) => (
                                    <span key={`${cat.categoryName}-${skill}-${sIdx}`} className="text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Projects */}
                      {activeCodexTab === "projects" && (
                        <motion.div
                          key="projects"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Featured Projects & Game Engines
                          </h3>

                          <div className="space-y-4">
                            {PROJECT_PLACEHOLDERS.map((proj) => (
                              <div key={proj.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{proj.titlePlaceholder}</h4>
                                    <span className="text-xs text-emerald-600 font-semibold">{proj.subtitlePlaceholder}</span>
                                  </div>
                                  <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{proj.yearPlaceholder}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{proj.descriptionPlaceholder}</p>
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {proj.techStack.map((tech, tIdx) => (
                                    <span key={`${proj.id}-${tech}-${tIdx}`} className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                                {proj.links.live && proj.links.live !== "#" && (
                                  <div className="pt-2 flex gap-2">
                                    <a
                                      href={proj.links.live}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                    >
                                      Launch <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Experience */}
                      {activeCodexTab === "experience" && (
                        <motion.div
                          key="experience"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Work Experience Timeline
                          </h3>

                          <div className="space-y-4">
                            {EXPERIENCE_PLACEHOLDERS.map((exp) => (
                              <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-base">{exp.rolePlaceholder}</h4>
                                    <span className="text-xs text-emerald-600 font-semibold">{exp.companyPlaceholder}</span>
                                  </div>
                                  <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{exp.periodPlaceholder}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{exp.descriptionPlaceholder}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Leadership */}
                      {activeCodexTab === "leadership" && (
                        <motion.div
                          key="leadership"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Leadership & Community Roles
                          </h3>

                          <div className="space-y-3">
                            {LEADERSHIP_PLACEHOLDERS.map((lead) => (
                              <div key={lead.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm">{lead.rolePlaceholder}</h4>
                                  <span className="text-xs font-mono text-slate-500">{lead.periodPlaceholder}</span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 block">{lead.organizationPlaceholder}</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{lead.descriptionPlaceholder}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Education */}
                      {activeCodexTab === "education" && (
                        <motion.div
                          key="education"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Academic Credentials
                          </h3>

                          <div className="space-y-3">
                            {EDUCATION_PLACEHOLDERS.map((edu) => (
                              <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm">{edu.degreePlaceholder}</h4>
                                  <span className="text-xs font-mono text-slate-500">{edu.periodPlaceholder}</span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 block">{edu.institutionPlaceholder}</span>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{edu.descriptionPlaceholder}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Certifications */}
                      {activeCodexTab === "certifications" && (
                        <motion.div
                          key="certifications"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Verified Certifications
                          </h3>

                          <div className="space-y-3">
                            {CERTIFICATION_PLACEHOLDERS.map((cert) => (
                              <div key={cert.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                  <h4 className="font-bold text-sm">{cert.title}</h4>
                                  <span className="text-xs text-emerald-600 font-semibold">{cert.issuer}</span>
                                </div>
                                <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{cert.date}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Resume */}
                      {activeCodexTab === "resume" && (
                        <motion.div
                          key="resume"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4 text-center py-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Curriculum Vitae Document
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                            Save a physical snapshot of my complete game development systems, full-stack achievements, and technical trajectory.
                          </p>

                          <button
                            onClick={triggerCVDoc}
                            disabled={downloadState !== "idle"}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <FileDown className="w-4 h-4" />
                            <span>{downloadState === "loading" ? "Compiling PDF..." : downloadState === "success" ? "Unlocked CV!" : "Download Resume PDF"}</span>
                          </button>
                        </motion.div>
                      )}

                      {/* Contact */}
                      {activeCodexTab === "contact" && (
                        <motion.div
                          key="contact"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Connect & Alliances
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Available for game development roles, C++ graphics contracts, and full-stack engineering collaborations.
                          </p>

                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="font-mono text-xs font-bold">zainab.hina05@gmail.com</span>
                            <button
                              onClick={triggerCopyEmail}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied ? "Copied!" : "Copy Email"}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

      {/* SKILL CHALLENGE QUIZ MODAL */}
      <AnimatePresence>
        {isChallengeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-2xl shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 relative"
            >
              <button
                onClick={() => {
                  setIsChallengeOpen(false);
                  setChallengeFeedback(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm font-bold p-1"
              >
                âœ•
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-bold block">
                    ENGINEERING QUIZ TEST
                  </span>
                  <h3 className="text-base font-bold capitalize">
                    {activeCodexTab} Challenge
                  </h3>
                </div>
              </div>

              {(() => {
                const q = challengeQuestions[activeCodexTab] || challengeQuestions.about;
                return (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerChallenge(idx)}
                          className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>

                    {challengeFeedback && (
                      <div className={`p-3 rounded-xl text-xs font-bold text-center border ${
                        challengeFeedback.startsWith("Correct")
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/10 border-red-500 text-red-500"
                      }`}>
                        {challengeFeedback}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}




