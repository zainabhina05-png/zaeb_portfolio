import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  GraduationCap,
  Award,
  Calendar,
  Landmark,
  ShieldCheck,
  Terminal,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Hand,
  Grid,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { EDUCATION_PLACEHOLDERS } from "../data/education";
import { CERTIFICATION_PLACEHOLDERS } from "../data/certifications";
import MetallicRedZBackground from "./three/MetallicRedZBackground";

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");

  const certificates = CERTIFICATION_PLACEHOLDERS;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // Reassembly transition: Starts exploded (1.0) and reassembles back into intact Z (0.0)
  const zReassembly = useTransform(smoothProgress, [0.05, 0.45], [0.9, 0.0]);
  const [zProgress, setZProgress] = useState(0.9);

  useEffect(() => {
    return zReassembly.on("change", (latest) => {
      setZProgress(latest);
    });
  }, [zReassembly]);

  const handleNext = () => {
    setActiveCardIndex((prev) => (prev + 1) % certificates.length);
  };

  const handlePrev = () => {
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
      id="education"
      ref={sectionRef}
      className="relative py-28 px-6 md:px-16 bg-[#0a0a0d] text-[#f2ece2] border-t border-[#2e2b2a] overflow-hidden select-none"
      aria-label="Academic Training & Certifications"
    >
      {/* 3D Metallic Red Z Reassembly Background (shards reassemble on scroll entry) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <MetallicRedZBackground scrollProgress={zProgress} opacity={0.28} />
        <div className="absolute inset-0 bg-[#0a0a0d]/75 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2e2b2a] pb-6 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f2ece2] font-['Space_Grotesk']">
              EDUCATION &amp; CERTIFICATIONS
            </h2>
          </div>
          <span className="font-mono text-xs text-[#a89f91] flex items-center gap-2 bg-[#140e15] border border-[#2e2b2a] px-3 py-1.5 rounded-lg">
            <GraduationCap size={14} className="text-[#e0455f]" />
            <span>Z-SHARDS REASSEMBLED // INTACT</span>
          </span>
        </div>

        {/* ── 1. University Degree Card ── */}
        <div className="space-y-6">
          <h3 className="font-['Space_Grotesk'] text-sm text-[#8c2438] uppercase tracking-wider font-bold flex items-center gap-2">
            <Landmark size={14} />
            DEGREE PROGRAM
          </h3>

          <div className="grid grid-cols-1 gap-6">
            {EDUCATION_PLACEHOLDERS.map((edu) => (
              <div
                key={edu.id}
                className="bg-[#1a1d2e]/90 border-2 border-[#8c2438] hover:border-[#7B1C3A] p-6 md:p-8 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2d3142] pb-4 mb-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#ffffff] font-['Space_Grotesk'] group-hover:text-[#c46080] transition-colors">
                      {edu.degreePlaceholder}
                    </h3>
                    <p className="font-['Space_Grotesk'] text-xs text-[#a89f91] flex items-center gap-1.5 mt-1">
                      <Landmark size={12} className="text-[#8c2438]" />
                      <span>{edu.institutionPlaceholder}</span>
                    </p>
                  </div>

                  <span className="font-['Space_Grotesk'] text-xs font-semibold text-[#f2ece2] bg-[#0a0a0d] border border-[#8c2438] px-3 py-1.5 rounded self-start lg:self-center">
                    <Calendar size={12} className="inline mr-1.5 text-[#8c2438]" />
                    {edu.periodPlaceholder}
                  </span>
                </div>

                <p className="text-xs md:text-sm text-[#cfc7ba] font-['Space_Grotesk'] font-light leading-relaxed max-w-4xl">
                  {edu.descriptionPlaceholder}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Certifications & Badges (Interactive 3D Card Swipe Deck) ── */}
        <div className="space-y-6 pt-4 border-t border-[#2d3142]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-['Space_Grotesk'] text-sm text-[#8c2438] uppercase tracking-wider font-bold flex items-center gap-2">
              <Award size={14} />
              VERIFIED CREDENTIALS — INTERACTIVE 3D SWIPE DECK
            </h3>

            {/* View Mode Toggle Switch */}
            <div className="flex items-center gap-2 bg-[#1a1d2e] border border-[#2d3142] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("swipe")}
                className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs transition-all cursor-pointer flex items-center gap-1.5 rounded-lg ${
                  viewMode === "swipe"
                    ? "bg-[#8c2438] text-white shadow-sm"
                    : "text-[#a89f91] hover:text-[#f2ece2]"
                }`}
              >
                <Layers size={13} />
                <span>Swipe Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 font-['Space_Grotesk'] text-xs transition-all cursor-pointer flex items-center gap-1.5 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-[#8c2438] text-white shadow-sm"
                    : "text-[#a89f91] hover:text-[#f2ece2]"
                }`}
              >
                <Grid size={13} />
                <span>Grid View</span>
              </button>
            </div>
          </div>

          {viewMode === "swipe" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
              
              {/* Left Controls & Index Progress */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs md:text-sm text-[#cfc7ba] font-['Space_Grotesk'] font-light leading-relaxed">
                    Swipe or drag cards left/right to explore certified competencies in full-stack architecture, computer science, and cloud systems.
                  </p>
                  <div className="h-[2px] w-14 bg-[#8c2438]" />
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-['Space_Grotesk'] text-[10px] text-[#dac6bd] font-bold uppercase tracking-widest">
                    <span>CREDENTIAL DECK PROGRESS</span>
                    <span className="text-[#8c2438]">
                      0{activeCardIndex + 1} / 0{certificates.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1a1d2e] rounded-full overflow-hidden border border-[#2d3142]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#8c2438] to-[#39AEA6]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${((activeCardIndex + 1) / certificates.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Quick select pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {certificates.map((cert, idx) => (
                    <button
                      key={cert.id}
                      type="button"
                      onClick={() => setActiveCardIndex(idx)}
                      className={`px-3 py-1.5 font-['Space_Grotesk'] text-[10px] uppercase tracking-wider rounded-lg border transition-all cursor-pointer font-semibold ${
                        idx === activeCardIndex
                          ? "bg-[#8c2438] text-white border-[#8c2438] shadow-md scale-105"
                          : "bg-[#1a1d2e] text-[#a89f91] border-[#2d3142] hover:border-[#8c2438]/50 hover:text-[#f2ece2]"
                      }`}
                    >
                      0{idx + 1}. {cert.issuer.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {/* Swipe Gesture Hint & Direct Nav */}
                <div className="flex items-center justify-between bg-[#1a1d2e]/90 border border-[#2d3142] p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#8c2438]/15 border border-[#8c2438]/40 flex items-center justify-center text-[#8c2438] animate-pulse">
                      <Hand size={18} />
                    </div>
                    <div>
                      <span className="font-['Space_Grotesk'] text-[11px] font-bold uppercase tracking-wider text-[#f2ece2] block">
                        SWIPE GESTURE ENABLED
                      </span>
                      <span className="font-['Space_Grotesk'] text-[10px] text-[#a89f91]">
                        Drag card left or right
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2.5 rounded-xl bg-[#0a0a0d] border border-[#2d3142] hover:border-[#8c2438] text-[#cfc7ba] hover:text-[#f2ece2] transition-colors cursor-pointer"
                      title="Previous Certificate"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2.5 rounded-xl bg-[#0a0a0d] border border-[#2d3142] hover:border-[#8c2438] text-[#cfc7ba] hover:text-[#f2ece2] transition-colors cursor-pointer"
                      title="Next Certificate"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Swipeable Stack Deck */}
              <div className="lg:col-span-7 relative h-[420px] md:h-[460px] flex items-center justify-center">
                <div className="relative w-full max-w-lg h-full flex items-center justify-center">
                  {certificates.map((cert, idx) => {
                    const isCurrent = idx === activeCardIndex;
                    const offset = (idx - activeCardIndex + certificates.length) % certificates.length;

                    // Show top 3 stacked cards for depth
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
                          y: offset * 16,
                          zIndex: 30 - offset,
                          opacity: 1 - offset * 0.25,
                          rotate: isCurrent ? 0 : offset === 1 ? 3 : -3,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`absolute inset-0 p-6 md:p-8 rounded-3xl border-2 shadow-2xl flex flex-col justify-between cursor-grab active:cursor-grabbing backdrop-blur-md ${
                          isCurrent
                            ? "border-[#8c2438] bg-[#1a1d2e] text-[#f2ece2] shadow-[#8c2438]/20"
                            : "border-[#2d3142] bg-[#1a1d2e]/70 text-[#a89f91] pointer-events-none"
                        }`}
                      >
                        {/* Top Seal Header */}
                        <div className="flex items-center justify-between border-b border-[#2d3142] pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#8c2438]/15 border border-[#8c2438]/40 flex items-center justify-center text-[#8c2438]">
                              <ShieldCheck size={16} />
                            </div>
                            <div>
                              <span className="font-['Space_Grotesk'] text-[9px] font-extrabold uppercase tracking-widest text-[#8c2438] block">
                                OFFICIAL SEAL
                              </span>
                              <span className="font-['Space_Grotesk'] text-[8px] text-[#a89f91] uppercase">
                                {cert.securityCode || "VERIFIED-SEAL"}
                              </span>
                            </div>
                          </div>

                          <span className="font-['Space_Grotesk'] text-[10px] tracking-widest text-[#8c2438] bg-[#8c2438]/10 border border-[#8c2438]/40 px-2.5 py-1 rounded-lg uppercase font-bold">
                            {cert.issuer}
                          </span>
                        </div>

                        {/* Certificate Body */}
                        <div className="space-y-3 my-auto py-2">
                          <div className="flex items-center gap-2 font-['Space_Grotesk'] text-[10px] text-[#a89f91]">
                            <Calendar size={12} className="text-[#8c2438]" />
                            <span>{cert.date}</span>
                          </div>

                          <h3 className="font-['Space_Grotesk'] font-bold text-2xl md:text-3xl text-[#ffffff] leading-snug">
                            {cert.title}
                          </h3>

                          <p className="text-xs md:text-sm text-[#cfc7ba] font-['Space_Grotesk'] font-light leading-relaxed line-clamp-3">
                            {cert.description}
                          </p>
                        </div>

                        {/* Footer Link */}
                        <div className="flex items-center justify-between border-t border-[#2d3142] pt-4 mt-auto">
                          <div className="font-['Space_Grotesk'] text-[10px] text-[#a89f91]">
                            ID: <span className="text-[#f2ece2] font-bold">{cert.credentialId}</span>
                          </div>

                          <a
                            href={cert.verifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8c2438] hover:bg-[#7B1C3A] text-white font-['Space_Grotesk'] text-[10px] uppercase tracking-wider font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <span>Verify Seal</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Grid View Fallback */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-[#140e15]/85 border border-[#2e2b2a] hover:border-[#e0455f]/60 p-5 rounded-xl shadow-md flex flex-col justify-between gap-4 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#e0455f] font-semibold tracking-wider uppercase flex items-center gap-1">
                        <ShieldCheck size={12} />
                        <span>{cert.issuer}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#a89f91] bg-[#0a0a0d] px-2 py-0.5 rounded border border-[#2e2b2a]">
                        {cert.date}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#f2ece2] font-['Space_Grotesk'] leading-snug group-hover:text-[#f2a6b9] transition-colors">
                      {cert.title}
                    </h4>

                    <p className="text-xs text-[#cfc7ba] font-mono leading-relaxed line-clamp-3">
                      {cert.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2e2b2a] flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-[#4ade80]">
                      <CheckCircle2 size={12} />
                      <span>VERIFIED</span>
                    </span>
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#e0455f] hover:text-[#f2a6b9] font-bold flex items-center gap-1"
                    >
                      <span>INSPECT</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
