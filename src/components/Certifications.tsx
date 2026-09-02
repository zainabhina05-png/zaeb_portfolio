import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import {
  Award,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Hand,
  Grid,
  Layers,
  RotateCcw,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { CERTIFICATION_PLACEHOLDERS } from "../data/certifications";

export default function Certifications() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const certificates = CERTIFICATION_PLACEHOLDERS;
  const currentCert = certificates[activeCardIndex];

  const handleNext = () => {
    setSwipeDirection("right");
    setActiveCardIndex((prev) => (prev + 1) % certificates.length);
  };

  const handlePrev = () => {
    setSwipeDirection("left");
    setActiveCardIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  const handleDragEnd = (_: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <section
      id="certifications"
      className="relative py-24 px-4 md:px-10 bg-brand-bg border-t-2 border-double border-brand-border/40 overflow-hidden select-none"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-[240px] h-[240px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[240px] h-[240px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Section Header with View Toggle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="font-mono text-xs tracking-wider text-brand-accent uppercase font-semibold">
                Certifications & Badges
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-brand-secondary tracking-tight">
              Credentials & Specialized Certifications
            </h2>
          </div>

          {/* Controls & Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex bg-brand-surface border border-brand-border rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setViewMode("swipe")}
                className={`px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 rounded-lg ${
                  viewMode === "swipe"
                    ? "bg-brand-accent text-white shadow-xs"
                    : "text-brand-tertiary hover:text-brand-secondary"
                }`}
                title="Interactive 3D Card Swipe Deck"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Swipe Deck</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-brand-accent text-white shadow-xs"
                    : "text-brand-tertiary hover:text-brand-secondary"
                }`}
                title="Full Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-brand-surface/60 border border-brand-border px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-brand-accent" />
              <span className="font-mono text-xs text-brand-secondary font-semibold">
                VERIFIED SECURE
              </span>
            </div>
          </div>
        </div>

        {/* SWIPE DECK INTERACTIVE SYSTEM */}
        {viewMode === "swipe" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            
            {/* Left Column: Context & Controls Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <p className="text-xs md:text-sm text-brand-primary font-mono uppercase tracking-wide leading-relaxed">
                  SWIPE OR DRAG CARDS LEFT/RIGHT TO EXPLORE CERTIFIED COMPETENCIES IN COMPUTER SCIENCE, DATABASE ARCHITECTURES, WEBGL GRAPHICS, AND FULL-STACK SYSTEMS.
                </p>
                <div className="h-[2px] w-16 bg-brand-accent/60" />
              </div>

              {/* Progress & Quick Jump Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-brand-primary font-bold uppercase tracking-widest">
                  <span>CREDENTIAL DECK PROGRESS</span>
                  <span className="text-brand-accent">
                    0{activeCardIndex + 1} / 0{certificates.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-brand-surface rounded-full overflow-hidden border border-brand-border/40">
                  <motion.div
                    className="h-full bg-brand-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((activeCardIndex + 1) / certificates.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {certificates.map((cert, idx) => (
                  <button
                    key={cert.id}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer font-bold ${
                      idx === activeCardIndex
                        ? "bg-brand-accent text-white border-brand-accent shadow-sm scale-105"
                        : "bg-brand-surface/60 text-brand-primary border-brand-border hover:border-brand-accent/50"
                    }`}
                  >
                    0{idx + 1}. {cert.issuer.split(" ")[0]}
                  </button>
                ))}
              </div>

              {/* Touch / Swipe Gesture Hint & Direct Controls */}
              <div className="flex items-center justify-between bg-brand-surface/50 border border-brand-border/60 p-4 rounded-2xl">
                <div className="flex items-center gap-3 text-brand-primary">
                  <div className="w-9 h-9 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent animate-pulse">
                    <Hand className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-brand-secondary block">
                      SWIPE GESTURE ENABLED
                    </span>
                    <span className="font-mono text-[9px] text-brand-tertiary uppercase tracking-wider">
                      Drag left / right on card
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent text-brand-secondary hover:text-brand-accent transition-all cursor-pointer shadow-sm active:scale-95"
                    aria-label="Previous Certificate"
                    title="Previous Certificate"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent text-brand-secondary hover:text-brand-accent transition-all cursor-pointer shadow-sm active:scale-95"
                    aria-label="Next Certificate"
                    title="Next Certificate"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Swipeable Stack Deck */}
            <div className="lg:col-span-7 relative h-[420px] md:h-[460px] flex items-center justify-center">
              
              {/* Card Deck Render with Depth Stack */}
              <div className="relative w-full max-w-lg h-full flex items-center justify-center">
                {certificates.map((cert, idx) => {
                  const isCurrent = idx === activeCardIndex;
                  const offset = (idx - activeCardIndex + certificates.length) % certificates.length;

                  // Render top 3 stacked cards for performance & clean depth effect
                  if (offset > 2) return null;

                  return (
                    <motion.div
                      key={cert.id}
                      drag={isCurrent ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.6}
                      onDragEnd={handleDragEnd}
                      initial={{ scale: 0.9, y: 30, opacity: 0 }}
                      animate={{
                        scale: 1 - offset * 0.05,
                        y: offset * 18,
                        zIndex: 30 - offset,
                        opacity: 1 - offset * 0.25,
                        rotate: isCurrent ? 0 : offset === 1 ? 3 : -3,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className={`absolute inset-0 p-6 md:p-8 rounded-3xl border-2 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing backdrop-blur-md ${
                        isCurrent
                          ? "border-brand-accent bg-brand-surface text-brand-secondary shadow-brand-accent/20"
                          : "border-brand-border/60 bg-brand-surface/80 text-brand-primary pointer-events-none"
                      }`}
                    >
                      {/* Top Security Header */}
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent font-bold">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-brand-accent block">
                              OFFICIAL SEAL
                            </span>
                            <span className="font-mono text-[8px] text-brand-tertiary uppercase tracking-wider">
                              {cert.securityCode || "VERIFIED-SEAL"}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-[9px] tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg uppercase font-bold">
                          {cert.issuer}
                        </span>
                      </div>

                      {/* Main Credential Info */}
                      <div className="space-y-3 my-auto py-2">
                        <div className="flex items-center gap-2 font-mono text-[9px] text-brand-tertiary font-bold uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                          <span>{cert.date}</span>
                        </div>

                        <h3 className="font-gothic-sharp font-black text-2xl md:text-3xl text-brand-secondary uppercase leading-snug tracking-wide">
                          {cert.title}
                        </h3>

                        <p className="text-xs text-brand-primary font-mono uppercase tracking-wide leading-relaxed line-clamp-3">
                          {cert.description}
                        </p>
                      </div>

                      {/* Footer & Credential Verify Button */}
                      <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-auto">
                        <div className="font-mono text-[9px] text-brand-tertiary uppercase tracking-wider">
                          ID: <span className="text-brand-secondary font-bold">{cert.credentialId}</span>
                        </div>

                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent text-white hover:bg-brand-accent/90 font-mono text-[10px] uppercase tracking-widest font-black transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                          id={`verify-badge-link-${cert.id}`}
                        >
                          <span>Verify Seal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>

          </div>
        ) : (
          /* FULL GRID VIEW OPTION */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group relative border-2 border-brand-border hover:border-brand-accent bg-brand-surface p-6 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-300 shadow-sm hover:shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] tracking-widest text-brand-accent bg-brand-accent/10 border border-brand-accent/20 px-2.5 py-1 rounded-lg uppercase font-bold">
                      {cert.issuer}
                    </span>
                    <span className="font-mono text-[9px] text-brand-tertiary flex items-center gap-1 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-brand-accent" /> {cert.date}
                    </span>
                  </div>

                  <h3 className="font-gothic-sharp font-black text-xl text-brand-secondary uppercase tracking-wide pt-1">
                    {cert.title}
                  </h3>

                  <p className="text-xs text-brand-primary font-mono uppercase tracking-wide leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-brand-border/40 pt-4 mt-2">
                  <span className="font-mono text-[8px] text-brand-tertiary uppercase tracking-widest">
                    ID: <span className="text-brand-secondary font-bold">{cert.credentialId}</span>
                  </span>

                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-accent bg-brand-accent/10 hover:bg-brand-accent hover:text-white text-brand-accent font-mono text-[9px] uppercase tracking-widest font-black transition-all shadow-xs"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}




