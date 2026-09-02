import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Compass, Sparkles, Cpu, Layers, Sliders, Eye } from "lucide-react";
import portraitFace from "../assets/images/zaeb.jpeg";
import helmetFace from "../assets/images/zainab.png";

export default function CyberneticHead() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Layer refs for 3D exploded view separation
  const hudLayerRef = useRef<HTMLDivElement>(null);
  const photoLayerRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<HTMLDivElement>(null);
  
  const [maskPos, setMaskPos] = useState({ x: 50, y: 50 });
  const maskTargetRef = useRef({ x: 50, y: 50 });
  const maskCurrentRef = useRef({ x: 50, y: 50 });
  const [isExploded, setIsExploded] = useState(false);
  const [scanSpeed, setScanSpeed] = useState(2.5);
  const [laserActive, setLaserActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth lerp loop for spotlight reticle tracking
  useEffect(() => {
    let frameId: number;
    const updateMask = () => {
      maskCurrentRef.current.x += (maskTargetRef.current.x - maskCurrentRef.current.x) * 0.35;
      maskCurrentRef.current.y += (maskTargetRef.current.y - maskCurrentRef.current.y) * 0.35;
      setMaskPos({
        x: Math.round(maskCurrentRef.current.x * 100) / 100,
        y: Math.round(maskCurrentRef.current.y * 100) / 100,
      });
      frameId = requestAnimationFrame(updateMask);
    };
    frameId = requestAnimationFrame(updateMask);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Mouse move handler for photo layer spotlight mask
  const handlePhotoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!photoLayerRef.current) return;
    const rect = photoLayerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsHovered(true);
    maskTargetRef.current = { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Gentle idle timeline
  const idleTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!containerRef.current || !cardRef.current) return;

    // 1. Organic idle swaying using GSAP
    const idleTl = gsap.timeline({ repeat: -1 });
    idleTlRef.current = idleTl;

    idleTl.to(cardRef.current, {
      y: "-=8",
      rotationY: "+=2.5",
      rotationZ: "+=0.8",
      duration: 3.5,
      ease: "sine.inOut",
    }).to(cardRef.current, {
      y: "+=8",
      rotationY: "-=2.5",
      rotationZ: "-=0.8",
      duration: 3.5,
      ease: "sine.inOut",
    });

    // Slow orbital rotation of background visual elements
    gsap.to(".hud-orbit-ring", {
      rotation: 360,
      transformOrigin: "center center",
      duration: 25,
      repeat: -1,
      ease: "none",
    });

    // 2. High-performance 3D Mouse Parallax & Tilt
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !cardRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = (x - xc) / xc;
      const dy = (y - yc) / yc;

      idleTl.pause();

      gsap.to(cardRef.current, {
        rotationX: -dy * 16,
        rotationY: dx * 16,
        x: dx * 10,
        y: dy * 10,
        transformPerspective: 1000,
        transformOrigin: "center center",
        scale: 1.025,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
        force3D: true,
      });

      gsap.to(".holo-shine-overlay", {
        background: `radial-gradient(circle at ${(dx + 1) * 50}% ${(dy + 1) * 50}%, rgba(201, 121, 63, 0.28) 0%, rgba(58, 13, 26, 0.15) 50%, transparent 80%)`,
        duration: 0.3,
      });
    };

    const onMouseLeave = () => {
      if (!cardRef.current) return;

      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.62,
        ease: "power3.out",
        overwrite: "auto",
        force3D: true,
        onComplete: () => {
          if (!containerRef.current?.matches(":hover")) idleTl.resume();
        },
      });

      gsap.to(".holo-shine-overlay", {
        background: "radial-gradient(circle at 50% 50%, rgba(201, 121, 63, 0.08) 0%, transparent 75%)",
        duration: 0.8,
      });
    };

    containerRef.current.addEventListener("mousemove", onMouseMove);
    containerRef.current.addEventListener("mouseleave", onMouseLeave);

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", onMouseMove);
        containerRef.current.removeEventListener("mouseleave", onMouseLeave);
      }
      idleTl.kill();
    };
  }, []);

  // 3. Exploded blueprint separation animation
  useEffect(() => {
    if (!hudLayerRef.current || !photoLayerRef.current || !baseLayerRef.current) return;

    if (isExploded) {
      gsap.to(hudLayerRef.current, {
        z: 70,
        x: -12,
        y: -12,
        borderColor: "var(--color-brand-accent)",
        duration: 0.75,
        ease: "back.out(1.5)",
      });

      gsap.to(photoLayerRef.current, {
        z: 20,
        x: 0,
        y: 0,
        scale: 0.95,
        opacity: 0.85,
        duration: 0.75,
        ease: "back.out(1.5)",
      });

      gsap.to(baseLayerRef.current, {
        z: -50,
        x: 12,
        y: 12,
        backgroundColor: "var(--color-brand-surface)",
        duration: 0.75,
        ease: "back.out(1.5)",
      });
    } else {
      gsap.to(hudLayerRef.current, {
        z: 20,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        borderColor: "var(--color-brand-border)",
        duration: 0.75,
        ease: "power3.out",
      });
      gsap.to(photoLayerRef.current, {
        z: 10,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.75,
        ease: "power3.out",
      });
      gsap.to(baseLayerRef.current, {
        z: 0,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.75,
        ease: "power3.out",
      });
    }
  }, [isExploded]);

  // 4. Continuously animate laser scanner beam
  useEffect(() => {
    if (!laserActive) {
      gsap.killTweensOf(".hud-scanner-beam");
      return;
    }

    gsap.fromTo(".hud-scanner-beam", 
      { top: "0%" },
      {
        top: "100%",
        duration: scanSpeed,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      }
    );
  }, [scanSpeed, laserActive]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className="relative w-full max-w-md sm:max-w-lg h-[440px] xs:h-[480px] sm:h-[510px] flex flex-col items-center justify-center select-none group/portrait transition-all duration-300"
      style={{ perspective: "1500px" }}
    >
      {/* BACKGROUND VECTOR HUD ORBITING RINGS */}
      <svg className="absolute w-[360px] xs:w-[420px] sm:w-[480px] md:w-[520px] h-[360px] xs:h-[420px] sm:h-[480px] md:h-[520px] pointer-events-none opacity-20" viewBox="0 0 200 200">
        <g className="hud-orbit-ring">
          <circle cx="100" cy="100" r="85" stroke="rgba(240, 146, 71, 0.3)" strokeWidth="0.5" strokeDasharray="3 12" fill="none" />
          <circle cx="100" cy="15" r="3" fill="var(--color-brand-accent)" />
          <circle cx="100" cy="185" r="3" fill="var(--color-brand-accent)" />
        </g>
        <circle cx="100" cy="100" r="65" stroke="rgba(240, 146, 71, 0.4)" strokeWidth="0.75" strokeDasharray="50 15" fill="none" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(240, 146, 71, 0.25)" strokeWidth="0.5" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(240, 146, 71, 0.25)" strokeWidth="0.5" />
      </svg>

      {/* 3D ROTATABLE ASSEMBLY CONTAINER */}
      <div
        ref={cardRef}
        onClick={() => setIsExploded(!isExploded)}
        className="cursor-pointer relative w-[280px] xs:w-[320px] sm:w-[360px] md:w-[380px] h-[380px] xs:h-[430px] sm:h-[470px] md:h-[490px] rounded-[2.25rem] select-none shadow-2xl"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* --- LAYER 1: BASE BLUEPRINT BACKGROUND --- */}
        <div
          ref={baseLayerRef}
          className="absolute inset-0 bg-brand-surface border border-brand-border rounded-[2.25rem] p-4 flex flex-col justify-between overflow-hidden"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(0px)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(240,146,71,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(240,146,71,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-1 text-center opacity-30 z-0">
            <span className="font-mono text-[8px] text-brand-primary block tracking-[0.3em]">
              PORTRAIT_REVEAL_ENGINE
            </span>
            <span className="font-mono text-[7px] text-brand-accent uppercase block">
              STATE_CROSSFADE_ACTIVE
            </span>
          </div>

          <div className="font-mono text-[7px] text-brand-tertiary uppercase tracking-widest text-left mt-auto">
            [SYS_BASE // DEPTH -30px]
          </div>
        </div>

        {/* --- LAYER 2: REVEAL-ON-HOVER DUAL PORTRAIT (SPOTLIGHT MASK REVEAL) --- */}
        <div
          ref={photoLayerRef}
          onMouseMove={handlePhotoMouseMove}
          className="absolute inset-2 bg-brand-bg rounded-[1.75rem] border border-brand-border/60 overflow-hidden cursor-crosshair group/mask z-10 shadow-inner"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(10px)",
            backfaceVisibility: "hidden",
          }}
        >
          {/* STATE A: BASE ORIGINAL PORTRAIT PHOTO (FACE SHOWING) */}
          <img
            src={portraitFace}
            alt="Zainab Portrait Face"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center filter contrast-105 brightness-105"
          />

          {/* STATE B: HELMET & BIKER JACKET (REVEALED GRADUALLY VIA CURSOR SPOTLIGHT MASK) */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-[mask-image,-webkit-mask-image] duration-75 ease-out z-10"
            style={{
              WebkitMaskImage: isHovered
                ? `radial-gradient(circle 112px at ${maskPos.x}% ${maskPos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 58%, rgba(0,0,0,0) 100%)`
                : `radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)`,
              maskImage: isHovered
                ? `radial-gradient(circle 112px at ${maskPos.x}% ${maskPos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 58%, rgba(0,0,0,0) 100%)`
                : `radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)`,
            }}
          >
            <img
              src={helmetFace}
              alt="Zainab Helmet Biker Portrait"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter contrast-110 brightness-105"
            />
            {/* Tech Deep Wine Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-accent/20 via-transparent to-brand-accent/10 mix-blend-overlay" />
          </div>

          {/* Bottom subtle vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-brand-bg/90 via-transparent to-transparent pointer-events-none opacity-70" />
        </div>

        {/* --- LAYER 3: HUD GLASS OVERLAY --- */}
        <div
          ref={hudLayerRef}
          className="absolute inset-0 bg-transparent border border-brand-border/80 rounded-[2.25rem] p-4 sm:p-5 flex flex-col justify-between overflow-hidden pointer-events-none z-20"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(20px)",
          }}
        >
          <div className="holo-shine-overlay absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300" />

          {/* Corner Reticle Accents */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-brand-accent/90" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-brand-accent/90" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-brand-accent/90" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-brand-accent/90" />

          {/* Laser Scanner Beam */}
          <div className="hud-scanner-beam absolute left-0 right-0 h-[2px] bg-brand-accent shadow-[0_0_12px_var(--color-brand-accent)] pointer-events-none z-10 opacity-80" />

          {/* Top HUD Header */}
          <div className="flex justify-between items-start z-10 pt-1 px-1">
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] text-brand-secondary tracking-[0.2em] font-bold block drop-shadow-sm">
                ZAINAB // PORTRAIT_01
              </span>
              <span className="font-mono text-[8px] text-brand-accent uppercase tracking-widest block font-semibold">
                SYSTEM ARCHITECT
              </span>
            </div>
            <Compass className="w-4 h-4 text-brand-accent animate-spin-slow drop-shadow-sm" />
          </div>

          {/* Bottom HUD Footer Info */}
          <div className="space-y-2 z-10 px-1 pb-1">
            <div className="flex justify-between items-center border-t border-brand-border/60 pt-2.5">
              <div className="space-y-0.5 text-left">
                <span className="font-mono text-[7px] text-brand-tertiary block tracking-wider uppercase">IDENTITY</span>
                <span className="font-display font-bold text-sm tracking-tight text-brand-secondary uppercase">
                  ZAINAB 
                </span>
              </div>
              <div className="bg-brand-surface/90 border border-brand-accent/50 px-3 py-1 rounded-full backdrop-blur-md">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {isHovered ? (
                    <span className="text-brand-accent flex items-center gap-1.5">
                      <Eye className="w-3 h-3 animate-pulse" />
                      HELMET REVEALED
                    </span>
                  ) : (
                    <span className="text-brand-tertiary flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-brand-accent" />
                      HOVER TO REVEAL
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SIDE DIALS PANEL */}
      <div className="absolute top-4 -right-10 sm:-right-12 bg-brand-surface/90 border border-brand-border p-1.5 rounded-xl flex flex-col gap-2 shadow-md z-30 hidden sm:flex">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExploded(!isExploded);
          }}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isExploded 
              ? "bg-brand-accent/20 border-brand-accent text-brand-secondary" 
              : "border-brand-border text-brand-tertiary hover:text-brand-secondary hover:bg-brand-surface-light"
          }`}
          title="Toggle 3D Exploded View"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setLaserActive(!laserActive);
          }}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            laserActive 
              ? "bg-brand-accent/20 border-brand-accent text-brand-secondary" 
              : "border-brand-border text-brand-tertiary hover:text-brand-secondary hover:bg-brand-surface-light"
          }`}
          title="Toggle Laser Beam"
        >
          <Cpu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
