"use client";

import { useState, useRef, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import {
  FileDown,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

export default function Resume() {
  const [downloadState, setDownloadState] = useState<"idle" | "loading" | "success">("idle");
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.3, 1], [100, 0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.5]);
  
  const cardY = useTransform(scrollYProgress, [0, 0.4, 1], [150, 0, -80]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.3, 0.9, 1], [0, 1, 1, 0.3]);
  
  const contentY = useTransform(scrollYProgress, [0, 0.4, 1], [120, 0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35, 0.85, 1], [0, 1, 1, 0.4]);

  // 3D Interactive Mouse Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 220,
    damping: 22,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const triggerDownload = () => {
    setDownloadState("loading");
    setTimeout(() => {
      setDownloadState("success");
      // Trigger actual resume PDF download
      const link = document.createElement("a");
      link.href = "/Zainab_Naeem_Resume.pdf"; // Place your resume PDF in the public folder
      link.setAttribute("download", "Zainab_Naeem_Resume.pdf");
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadState("idle");
      }, 3500);
    }, 1200);
  };

  return (
    <section
      ref={sectionRef}
      id="resume"
      className="relative py-28 px-6 md:px-16 bg-[#e8e3db] text-[#2a2a2a] border-t border-[#d0cbc3] overflow-hidden"
      aria-label="Interactive Resume Dossier"
    >
      {/* Grain/Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px"
        }}
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#d4cfc7]/30 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header with scroll animation */}
        <motion.div 
          style={{ y: headerY, opacity: headerOpacity }}
          className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#c8c3bb] pb-6 gap-4"
        >
          <div className="space-y-3">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1a1a1a] font-['Space_Grotesk'] leading-[1.1]">
              PROFESSIONAL DOSSIER
            </h2>
          </div>
          <span className="font-mono text-xs text-[#6a6a6a] flex items-center gap-2 bg-[#f5f3f0] border border-[#d0cbc3] px-3 py-1.5 rounded-lg shadow-sm">
            <ShieldCheck size={14} className="text-[#8c2438]" />
            <span>2026 EDITION</span>
          </span>
        </motion.div>

        {/* Minimalist Paper Resume Card & Actions Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
          
          {/* Left Column: Blank Paper Resume Card with Tilt */}
          <motion.div
            style={{ y: cardY, opacity: cardOpacity }}
            className="lg:col-span-6 flex justify-center perspective-[2000px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={cardRef}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              initial={{ rotateZ: 0 }}
              whileHover={{ 
                rotateZ: 3,
                scale: 1.03,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="relative w-full max-w-[420px] aspect-[8.5/11] bg-gradient-to-br from-[#f5f1ea] via-[#ede8df] to-[#e6e1d8] rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.12),0_20px_60px_rgba(140,36,56,0.08)] transition-all duration-400 cursor-pointer group relative overflow-hidden border border-[#d4cfc7]"
            >
              {/* Subtle warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8c2438]/3 via-transparent to-[#39AEA6]/2 opacity-50" />
              
              {/* Fine paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_center,#8c2438_0.5px,transparent_0.5px)] bg-[length:6px_6px]" />
              
              {/* Subtle edge shadow for paper depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(140,36,56,0.08),inset_0_1px_3px_rgba(0,0,0,0.04)] rounded-sm pointer-events-none" />
              
              {/* Minimal paper fold corner with burgundy accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#8c2438]/12 to-transparent opacity-60" 
                   style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />

              {/* Minimalist content - barely visible text placeholder */}
              <div className="relative p-10 h-full flex flex-col space-y-6 opacity-[0.15] group-hover:opacity-[0.28] transition-opacity duration-500">
                {/* Header lines */}
                <div className="space-y-2">
                  <div className="w-32 h-3 bg-[#8c2438] rounded-sm opacity-50" />
                  <div className="w-48 h-2 bg-[#3a3a3a] rounded-sm opacity-35" />
                </div>

                {/* Content blocks */}
                <div className="space-y-4 pt-4 border-t border-[#8c2438]/15">
                  <div className="space-y-1.5">
                    <div className="w-24 h-2 bg-[#8c2438] rounded-sm opacity-40" />
                    <div className="w-full h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                    <div className="w-full h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                    <div className="w-3/4 h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="w-28 h-2 bg-[#39AEA6] rounded-sm opacity-40" />
                    <div className="w-full h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                    <div className="w-5/6 h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <div className="w-24 h-2 bg-[#8c2438] rounded-sm opacity-40" />
                    <div className="w-full h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                    <div className="w-4/5 h-1.5 bg-[#5a5a5a] rounded-sm opacity-30" />
                  </div>
                </div>
              </div>

              {/* Hover glow effect - warm burgundy glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 shadow-[0_0_50px_rgba(140,36,56,0.2),0_0_80px_rgba(140,36,56,0.1)]" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Download Call-to-action & Key Metrics */}
          <motion.div 
            style={{ y: contentY, opacity: contentOpacity }}
            className="lg:col-span-6 space-y-8 lg:pl-6"
          >
            <div className="space-y-4">
              <span className="font-['Space_Grotesk'] text-sm text-[#8c2438] uppercase tracking-wider font-bold block">
                PORTABLE DOSSIER
              </span>
              <h3 className="text-2xl md:text-4xl font-bold font-['Space_Grotesk'] text-[#1a1a1a] leading-tight">
                OFFLINE TECHNICAL SNAPSHOT
              </h3>
              <p className="text-sm text-[#4a4a4a] font-['Space_Grotesk'] font-light leading-relaxed max-w-lg">
                Download a verified record of full-stack systems engineering, 3D WebGL production architecture, open-source commits, and academic trajectory for direct evaluation.
              </p>
            </div>

            {/* Premium Download Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={triggerDownload}
                disabled={downloadState === "loading"}
                className="group relative w-full sm:w-auto min-w-[280px] h-14 font-mono text-xs uppercase tracking-widest font-bold overflow-hidden rounded-xl border border-[#c8c3bb] hover:border-[#8c2438] bg-[#f5f3f0] hover:bg-white transition-all duration-300 focus:outline-none cursor-pointer shadow-md hover:shadow-lg hover:shadow-[#8c2438]/20 active:scale-98"
                id="resume-download-trigger"
              >
                {/* Hover slide gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8c2438] via-[#c84663] to-[#39AEA6] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out opacity-90" />

                <div className="relative z-10 flex items-center justify-center gap-3 h-full px-8 text-[#2a2a2a] group-hover:text-white transition-colors">
                  {downloadState === "idle" && (
                    <>
                      <span>DOWNLOAD RESUME [PDF]</span>
                      <FileDown size={16} className="text-[#8c2438] group-hover:text-white transition-colors" />
                    </>
                  )}

                  {downloadState === "loading" && (
                    <>
                      <div className="w-4 h-4 border-2 border-[#8c2438] group-hover:border-white border-t-transparent rounded-full animate-spin" />
                      <span>GENERATING VERIFIED PDF...</span>
                    </>
                  )}

                  {downloadState === "success" && (
                    <>
                      <CheckCircle2 size={16} className="text-[#4ade80] group-hover:text-white animate-bounce" />
                      <span>DOSSIER DOWNLOADED!</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-['Space_Grotesk'] text-[#5a5a5a] pt-4 border-t border-[#d0cbc3]">
              <div>
                <span className="block text-[10px] text-[#8a8a8a] uppercase font-medium">LAST REVISED</span>
                <span className="text-[#2a2a2a] font-semibold">2026 EDITION</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#8a8a8a] uppercase font-medium">FORMAT</span>
                <span className="text-[#2a2a2a] font-semibold">A4 PDF DOCUMENT</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
