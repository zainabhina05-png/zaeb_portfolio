import { useCallback, useEffect, useRef, useState, type RefObject, type TouchEvent, type WheelEvent } from "react";
import { createPortal, flushSync } from "react-dom";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { animate, cubicBezier } from "animejs";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import CyberneticHead from "./CyberneticHead";
import { useSmoothScroll } from "../motion/SmoothScrollProvider";
import "./hero-intro.css";

interface HeroProps {
 onExploreClick: () => void;

}

type IntroPhase = "greeting" | "portal" | "hero";

const heroEase = cubicBezier(0.52, 0.01, 0, 1);

function useReducedMotion() {
 const [reduced, setReduced] = useState(false);
 useEffect(() => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => setReduced(query.matches);
  update();
  query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
 }, []);

 return reduced;
}

function reportNavigation(next: "hand" | "hero") {
 window.__portfolioNavigation?.transition(next);
}

function CyberneticHeroCard({ motionRef, artifactScale }: { motionRef: RefObject<HTMLDivElement | null>; artifactScale: MotionValue<number> | number }) {
  return (
	  <motion.div className="hero-v3-card-dock" ref={motionRef} style={{ scale: artifactScale, transformOrigin: "50% 50%" }} aria-label="ZAEB cybernetic calling card">
   <div className="hero-v3-cyber-card">
    <span className="hero-v3-card-pip hero-v3-card-pip-top">Z<br />â—‡</span>
    <span className="hero-v3-card-pip hero-v3-card-pip-bottom">B<br />â—‡</span>
    <div className="hero-v3-cyber-card-head"><CyberneticHead /></div>
    <span className="hero-v3-card-scan" aria-hidden="true" />
   </div>
   <p className="hero-v3-dock-caption">01 / 01 â€” enter the system</p>
  </motion.div>
	 );
	}

 export default function Hero({ onExploreClick }: HeroProps) {
 const { scrollTo, setPaused: setScrollPaused } = useSmoothScroll();
 const reducedMotion = useReducedMotion();
 const [phase, setPhase] = useState<IntroPhase>("greeting");
 const [ringPreludeComplete, setRingPreludeComplete] = useState(false);

 const [showSkip, setShowSkip] = useState(true);
 const [stageReady, setStageReady] = useState(false);
 const [introSkipped, setIntroSkipped] = useState(false);
 const touchStart = useRef<number | null>(null);
 const heroRef = useRef<HTMLElement>(null);
 const runwayRef = useRef<HTMLDivElement>(null);
 const copyRef = useRef<HTMLDivElement>(null);
 const artifactRef = useRef<HTMLDivElement>(null);
 const { scrollYProgress: heroRunwayProgress } = useScroll({ target: runwayRef, offset: ["start start", "end end"] });
 const smoothHeroProgress = useSpring(heroRunwayProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });
 const artifactScale = 1;
 const heroCopyOpacity = useTransform(smoothHeroProgress, [0, 0.78, 0.9, 1], [1, 1, 0.16, 0]);
 const heroCopyY = useTransform(smoothHeroProgress, [0, 0.78, 1], [0, 0, -36]);

 // ring-first-prelude-v1: keep every archived greeting element paused until this opening beat finishes.
 useEffect(() => {
  if (reducedMotion) {
   setRingPreludeComplete(true);
   return;
  }
  setRingPreludeComplete(false);
  const preludeTimer = window.setTimeout(() => setRingPreludeComplete(true), 2000);
  return () => window.clearTimeout(preludeTimer);
 }, [reducedMotion]);

 const releaseIntroLock = useCallback(() => {
  delete document.body.dataset.zaebIntro;
  setScrollPaused(false);
 }, [setScrollPaused]);

 useEffect(() => {
  const isIntro = phase === "greeting" || phase === "portal";
  if (isIntro) {
   document.body.dataset.zaebIntro = "true";
   // Lock Lenis so the page cannot scroll beneath the intro screen
   setScrollPaused(true);
  } else {
   releaseIntroLock();
  }
  return () => {
   delete document.body.dataset.zaebIntro;
   setScrollPaused(false);
  };
 }, [phase, releaseIntroLock, setScrollPaused]);

 useEffect(() => {
  if (reducedMotion) {
   setPhase("hero");
   return;
  }
  const skipTimer = window.setTimeout(() => setShowSkip(true), 1500);
  const stageTimer = window.setTimeout(() => setStageReady(true), 14900);
  return () => {
   window.clearTimeout(skipTimer);
   window.clearTimeout(stageTimer);
  };
 }, [reducedMotion]);

 useEffect(() => {
  if (phase !== "hero" || reducedMotion || introSkipped || !heroRef.current || !copyRef.current || !artifactRef.current) return;

  const copy = copyRef.current;
  const artifact = artifactRef.current;
  const artifactVisual = artifact.querySelector<HTMLElement>(".hero-v3-cyber-card") ?? artifact;
  const textTargets = [
   copy.querySelector<HTMLElement>(".hero-v3-kicker"),
   copy.querySelector<HTMLElement>(".hero-v3-tagline"),
   copy.querySelector<HTMLElement>(".hero-v3-actions"),
  ].filter((target): target is HTMLElement => target !== null);

  heroRef.current.dataset.heroMotion = "anime";
  const entranceControls = textTargets.map((target, index) => animate(target, {
   opacity: [0, 1],
   translateX: [-76, 0],
   duration: 880,
   delay: 130 + index * 105,
   ease: heroEase,
  }));
  const artifactEntrance = animate(artifactVisual, {
   opacity: [0, 1],
   translateX: [112, 0],
   translateY: [18, 0],
   rotateY: [-16, 0],
   rotateX: [5, 0],
   duration: 1180,
   delay: 250,
   ease: heroEase,
  });
  const artifactDrift = animate(artifactVisual, {
   translateY: [-5, 5],
   rotateY: [-1.2, 1.2],
   duration: 4200,
   delay: 1510,
   direction: "alternate",
   loop: true,
   ease: heroEase,
  });

  return () => {
   delete heroRef.current?.dataset.heroMotion;
   [...entranceControls, artifactEntrance, artifactDrift].forEach((control) => control.revert());
  };
 }, [phase, reducedMotion]);

 useEffect(() => {
  if (phase !== "hero" || !heroRef.current) return;

  const hero = heroRef.current;
  let frame = 0;
  let targetX = 0;
  let targetY = 0;

  const render = () => {
   frame = 0;
   hero.style.setProperty("--hero-wallpaper-x", `${targetX.toFixed(2)}px`);
   hero.style.setProperty("--hero-wallpaper-y", `${targetY.toFixed(2)}px`);
  };

  const handlePointerMove = (event: PointerEvent) => {
   if (event.pointerType && event.pointerType !== "mouse") return;
   const bounds = hero.getBoundingClientRect();
   const x = (event.clientX - bounds.left) / bounds.width - 0.5;
   const y = (event.clientY - bounds.top) / bounds.height - 0.5;
   targetX = x * 18;
   targetY = y * 12;
   if (!frame) frame = window.requestAnimationFrame(render);
  };

  const resetPointer = () => {
   targetX = 0;
   targetY = 0;
   if (!frame) frame = window.requestAnimationFrame(render);
  };

  hero.addEventListener("pointermove", handlePointerMove, { passive: true });
  hero.addEventListener("pointerleave", resetPointer, { passive: true });
  return () => {
   hero.removeEventListener("pointermove", handlePointerMove);
   hero.removeEventListener("pointerleave", resetPointer);
   if (frame) window.cancelAnimationFrame(frame);
   hero.style.removeProperty("--hero-wallpaper-x");
   hero.style.removeProperty("--hero-wallpaper-y");
  };
 }, [phase, reducedMotion, introSkipped]);

 const landOnHero = useCallback(() => {
  window.requestAnimationFrame(() => scrollTo(0));
 }, [scrollTo]);

 const portalTimerRef = useRef<number | null>(null);
 const finishSequence = useCallback(() => {
  portalTimerRef.current = null;
  releaseIntroLock();
  setPhase("hero");
  reportNavigation("hero");
  landOnHero();
 }, [landOnHero, releaseIntroLock]);

 const beginSequence = useCallback(() => {
  if (phase !== "greeting" || !stageReady) return;
  setPhase("portal");
  portalTimerRef.current = window.setTimeout(finishSequence, 1750);
 }, [finishSequence, phase, stageReady]);

 useEffect(() => () => {
  if (portalTimerRef.current !== null) window.clearTimeout(portalTimerRef.current);
 }, []);

 const skippingRef = useRef(false);
 const skipIntro = useCallback((event?: React.SyntheticEvent) => {
   event?.preventDefault();
   event?.stopPropagation();
   if (skippingRef.current) return;
   skippingRef.current = true;
   if (portalTimerRef.current !== null) {
    window.clearTimeout(portalTimerRef.current);
    portalTimerRef.current = null;
   }
   flushSync(() => {
    setIntroSkipped(true);
    setShowSkip(false);
    setPhase("hero");
   });
   releaseIntroLock();
   reportNavigation("hero");
   window.requestAnimationFrame(() => {
    scrollTo(0);
   });
  }, [releaseIntroLock, scrollTo]);

 const handleWheel = (event: WheelEvent) => {
  // Don't intercept if the wheel event originated inside the skip button
  const target = event.target as HTMLElement;
  if (target?.closest?.('[data-skip-btn]')) return;
  if (phase === "greeting" && event.deltaY > 8) {
   event.preventDefault();
   beginSequence();
  }
 };

 const handleTouchStart = (event: TouchEvent) => {
  touchStart.current = event.touches[0]?.clientY ?? null;
 };

 const handleTouchEnd = (event: TouchEvent) => {
  const start = touchStart.current;
  const end = event.changedTouches[0]?.clientY;
  touchStart.current = null;
  if (phase === "greeting" && start !== null && end !== undefined && start - end > 32) beginSequence();
 };

 if (phase === "hero") {
  return (
   <div className="hero-v3-runway" ref={runwayRef}>
   <section className={`hero-v3 hero-v3-final${reducedMotion ? " reduced-motion" : ""}${introSkipped ? " is-intro-skipped" : ""}`} id="hero" ref={heroRef}>
    <div className="hero-v3-wallpaper" aria-hidden="true" />
    <div className="hero-v3-wallpaper-veil" aria-hidden="true" />
    <div className="hero-v3-noise" aria-hidden="true" />
    <div className="hero-v3-final-grid">
     <motion.div className="hero-v3-copy" ref={copyRef} style={reducedMotion || introSkipped ? undefined : { opacity: heroCopyOpacity, y: heroCopyY }}>
      <span></span><p className="hero-v3-kicker">CREATIVE DEVELOPER &middot; SYSTEMS THINKER</p>
      <h1><span className="hero-v3-line-mask"><span className="hero-v3-line">ZAEB</span></span></h1>
       <p className="hero-v3-tagline">
         <span className="hero-v3-line-mask"><span className="hero-v3-line">I don't just build interfaces —</span></span>
         <span className="hero-v3-line-mask hero-v3-tagline-b"><span className="hero-v3-line">I build things that react.</span></span>
       </p>
      <div className="hero-v3-actions">
       <button type="button" className="v3-outline-control hero-v3-explore" onClick={onExploreClick} data-cursor-interactive>Explore map <ArrowUpRight size={15} /></button>
       <button type="button" className="hero-v3-contact" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>Get in touch</button>
      </div>
       <div className="hero-v3-meta"><span>Faisalabad, Pakistan</span><span>Available for MERN STACK | GAME SYSTEMS</span></div>
     </motion.div>
     <CyberneticHeroCard motionRef={artifactRef} artifactScale={reducedMotion ? 1 : artifactScale} />
    </div>
   </section>
   </div>
  );
 }

 if (phase === "greeting" || phase === "portal") {
  const skipButton = showSkip ? (
   <button
     type="button"
     data-skip-btn="true"
     onPointerDown={(event) => skipIntro(event)}
     onClick={(event) => skipIntro(event)}
     className="zaeb-greeting-skip zaeb-greeting-skip-portal"
     aria-label="Skip introduction"
   >
     Skip intro
   </button>
  ) : null;

  return (
   <>
   {typeof document !== "undefined" && skipButton ? createPortal(skipButton, document.body) : null}
   <section className={`zaeb-greeting${phase === "portal" ? " is-ring-portal" : ""}${ringPreludeComplete ? "" : " is-ring-preface-pending"}`} aria-label="ZAEB introduction" onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
    <div className="zaeb-greeting-glitch" aria-hidden="true" />
    <div className="zaeb-greeting-grain" aria-hidden="true" />
    <div className="zaeb-greeting-mark"><span className="zaeb-greeting-word zaeb-greeting-word-left">ZA</span><img className="zaeb-greeting-ring" src="/greeting-assets/zaeb-ring-clean.png" alt="" /><span className="zaeb-greeting-word zaeb-greeting-word-right">EB</span></div>
    <div className="zaeb-character-stage" aria-hidden="true">
     <img className="zaeb-character zaeb-character-standing" src="/greeting-assets/zaeb1.png" alt="" />
     <img className="zaeb-character zaeb-character-step-a" src="/greeting-assets/zaeb2.png" alt="" />
     <img className="zaeb-character zaeb-character-step-b" src="/greeting-assets/zaeb3.png" alt="" />
     <img className="zaeb-character zaeb-character-scooter" src="/greeting-assets/zaeb4.png" alt="" />
     <img className="zaeb-character zaeb-character-scooter-motion" src="/greeting-assets/zaeb5.png" alt="" />
     <div className="zaeb-character-chat"><span>HI! I AM<br />ZAEB ^_^</span></div>
     <div className="zaeb-character-chat zaeb-character-chat-secondary"><span>AND MEET<br />SUNNY</span></div>
    </div>
      <div className="zaeb-greeting-enter">
        <button type="button" onClick={beginSequence} className="zaeb-greeting-enter-button" disabled={!stageReady}>
          <ArrowDown size={15} /> {stageReady ? "Scroll to open" : "Arriving…"}
        </button>
        <span>if you don&apos;t take risks, you can&apos;t create a future</span>
      </div>
     <button className="zaeb-greeting-keyboard-enter" type="button" onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") beginSequence(); }} onClick={beginSequence} aria-label="Enter portfolio" />
    {phase === "portal" && <div className="zaeb-ring-portal" aria-hidden="true"><div className="zaeb-ring-portal-hero" /></div>}
    <div className="zaeb-melt-curtain" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
   </section>
   </>
  );
 }
}