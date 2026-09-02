import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * AboutCyclicBackground
 *
 * Implements a bespoke background crafted from the 3 palette shades:
 * - Shade 3 (Dark Charcoal Taupe): #15161D
 * - Shade 4 (Warm Sandstone Taupe): #39363B
 * - Shade 5 (Soft Rose Alabaster / Light Sand Cream): #D5C5BA
 *
 * Features multi-layered continuous cyclic animations:
 * 1. Cyclic rotating concentric orbital dials & astrolabe rings (clockwise / counter-clockwise)
 * 2. Cyclic expanding sonar wave pulses (repeating scale/opacity waves)
 * 3. Cyclic harmonic glowing orbs floating along Lissajous paths
 * 4. Cyclical data flow streams running along vector tracks
 * 5. Smooth mouse parallax response for layered depth
 */
export default function AboutCyclicBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. CYCLIC ROTATING CONCENTRIC RINGS & ASTROLABE DIALS
      gsap.to(".cyclic-ring-slow-cw", {
        rotation: 360,
        transformOrigin: "center center",
        duration: 72,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cyclic-ring-slow-ccw", {
        rotation: -360,
        transformOrigin: "center center",
        duration: 60,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cyclic-ring-mid-cw", {
        rotation: 360,
        transformOrigin: "center center",
        duration: 40,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cyclic-ring-fast-ccw", {
        rotation: -360,
        transformOrigin: "center center",
        duration: 28,
        repeat: -1,
        ease: "none",
      });

      // 2. CYCLIC ORBITING SATELLITE NODES
      gsap.to(".cyclic-orbit-node-1", {
        rotation: 360,
        transformOrigin: "0px 0px",
        duration: 34,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cyclic-orbit-node-2", {
        rotation: -360,
        transformOrigin: "0px 0px",
        duration: 24,
        repeat: -1,
        ease: "none",
      });

      // 3. CYCLIC EXPANDING RADAR / WAVE PULSES
      gsap.to(".cyclic-wave-pulse-1", {
        scale: 2.2,
        opacity: 0,
        duration: 7,
        repeat: -1,
        ease: "power1.out",
        transformOrigin: "center center",
        stagger: {
          each: 2.3,
          repeat: -1,
        },
      });

      gsap.to(".cyclic-wave-pulse-2", {
        scale: 1.8,
        opacity: 0,
        duration: 9,
        repeat: -1,
        ease: "power2.out",
        transformOrigin: "center center",
        stagger: {
          each: 3.1,
          repeat: -1,
        },
      });

      // 4. CYCLIC BREATHING / HARMONIC SCALE RINGS
      gsap.to(".cyclic-breathe-ring", {
        scale: 1.15,
        opacity: 0.7,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });

      // 5. CYCLIC DATA STREAM DASH FLOWS
      gsap.to(".cyclic-stream-cw", {
        strokeDashoffset: -120,
        duration: 10,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".cyclic-stream-ccw", {
        strokeDashoffset: 120,
        duration: 12,
        repeat: -1,
        ease: "none",
      });

      // 6. CYCLIC GLOWING ORBS MOVEMENT
      gsap.to(".cyclic-glow-orb-1", {
        x: "random(-60, 60)",
        y: "random(-40, 40)",
        scale: "random(0.9, 1.25)",
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".cyclic-glow-orb-2", {
        x: "random(-70, 70)",
        y: "random(-50, 50)",
        scale: "random(0.85, 1.3)",
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".cyclic-glow-orb-3", {
        x: "random(-50, 50)",
        y: "random(-60, 60)",
        scale: "random(0.95, 1.2)",
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 7. CYCLIC BEZIER WAVE MORPHING
      const waveState = { y1: 180, y2: 420, y3: 200, y4: 400 };
      gsap.to(waveState, {
        y1: 380,
        y2: 220,
        y3: 390,
        y4: 400,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        onUpdate: () => {
          if (path1Ref.current) {
            path1Ref.current.setAttribute(
              "d",
              `M 0 ${waveState.y1} C 300 ${waveState.y2}, 700 ${waveState.y1}, 1000 ${waveState.y2}`
            );
          }
          if (path2Ref.current) {
            path2Ref.current.setAttribute(
              "d",
              `M 0 ${waveState.y3} C 350 ${waveState.y4}, 650 ${waveState.y3}, 1000 ${waveState.y4}`
            );
          }
        },
      });

      // 8. PARALLAX MOUSE INTERACTION
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;

        const xOffset = clientX / width - 0.5;
        const yOffset = clientY / height - 0.5;

        gsap.to(".cyclic-parallax-deep", {
          x: xOffset * 20,
          y: yOffset * 20,
          duration: 2.2,
          ease: "power2.out",
        });

        gsap.to(".cyclic-parallax-mid", {
          x: xOffset * 40,
          y: yOffset * 40,
          duration: 1.6,
          ease: "power2.out",
        });

        gsap.to(".cyclic-parallax-fore", {
          x: xOffset * 65,
          y: yOffset * 65,
          duration: 1.2,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="zaeb-about-cyclic-bg absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0"
      style={{
        // 3 shades background base:
        // Shade 3: #15161D (Espresso Charcoal Taupe)
        // Shade 4: #39363B (Warm Sandstone Taupe)
        // Shade 5: #D5C5BA (Soft Light Rose Cream)
        background: `radial-gradient(ellipse 90% 70% at 50% 15%, #252833 0%, #15161D 55%, #0A0303 100%)`,
      }}
      aria-hidden="true"
    >
      {/* ── Layer 1: Ambient Multi-Shade Glow Clouds ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Shade 3 (Dark Charcoal Taupe / Espresso) glow layer */}
        <div
          className="cyclic-parallax-deep cyclic-glow-orb-1 absolute top-[10%] left-[15%] w-[560px] h-[560px] rounded-full blur-[140px] opacity-45 pointer-events-none"
          style={{ background: "radial-gradient(circle, #15161D 0%, rgba(21, 22, 29, 0) 70%)" }}
        />

        {/* Shade 4 (Warm Sandstone Taupe) glow layer */}
        <div
          className="cyclic-parallax-mid cyclic-glow-orb-2 absolute bottom-[20%] right-[12%] w-[640px] h-[640px] rounded-full blur-[160px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #39363B 0%, rgba(57, 54, 59, 0) 70%)" }}
        />

        {/* Shade 5 (Soft Rose Alabaster / Light Sand Cream) focal luminous bloom */}
        <div
          className="cyclic-parallax-fore cyclic-glow-orb-3 absolute top-[35%] right-[25%] w-[480px] h-[480px] rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #D5C5BA 0%, rgba(213, 197, 186, 0) 65%)" }}
        />

        {/* Center atmospheric spotlight */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[180px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #D5C5BA 0%, #39363B 40%, transparent 75%)" }}
        />
      </div>

      {/* ── Layer 2: Subtle Micro-Dot Matrix Blueprint ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cyclic-dot-grid" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#D5C5BA" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyclic-dot-grid)" />
      </svg>

      {/* ── Layer 3: Main Cyclic Vector Canvas ── */}
      <svg
        className="w-full h-full min-w-[1280px] min-h-[900px] absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        viewBox="0 0 1200 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradient transitions across the 3 shades */}
          <linearGradient id="cyclic-grad-taupe-cream" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15161D" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#39363B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D5C5BA" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="cyclic-grad-cream-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D5C5BA" stopOpacity="0" />
            <stop offset="50%" stopColor="#D5C5BA" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D5C5BA" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="cyclic-grad-sand-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#39363B" stopOpacity="0" />
            <stop offset="50%" stopColor="#D5C5BA" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#39363B" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="cyclic-radial-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D5C5BA" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#39363B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#15161D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── LEFT CYCLIC ENGINE: Concentric Astrolabe & Radar System ── */}
        <g className="cyclic-parallax-mid" transform="translate(220, 320)">
          {/* Cyclic sonar wave pulses (Expanding outwards) */}
          <circle cx="0" cy="0" r="70" stroke="#D5C5BA" strokeWidth="1" opacity="0.6" className="cyclic-wave-pulse-1" />
          <circle cx="0" cy="0" r="70" stroke="#39363B" strokeWidth="0.8" opacity="0.6" className="cyclic-wave-pulse-1" style={{ animationDelay: "1.5s" }} />
          <circle cx="0" cy="0" r="70" stroke="#D5C5BA" strokeWidth="0.6" opacity="0.6" className="cyclic-wave-pulse-1" style={{ animationDelay: "3s" }} />

          {/* Central subtle glowing radial core */}
          <circle cx="0" cy="0" r="140" fill="url(#cyclic-radial-core)" />

          {/* Outer primary astrolabe ring — Slow Clockwise */}
          <circle
            cx="0"
            cy="0"
            r="165"
            stroke="#39363B"
            strokeWidth="0.75"
            strokeDasharray="4 8 16 8"
            className="cyclic-ring-slow-cw"
            opacity="0.5"
          />

          {/* Segmented calibrator ring — Medium Counter-Clockwise */}
          <circle
            cx="0"
            cy="0"
            r="135"
            stroke="#D5C5BA"
            strokeWidth="1.2"
            strokeDasharray="80 25 15 25"
            className="cyclic-ring-slow-ccw"
            opacity="0.65"
          />

          {/* Precision tick-mark ring — Fast Counter-Clockwise */}
          <circle
            cx="0"
            cy="0"
            r="105"
            stroke="#D5C5BA"
            strokeWidth="0.8"
            strokeDasharray="2 6"
            className="cyclic-ring-fast-ccw"
            opacity="0.55"
          />

          {/* Mid breathing ring */}
          <circle
            cx="0"
            cy="0"
            r="75"
            stroke="#39363B"
            strokeWidth="1.5"
            className="cyclic-breathe-ring"
            opacity="0.4"
          />

          {/* Inner orbit track with satellite node */}
          <circle
            cx="0"
            cy="0"
            r="50"
            stroke="#15161D"
            strokeWidth="1"
            strokeDasharray="6 4"
            opacity="0.6"
          />

          <g className="cyclic-orbit-node-1">
            <circle cx="50" cy="0" r="4.5" fill="#D5C5BA" stroke="#15161D" strokeWidth="1.5" />
            <circle cx="-50" cy="0" r="3" fill="#39363B" />
          </g>

          {/* Center compass crosshairs */}
          <line x1="-190" y1="0" x2="190" y2="0" stroke="#39363B" strokeWidth="0.6" strokeDasharray="5 5" opacity="0.35" />
          <line x1="0" y1="-190" x2="0" y2="190" stroke="#39363B" strokeWidth="0.6" strokeDasharray="5 5" opacity="0.35" />

          {/* Center focal point */}
          <circle cx="0" cy="0" r="3.5" fill="#D5C5BA" />
          <circle cx="0" cy="0" r="8" stroke="#D5C5BA" strokeWidth="0.75" opacity="0.7" />

          {/* Engineering telemetry labels */}
          <text x="14" y="-142" fill="#D5C5BA" fontSize="8" fontFamily="monospace" letterSpacing="1.5" opacity="0.7">
            CYCLIC_CORE_A // R_135.00
          </text>
          <text x="14" y="-172" fill="#39363B" fontSize="7" fontFamily="monospace" letterSpacing="2" opacity="0.5">
            ORBITAL_FREQUENCY [1.02 Hz]
          </text>
        </g>

        {/* ── RIGHT CYCLIC ENGINE: Secondary Orbital Matrix ── */}
        <g className="cyclic-parallax-fore" transform="translate(980, 560)">
          {/* Secondary wave pulse */}
          <circle cx="0" cy="0" r="60" stroke="#D5C5BA" strokeWidth="0.75" opacity="0.5" className="cyclic-wave-pulse-2" />
          <circle cx="0" cy="0" r="60" stroke="#39363B" strokeWidth="0.75" opacity="0.5" className="cyclic-wave-pulse-2" style={{ animationDelay: "2s" }} />

          {/* Outer ring — Counter-Clockwise */}
          <circle
            cx="0"
            cy="0"
            r="140"
            stroke="#39363B"
            strokeWidth="0.75"
            strokeDasharray="20 8 4 8"
            className="cyclic-ring-slow-ccw"
            opacity="0.45"
          />

          {/* Inner ring — Clockwise */}
          <circle
            cx="0"
            cy="0"
            r="95"
            stroke="#D5C5BA"
            strokeWidth="1"
            strokeDasharray="50 20 10 20"
            className="cyclic-ring-mid-cw"
            opacity="0.6"
          />

          {/* Orbiting Satellite Node 2 */}
          <g className="cyclic-orbit-node-2">
            <circle cx="95" cy="0" r="4" fill="#D5C5BA" stroke="#15161D" strokeWidth="1" />
            <circle cx="0" cy="95" r="2.5" fill="#39363B" />
          </g>

          <line x1="-155" y1="-155" x2="155" y2="155" stroke="#39363B" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
          <text x="-120" y="16" fill="#D5C5BA" fontSize="7" fontFamily="monospace" letterSpacing="1.2" opacity="0.55">
            CYCLIC_PHASE_02 // SYNCED
          </text>
        </g>

        {/* ── TOP-RIGHT CYCLIC DIAL: Micro Orbit ── */}
        <g className="cyclic-parallax-deep" transform="translate(860, 140)">
          <circle
            cx="0"
            cy="0"
            r="65"
            stroke="#D5C5BA"
            strokeWidth="0.75"
            strokeDasharray="12 6"
            className="cyclic-ring-mid-cw"
            opacity="0.4"
          />
          <circle
            cx="0"
            cy="0"
            r="45"
            stroke="#39363B"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="cyclic-ring-fast-ccw"
            opacity="0.35"
          />
          <circle cx="0" cy="0" r="2" fill="#D5C5BA" opacity="0.7" />
        </g>

        {/* ── HORIZONTAL CYCLIC SIGNAL PATHWAYS ── */}
        <g className="cyclic-parallax-mid opacity-40">
          {/* Static guideline tracks */}
          <path d="M 40 180 L 1160 180" stroke="#15161D" strokeWidth="0.75" opacity="0.4" />
          <path d="M 60 720 L 1140 720" stroke="#15161D" strokeWidth="0.75" opacity="0.4" />

          {/* Dynamic cyclic streaming pulses */}
          <path
            d="M 40 180 L 1160 180"
            stroke="url(#cyclic-grad-cream-glow)"
            strokeWidth="1.5"
            strokeDasharray="40 180"
            className="cyclic-stream-cw"
          />
          <path
            d="M 60 720 L 1140 720"
            stroke="url(#cyclic-grad-sand-flow)"
            strokeWidth="1.5"
            strokeDasharray="30 220"
            className="cyclic-stream-ccw"
          />
        </g>

        {/* ── CYCLIC HARMONIC BEZIER CURVE WAVES ── */}
        <g className="cyclic-parallax-deep opacity-35">
          <path
            ref={path1Ref}
            d="M 0 180 C 300 420, 700 180, 1000 420"
            stroke="url(#cyclic-grad-taupe-cream)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="8 6"
          />
          <path
            ref={path2Ref}
            d="M 0 200 C 350 400, 650 200, 1000 400"
            stroke="#D5C5BA"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
        </g>
      </svg>

      {/* ── Corner Telemetry Specs ── */}
      <div className="absolute top-10 left-10 font-mono text-[8px] text-[#D5C5BA]/30 uppercase tracking-[0.22em] hidden lg:block">
        SYSTEM_THEME // TAUPE_CREAM_MATRIX [03, 04, 05]
      </div>
      <div className="absolute top-10 right-10 font-mono text-[8px] text-[#D5C5BA]/30 uppercase tracking-[0.22em] hidden lg:block">
        CYCLIC_ENGINE // CONTINUOUS_LOOP_ONLINE
      </div>
    </div>
  );
}
