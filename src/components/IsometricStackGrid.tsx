"use client";

import { motion } from "motion/react";
import { Sparkles, Terminal, ArrowUpRight } from "lucide-react";
import "./isometric-stack.css";

export interface IsometricTileData {
  id: string;
  name: string;
  category: string;
  fileTarget?: string;
  color: string;
  glow: string;
  icon: string | React.ReactNode;
  isSvg?: boolean;
}

export const ISOMETRIC_TILES: IsometricTileData[] = [
  // Top Row (Row 1)
  {
    id: "nextjs",
    name: "Next.js",
    category: "Full Stack & SSR",
    fileTarget: "nextjs-config",
    color: "#ffffff",
    glow: "rgba(255, 255, 255, 0.35)",
    icon: (
      <svg viewBox="0 0 180 180" className="iso-icon-svg" fill="currentColor">
        <mask height="180" id="mask0" maskUnits="userSpaceOnUse" width="180" x="0" y="0" style={{ maskType: "alpha" }}>
          <circle cx="90" cy="90" fill="black" r="90" />
        </mask>
        <g mask="url(#mask0)">
          <circle cx="90" cy="90" data-theme="dark" fill="black" r="90" />
          <path d="M149.508 157.438L69.1478 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.137 149.508 157.438Z" fill="white" />
          <rect fill="white" height="72" width="12" x="115" y="54" />
        </g>
      </svg>
    ),
  },
  {
    id: "motion",
    name: "Motion",
    category: "Kinetic UI & Physics",
    fileTarget: "react-tsx",
    color: "#FFE600",
    glow: "rgba(255, 230, 0, 0.4)",
    icon: (
      <div className="iso-motion-badge">
        <svg viewBox="0 0 24 24" className="iso-icon-svg" fill="currentColor">
          <path d="M4 4h16v8l-8 8-8-8V4zm8 11.172L16.586 10H7.414L12 15.172z" />
        </svg>
      </div>
    ),
  },
  {
    id: "gsap",
    name: "GSAP",
    category: "ScrollTrigger & 3D",
    fileTarget: "gsap-scroll",
    color: "#88CE02",
    glow: "rgba(136, 206, 2, 0.4)",
    icon: (
      <span className="iso-text-logo" style={{ color: "#88CE02" }}>
        GSAP
      </span>
    ),
  },

  // Middle Row (Row 2)
  {
    id: "react",
    name: "React 19",
    category: "Component Systems",
    fileTarget: "react-tsx",
    color: "#61DAFB",
    glow: "rgba(97, 218, 251, 0.4)",
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="iso-icon-svg" fill="none" stroke="#61DAFB" strokeWidth="1.2">
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
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Design Tokens & UI",
    fileTarget: "tailwind-css",
    color: "#38BDF8",
    glow: "rgba(56, 189, 248, 0.4)",
    icon: (
      <svg viewBox="0 0 24 24" className="iso-icon-svg" fill="#38BDF8">
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C9.337,13.382,7.976,12,6.001,12z" />
      </svg>
    ),
  },

  // Bottom Row (Row 3)
  {
    id: "typescript",
    name: "TypeScript",
    category: "Strict Type Safety",
    fileTarget: "react-tsx",
    color: "#3178C6",
    glow: "rgba(49, 120, 198, 0.45)",
    icon: (
      <div className="iso-ts-badge">
        <span className="iso-ts-text">TS</span>
      </div>
    ),
  },
];

interface IsometricStackGridProps {
  onSelectFile?: (fileId: string) => void;
}

export function IsometricStackGrid({ onSelectFile }: IsometricStackGridProps) {
  return (
    <div className="iso-stage-wrapper">
      {/* Top Banner Notice */}
      <div className="iso-header-bar">
        <div className="iso-header-pill">
          <Sparkles size={12} className="text-[#dac6bd]" />
          <span>INTERACTIVE STACK MATRIX // HOVER TO ENERGIZE</span>
        </div>
        <span className="iso-header-hint">CLICK TO INSPECT SOURCE CODE</span>
      </div>

      {/* 3D Isometric Viewport */}
      <div className="iso-canvas-container">
        <div className="iso-grid-layout">
          {/* Row 1: Next.js, Motion, GSAP */}
          <div className="iso-row iso-row-1">
            {ISOMETRIC_TILES.slice(0, 3).map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                className="iso-tile-btn group"
                onClick={() => tile.fileTarget && onSelectFile?.(tile.fileTarget)}
                whileHover={{
                  y: -12,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 350, damping: 18 },
                }}
                whileTap={{ scale: 0.98 }}
                style={
                  {
                    "--tile-color": tile.color,
                    "--tile-glow": tile.glow,
                  } as React.CSSProperties
                }
              >
                {/* 3D Bottom Extrusion Block */}
                <div className="iso-tile-shadow" />
                <div className="iso-tile-extrusion" />

                {/* 3D Top Grid Face */}
                <div className="iso-tile-face">
                  {/* Grid Mesh Overlay */}
                  <div className="iso-grid-mesh" />

                  {/* Centered Glowing Icon */}
                  <div className="iso-icon-wrapper">{tile.icon}</div>

                  {/* Hover Energy Glare */}
                  <div className="iso-glare-effect" />
                </div>

                {/* Floating Tooltip Label */}
                <div className="iso-tile-tooltip">
                  <span className="iso-tooltip-name">{tile.name}</span>
                  <span className="iso-tooltip-cat">{tile.category}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Row 2: React, Tailwind CSS */}
          <div className="iso-row iso-row-2">
            {ISOMETRIC_TILES.slice(3, 5).map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                className="iso-tile-btn group"
                onClick={() => tile.fileTarget && onSelectFile?.(tile.fileTarget)}
                whileHover={{
                  y: -12,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 350, damping: 18 },
                }}
                whileTap={{ scale: 0.98 }}
                style={
                  {
                    "--tile-color": tile.color,
                    "--tile-glow": tile.glow,
                  } as React.CSSProperties
                }
              >
                {/* 3D Bottom Extrusion Block */}
                <div className="iso-tile-shadow" />
                <div className="iso-tile-extrusion" />

                {/* 3D Top Grid Face */}
                <div className="iso-tile-face">
                  <div className="iso-grid-mesh" />
                  <div className="iso-icon-wrapper">{tile.icon}</div>
                  <div className="iso-glare-effect" />
                </div>

                {/* Floating Tooltip Label */}
                <div className="iso-tile-tooltip">
                  <span className="iso-tooltip-name">{tile.name}</span>
                  <span className="iso-tooltip-cat">{tile.category}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Row 3: TypeScript */}
          <div className="iso-row iso-row-3">
            {ISOMETRIC_TILES.slice(5, 6).map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                className="iso-tile-btn group"
                onClick={() => tile.fileTarget && onSelectFile?.(tile.fileTarget)}
                whileHover={{
                  y: -12,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 350, damping: 18 },
                }}
                whileTap={{ scale: 0.98 }}
                style={
                  {
                    "--tile-color": tile.color,
                    "--tile-glow": tile.glow,
                  } as React.CSSProperties
                }
              >
                {/* 3D Bottom Extrusion Block */}
                <div className="iso-tile-shadow" />
                <div className="iso-tile-extrusion" />

                {/* 3D Top Grid Face */}
                <div className="iso-tile-face">
                  <div className="iso-grid-mesh" />
                  <div className="iso-icon-wrapper">{tile.icon}</div>
                  <div className="iso-glare-effect" />
                </div>

                {/* Floating Tooltip Label */}
                <div className="iso-tile-tooltip">
                  <span className="iso-tooltip-name">{tile.name}</span>
                  <span className="iso-tooltip-cat">{tile.category}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="iso-bottom-summary">
        <div className="flex items-center gap-2 text-xs font-mono text-[#dac6bd]">
          <Terminal size={13} className="text-[#e0455f]" />
          <span>PRODUCTION-GRADE ARCHITECTURE // STRICT TYPES • SSR • SHADERS</span>
        </div>
        <span className="text-[11px] font-mono text-[#736b63] uppercase">
          CLICK ANY BUTTON TO LOAD SOURCE FILE
        </span>
      </div>
    </div>
  );
}

export default IsometricStackGrid;
