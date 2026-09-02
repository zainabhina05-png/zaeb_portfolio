import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const handle1Ref = useRef<SVGLineElement>(null);
  const handle2Ref = useRef<SVGLineElement>(null);
  const point1Ref = useRef<SVGCircleElement>(null);
  const point2Ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // GSAP context to ensure proper cleanup on component unmount
    const ctx = gsap.context(() => {
      // 1. ANCHOR & BEZIER CURVE MORPHING ANIMATION
      // Initial control point state
      const curveData = {
        x1: 250,
        y1: 150,
        x2: 750,
        y2: 450,
      };

      // Animate control points in a natural, organic loop
      gsap.to(curveData, {
        x1: 400,
        y1: 420,
        x2: 600,
        y2: 180,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        onUpdate: () => {
          // Update the cubic Bezier path: M (Start) -> C (Control 1, Control 2, End)
          // Start point: (100, 300), End point: (900, 300)
          if (pathRef.current) {
            pathRef.current.setAttribute(
              "d",
              `M 100 300 C ${curveData.x1} ${curveData.y1}, ${curveData.x2} ${curveData.y2}, 900 300`
            );
          }

          // Update vector handle lines (from anchor points to control points)
          if (handle1Ref.current) {
            handle1Ref.current.setAttribute("x2", curveData.x1.toString());
            handle1Ref.current.setAttribute("y2", curveData.y1.toString());
          }
          if (handle2Ref.current) {
            handle2Ref.current.setAttribute("x2", curveData.x2.toString());
            handle2Ref.current.setAttribute("y2", curveData.y2.toString());
          }

          // Update control point anchor circles
          if (point1Ref.current) {
            point1Ref.current.setAttribute("cx", curveData.x1.toString());
            point1Ref.current.setAttribute("cy", curveData.y1.toString());
          }
          if (point2Ref.current) {
            point2Ref.current.setAttribute("cx", curveData.x2.toString());
            point2Ref.current.setAttribute("cy", curveData.y2.toString());
          }
        },
      });

      // 2. RADIAL BLUEPRINT DIALS ROTATION
      gsap.to(".radial-dial-slow", {
        rotation: 360,
        transformOrigin: "center center",
        duration: 60,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".radial-dial-fast", {
        rotation: -360,
        transformOrigin: "center center",
        duration: 25,
        repeat: -1,
        ease: "none",
      });

      // 3. PULSING CIRCLES & RINGS
      gsap.to(".pulse-ring", {
        scale: 1.25,
        opacity: 0.1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "center center",
      });

      // 4. SIGNAL DATA STREAM FLOWS (dashed animation)
      gsap.to(".data-stream-1", {
        strokeDashoffset: -80,
        duration: 6,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".data-stream-2", {
        strokeDashoffset: 80,
        duration: 8,
        repeat: -1,
        ease: "none",
      });

      // 5. PARALLAX MOUSE INFLUENCE
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;

        // Calculate normalized offset from center (-0.5 to 0.5)
        const xOffset = clientX / width - 0.5;
        const yOffset = clientY / height - 0.5;

        // Animate background glow blobs with deep subtle depth
        gsap.to(".parallax-layer-glow", {
          x: xOffset * 18,
          y: yOffset * 18,
          duration: 2.0,
          ease: "power2.out",
        });

        // Animate watermark text in hero
        gsap.to(".parallax-layer-watermark", {
          x: xOffset * -25,
          y: yOffset * -25,
          duration: 2.2,
          ease: "power2.out",
        });

        // Animate layers with staggered depth
        gsap.to(".parallax-layer-back", {
          x: xOffset * 22,
          y: yOffset * 22,
          duration: 1.6,
          ease: "power2.out",
        });

        gsap.to(".parallax-layer-mid", {
          x: xOffset * 45,
          y: yOffset * 45,
          duration: 1.3,
          ease: "power2.out",
        });

        gsap.to(".parallax-layer-front", {
          x: xOffset * 70,
          y: yOffset * 70,
          duration: 1.0,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert(); // clean up all GSAP animations
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 bg-brand-bg"
    >
      {/* Subtle radial gradients behind for background depth */}
      <div className="parallax-layer-glow absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none opacity-50" />
      <div className="parallax-layer-glow absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-brand-primary/2 blur-[150px] pointer-events-none opacity-40" />

      {/* SVG Canvas for sophisticated vector schematics */}
      <svg
        className="w-full h-full min-w-[1200px] min-h-[800px] absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* PARALLAX BACK LAYER: Grid & Alignment marks */}
        <g className="parallax-layer-back opacity-35">
          {/* Faint dot matrix background */}
          <pattern
            id="blueprint-dots"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill="var(--color-brand-primary)" opacity="0.32" />
          </pattern>
          <rect width="1000" height="600" fill="url(#blueprint-dots)" />

          {/* Isometric grid crosshairs */}
          <path
            d="M 50 50 L 150 50 M 100 0 L 100 100"
            stroke="var(--color-brand-primary)"
            strokeWidth="0.5"
            opacity="0.25"
          />
          <path
            d="M 900 550 L 950 550 M 925 525 L 925 575"
            stroke="var(--color-brand-primary)"
            strokeWidth="0.5"
            opacity="0.25"
          />
        </g>

        {/* PARALLAX MID LAYER: Circular schematics, concentric dial rings */}
        <g className="parallax-layer-mid">
          {/* Left concentric schematic dial */}
          <g transform="translate(180, 200)" className="opacity-60">
            {/* Outermost tick-mark circle */}
            <circle
              cx="0"
              cy="0"
              r="120"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.75"
              strokeDasharray="4 8"
              className="radial-dial-slow"
              opacity="0.15"
            />
            {/* Intersecting crosshair indicators */}
            <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--color-brand-secondary)" strokeWidth="0.5" opacity="0.1" />
            <line x1="0" y1="-140" x2="0" y2="140" stroke="var(--color-brand-secondary)" strokeWidth="0.5" opacity="0.1" />

            <circle
              cx="0"
              cy="0"
              r="80"
              stroke="var(--color-brand-accent)"
              strokeWidth="0.75"
              strokeDasharray="60 30 10 30"
              className="radial-dial-fast"
              opacity="0.6"
            />
            <circle
              cx="0"
              cy="0"
              r="50"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.5"
              className="pulse-ring"
              opacity="0.18"
            />
            <circle cx="0" cy="0" r="4" fill="var(--color-brand-accent)" opacity="0.8" />
            
            {/* Dimension text */}
            <text x="10" y="-85" fill="var(--color-brand-secondary)" fontSize="8" fontFamily="monospace" letterSpacing="1" opacity="0.45">
              R_80.20
            </text>
            <text x="10" y="-125" fill="var(--color-brand-secondary)" fontSize="7" fontFamily="monospace" letterSpacing="2" opacity="0.3">
              SYS_MATRIX_A
            </text>
          </g>

          {/* Right concentric schematic dial */}
          <g transform="translate(820, 420)" className="opacity-30">
            <circle
              cx="0"
              cy="0"
              r="100"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.5"
              strokeDasharray="12 4 4 4"
              className="radial-dial-fast"
              opacity="0.15"
            />
            <circle
              cx="0"
              cy="0"
              r="60"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.75"
              className="radial-dial-slow"
              opacity="0.12"
            />
            <line x1="-110" y1="-110" x2="110" y2="110" stroke="var(--color-brand-secondary)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.1" />
            <text x="-90" y="8" fill="var(--color-brand-secondary)" fontSize="7" fontFamily="monospace" letterSpacing="1" opacity="0.3">
              PHASE_SYS_02
            </text>
          </g>

          {/* Horizontal signal path layout (representing clean logic flow) */}
          <g className="opacity-20">
            {/* Background static routing paths */}
            <path
              d="M 50 120 L 950 120"
              stroke="var(--color-brand-secondary)"
              strokeWidth="1"
              opacity="0.1"
            />
            <path
              d="M 100 480 L 900 480"
              stroke="var(--color-brand-secondary)"
              strokeWidth="1"
              opacity="0.1"
            />

            {/* Glowing path signals */}
            <path
              d="M 50 120 L 950 120"
              stroke="url(#gradient-accent-flow)"
              strokeWidth="1.5"
              strokeDasharray="30 150"
              className="data-stream-1"
            />
            <path
              d="M 100 480 L 900 480"
              stroke="var(--color-brand-primary)"
              strokeWidth="1.2"
              strokeDasharray="20 180"
              className="data-stream-2"
            />
          </g>
        </g>

        {/* PARALLAX FRONT LAYER: Core Bezier Editor Graphic (Vector design system metaphor) */}
        <g className="parallax-layer-front">
          <g className="opacity-45">
            {/* The main bezier curve */}
            <path
              ref={pathRef}
              d="M 100 300 C 250 150, 750 450, 900 300"
              stroke="url(#gradient-accent-curve)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Anchor Points */}
            <circle cx="100" cy="300" r="5" fill="var(--color-brand-bg)" stroke="var(--color-brand-accent)" strokeWidth="1.5" />
            <circle cx="900" cy="300" r="5" fill="var(--color-brand-bg)" stroke="var(--color-brand-accent)" strokeWidth="1.5" />

             {/* Dynamic Interactive Handles (Animate in response to GSAP updating state) */}
            <line
              ref={handle1Ref}
              x1="100"
              y1="300"
              x2="250"
              y2="150"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.75"
              strokeDasharray="3 3"
              opacity="0.25"
            />
            <line
              ref={handle2Ref}
              x1="900"
              y1="300"
              x2="750"
              y2="450"
              stroke="var(--color-brand-primary)"
              strokeWidth="0.75"
              strokeDasharray="3 3"
              opacity="0.25"
            />

            {/* Dynamic control point drag handles */}
            <circle
              ref={point1Ref}
              cx="250"
              cy="150"
              r="4"
              fill="var(--color-brand-accent)"
              stroke="var(--color-brand-secondary)"
              strokeWidth="1"
              opacity="0.6"
            />
            <circle
              ref={point2Ref}
              cx="750"
              cy="450"
              r="4"
              fill="var(--color-brand-accent)"
              stroke="var(--color-brand-secondary)"
              strokeWidth="1"
              opacity="0.6"
            />

            {/* Coordinate labels near control points */}
            <text x="120" y="295" fill="var(--color-brand-secondary)" fontSize="8" fontFamily="monospace" opacity="0.3">
              P_00(100, 300)
            </text>
            <text x="830" y="295" fill="var(--color-brand-secondary)" fontSize="8" fontFamily="monospace" opacity="0.3">
              P_03(900, 300)
            </text>
          </g>
        </g>

        {/* Gradients definitions */}
        <defs>
          <linearGradient id="gradient-accent-curve" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand-bg)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--color-brand-accent)" />
            <stop offset="100%" stopColor="var(--color-brand-bg)" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="gradient-accent-flow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0)" />
            <stop offset="50%" stopColor="var(--color-brand-accent)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Screen coordinate labels or floating specs on margins */}
      <div className="absolute top-12 left-12 font-mono text-[8px] text-brand-primary/20 uppercase tracking-[0.2em] hidden lg:block">
        GRID_COORDS // [0.00, 0.00, 1.00]
      </div>
      <div className="absolute top-12 right-12 font-mono text-[8px] text-brand-primary/20 uppercase tracking-[0.2em] hidden lg:block">
        AUTO_RENDER_ENGINE // CALIBRATED
      </div>
    </div>
  );
}
