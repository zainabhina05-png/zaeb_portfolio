import { useState, useEffect, useRef, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Shield, Wind, Zap, Navigation, Anchor, Sparkles, ChevronUp, Globe } from "lucide-react";

interface LogPosePortalProps {
  onEnter: () => void;
}

const HELLO_LANGUAGES = [
  { text: "Hello", lang: "English", font: "font-display text-5xl md:text-7xl font-light tracking-tight text-white" },
  { text: "Bonjour", lang: "French", font: "font-display-cormorant text-5xl md:text-7xl italic font-normal text-white/95" },
  { text: "Hola", lang: "Spanish", font: "font-display text-5xl md:text-7xl font-light text-white" },
  { text: "Ciao", lang: "Italian", font: "font-display-cormorant text-5xl md:text-7xl font-normal text-white/95" },
  { text: "Olá", lang: "Portuguese", font: "font-display text-5xl md:text-7xl font-light text-white" },
  { text: "Hallo", lang: "German", font: "font-display text-5xl md:text-7xl font-light text-white" },
  { text: "こんにちは", lang: "Japanese", font: "text-4xl md:text-6xl font-sans font-light tracking-wider text-white" },
  { text: "नमस्ते", lang: "Hindi", font: "text-4xl md:text-6xl font-sans font-normal text-white" },
  { text: "مرحبا", lang: "Arabic", font: "text-4xl md:text-6xl font-sans font-normal text-white" },
  { text: "你好", lang: "Mandarin", font: "text-4xl md:text-6xl font-sans font-light tracking-widest text-white" },
  { text: "Zainab Hina", lang: "Portfolio Developer", font: "font-display text-4xl md:text-6xl font-bold tracking-tight text-[#e64c73]" },
];

export default function LogPosePortal({ onEnter }: LogPosePortalProps) {
  const [stage, setStage] = useState<"hello" | "logpose">("hello");
  const [helloIndex, setHelloIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // LogPose state
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [loadingText, setLoadingText] = useState("CALIBRATING BURGUNDY MAGNETIC CORE...");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [headingLocked, setHeadingLocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sound generator
  const playBeep = (freqs: number[], type: OscillatorType = "sine", duration: number = 0.1, volume: number = 0.02) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + duration);
      });
    } catch (e) {
      // Ignore audio block
    }
  };

  // Cycle Apple Hello Languages
  useEffect(() => {
    if (stage !== "hello") return;

    const timer = setInterval(() => {
      setHelloIndex((prev) => (prev + 1) % HELLO_LANGUAGES.length);
      playBeep([440 + Math.random() * 200], "sine", 0.04, 0.008);
    }, 1200);

    return () => clearInterval(timer);
  }, [stage]);

  // Loading Sequence for LogPose
  useEffect(() => {
    if (stage !== "logpose") return;

    const texts = [
      "CALIBRATING BURGUNDY MAGNETIC FIELD...",
      "STABILIZING WINE GLASS DOME ATMOSPHERE...",
      "CHARGING SENSORY PORTAL MATRIX...",
      "LOCKING COORD SYSTEM: LAUGHTALE VAULT...",
      "LOG POSE MATRIX READY FOR FLIGHT!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setLoadPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          playBeep([523.25, 659.25, 783.99, 1046.50], "triangle", 0.6, 0.03);
          return 100;
        }
        
        const nextPercent = prev + Math.floor(Math.random() * 9) + 3;
        const index = Math.min(Math.floor((nextPercent / 100) * texts.length), texts.length - 1);
        if (index !== currentStep && texts[index]) {
          currentStep = index;
          setLoadingText(texts[index]);
          playBeep([330], "sine", 0.05, 0.01);
        }
        
        return Math.min(100, nextPercent);
      });
    }, 110);

    return () => clearInterval(interval);
  }, [stage]);

  // Mouse tilt for LogPose
  const handleMouseMove = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    setMousePos({ x, y });

    const tiltX = -(y / rect.height) * 16;
    const tiltY = (x / rect.width) * 16;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setMousePos({ x: 0, y: -100 });
  };

  const angleRad = Math.atan2(mousePos.y, mousePos.x);
  const angleDeg = (angleRad * 180) / Math.PI + 90;

  const handleUnlockAndProceed = () => {
    playBeep([523, 659, 783], "sine", 0.4, 0.02);
    setStage("logpose");
  };

  const handleSetSail = () => {
    if (headingLocked) return;
    setHeadingLocked(true);
    playBeep([220, 440, 880, 1760], "sine", 0.8, 0.03);

    setTimeout(() => {
      setIsExiting(true);
    }, 900);

    setTimeout(() => {
      onEnter();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#130a0c] text-brand-secondary flex flex-col items-center justify-between p-6 overflow-hidden select-none"
        >
          {/* Subtle Burgundy Ambient Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(88,30,20,0.35)_0%,rgba(19,10,12,0.95)_75%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#6b2126_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* TOP HEADER STATUS BAR */}
          <div className="w-full max-w-5xl flex items-center justify-between z-20 font-mono text-[10px] tracking-widest text-[#c8b4b8]/60 uppercase pt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6b2126] animate-pulse" />
              <span>ZAINAB OS v2.0</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStage(stage === "hello" ? "logpose" : "hello")}
                className="hover:text-white transition-colors cursor-pointer border border-[#581e14]/50 px-2.5 py-1 rounded-md bg-[#2e1016]/60 flex items-center gap-1.5"
              >
                <Compass className="w-3 h-3 text-[#e64c73]" />
                <span>{stage === "hello" ? "Skip to Log Pose" : "Apple Hello Sequence"}</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER CONTENT SWITCHER */}
          <div className="w-full flex-1 flex flex-col items-center justify-center z-20 my-auto py-6">
            
            {/* STAGE 1: APPLE MOBILE PRODUCTS "HELLO" MULTILINGUAL STARTUP */}
            {stage === "hello" && (
              <motion.div
                key="apple-hello"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                onClick={handleUnlockAndProceed}
                className="w-full max-w-2xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[380px] space-y-12"
              >
                {/* Smooth Animated Multilingual Hello Display */}
                <div className="relative h-32 flex items-center justify-center w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={helloIndex}
                      initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                      <span className={HELLO_LANGUAGES[helloIndex].font}>
                        {HELLO_LANGUAGES[helloIndex].text}
                      </span>
                      <span className="mt-3 font-mono text-[10px] tracking-[0.3em] uppercase text-[#c8b4b8]/50">
                        {HELLO_LANGUAGES[helloIndex].lang}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Apple-style Swipe/Tap to Unlock prompt */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="flex flex-col items-center space-y-3 pt-8"
                >
                  <div className="w-12 h-1 rounded-full bg-white/30 backdrop-blur-md" />
                  <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-[#c8b4b8]/80 hover:text-white transition-colors">
                    <ChevronUp className="w-4 h-4 text-[#e64c73] animate-bounce" />
                    <span>Swipe up or click to calibrate Log Pose</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* STAGE 2: REDESIGNED BURGUNDY LOG POSE COMPASS */}
            {stage === "logpose" && (
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full max-w-lg flex flex-col items-center justify-center text-center space-y-8 cursor-none relative py-10 px-6 border border-[#581e14]/40 bg-[#1d0a0e]/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-all duration-300"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Micro tech corners */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#6b2126]/60 rounded-tl-md" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#6b2126]/60 rounded-tr-md" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#6b2126]/60 rounded-bl-md" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#6b2126]/60 rounded-br-md" />

                <AnimatePresence mode="wait">
                  {!isLoaded ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full space-y-8 py-8 flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                        className="w-16 h-16 rounded-full border-2 border-dashed border-[#6b2126] flex items-center justify-center text-[#e64c73]"
                      >
                        <Compass className="w-8 h-8 animate-pulse" />
                      </motion.div>

                      <div className="space-y-2">
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase">
                          CALIBRATING LOG POSE
                        </h2>
                        <p className="font-mono text-[10px] tracking-widest text-[#c8b4b8]/70 uppercase min-h-[1.5rem]">
                          {loadingText}
                        </p>
                      </div>

                      <div className="w-64 space-y-1.5">
                        <div className="flex justify-between items-center font-mono text-[9px] text-[#c8b4b8]/80 tracking-wider">
                          <span>SYNC MATRIX</span>
                          <span className="font-bold text-[#e64c73]">{loadPercentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#130a0c] border border-[#581e14]/60 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full bg-linear-to-r from-[#581e14] to-[#6b2126] rounded-full transition-all duration-150"
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="portal"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full flex flex-col items-center space-y-8"
                    >
                      <div className="space-y-2">
                        <span className="font-mono text-[10px] tracking-[0.25em] text-[#e64c73] font-bold uppercase block">
                          MAGNETIC FIELD ACQUIRED
                        </span>
                        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white uppercase">
                          LOCK THE PORTAL VECTOR
                        </h2>
                        <p className="font-mono text-[10px] text-[#c8b4b8]/80 uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
                          Hover to tilt the glass dome. Rotate your cursor around the burgundy core to set course.
                        </p>
                      </div>

                      {/* 3D BURGUNDY GLASS DOME COMPASS */}
                      <div className="relative w-60 h-60 flex items-center justify-center transform-gpu my-2">
                        {/* Outer Magnetic Pulse Ring */}
                        <div className="absolute w-64 h-64 rounded-full border border-dashed border-[#6b2126]/30 animate-[spin_25s_linear_infinite]" />
                        
                        {/* Navigational Ring with Directional Ticks */}
                        <div className="absolute w-56 h-56 rounded-full border-2 border-[#581e14] bg-[#2e1016]/40 shadow-inner flex items-center justify-center">
                          <div className="absolute inset-2 rounded-full border border-[#6b2126]/20 border-dashed" />
                          
                          <span className="absolute top-2 font-mono text-[8px] text-[#e64c73] font-bold">N (NAV)</span>
                          <span className="absolute bottom-2 font-mono text-[8px] text-[#c8b4b8]/60 font-bold">S (SYS)</span>
                          <span className="absolute right-3 font-mono text-[8px] text-[#c8b4b8]/60 font-bold">E (EXP)</span>
                          <span className="absolute left-3 font-mono text-[8px] text-[#c8b4b8]/60 font-bold">W (WEB)</span>
                        </div>

                        {/* Glass Sphere Container */}
                        <div 
                          className="absolute w-40 h-40 rounded-full border border-white/20 overflow-hidden shadow-[inset_0_4px_20px_rgba(255,255,255,0.15),0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-center"
                          style={{
                            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12) 0%, rgba(46,16,22,0.85) 65%, rgba(19,10,12,0.95) 100%)",
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <div className="absolute top-3 left-5 w-14 h-7 rounded-full bg-white/15 rotate-[-30deg] filter blur-[1px]" />

                          {/* Floating Burgundy Compass Needle */}
                          <motion.div
                            className="w-6 h-32 relative origin-center"
                            animate={headingLocked ? { rotate: [angleDeg, angleDeg + 720, angleDeg + 360] } : { rotate: angleDeg }}
                            transition={headingLocked ? { duration: 1.1, ease: "easeInOut" } : { type: "spring", stiffness: 90, damping: 12 }}
                          >
                            {/* Needle shadow */}
                            <div className="absolute top-1 left-2 w-3 h-28 bg-black/50 filter blur-xs rotate-[-1deg]" />

                            {/* North Red Pointer */}
                            <div 
                              className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                              style={{
                                borderLeft: "7px solid transparent",
                                borderRight: "7px solid transparent",
                                borderBottom: "64px solid #6b2126",
                              }}
                            />
                            {/* South Silver Pointer */}
                            <div 
                              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                              style={{
                                borderLeft: "7px solid transparent",
                                borderRight: "7px solid transparent",
                                borderTop: "64px solid #8a8880",
                              }}
                            />

                            {/* Pivot Pin */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#581e14] border border-white/40 rounded-full shadow-md z-10 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-[#e64c73] rounded-full" />
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* LOCK BUTTON */}
                      <button
                        onClick={handleSetSail}
                        disabled={headingLocked}
                        className={`group relative flex items-center justify-center gap-2.5 w-full max-w-xs py-3.5 bg-linear-to-r from-[#581e14] to-[#6b2126] border border-[#6b2126] text-white font-mono text-[11px] tracking-[0.2em] uppercase font-bold rounded-2xl shadow-[0_4px_20px_rgba(88,30,20,0.5)] cursor-pointer transition-all duration-200 hover:brightness-125 ${
                          headingLocked ? "opacity-60 cursor-not-allowed scale-95" : ""
                        }`}
                      >
                        <Anchor className="w-4 h-4" />
                        <span>{headingLocked ? "LOCKING HEADING..." : "ENTER PORTFOLIO"}</span>
                        <Wind className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* FOOTER INFO */}
          <div className="w-full max-w-5xl flex justify-between items-center z-20 font-mono text-[9px] text-[#c8b4b8]/50 tracking-widest uppercase pb-2">
            <span>© ZAINAB HINA // PORTFOLIO VECTOR</span>
            <span>SYSTEM READY</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
