import { animate } from "animejs";
import { useEffect, useRef } from "react";
import "./hero-about-transition.css";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A non-invasive scroll bridge between the Hero and the existing About diorama.
 * It deliberately does not alter the diorama markup or its internal animation.
 */
export default function HeroAboutTransition() {
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const announceRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const bridge = bridgeRef.current;
    const hero = document.querySelector<HTMLElement>("#hero");
    const about = document.querySelector<HTMLElement>("#about");
    const card = document.querySelector<HTMLElement>(".hero-v3-cyber-card");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!bridge || !hero || !about || !card || reduceMotion) return;

    const announce = announceRef.current;
    if (announce) {
      animate(announce, {
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 720,
        delay: 240,
        ease: "out(4)",
      });
    }

    let frame = 0;
    const updateBridge = () => {
      frame = 0;
      const heroRect = hero.getBoundingClientRect();
      const travel = Math.max(hero.offsetHeight * 0.82, window.innerHeight * 0.92);
      const progress = clamp((-heroRect.top - hero.offsetHeight * 0.10) / travel);
      const reveal = clamp((progress - 0.42) / 0.45);

      bridge.style.setProperty("--swallow-progress", progress.toFixed(3));
      bridge.style.setProperty("--about-reveal", reveal.toFixed(3));
      bridge.toggleAttribute("data-active", progress > 0.025 && progress < 0.98);
      about.style.setProperty("--about-bridge-reveal", reveal.toFixed(3));
      about.toggleAttribute("data-bridge-revealed", reveal > 0.02);
      card.style.setProperty("--hero-card-bridge-progress", progress.toFixed(3));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateBridge);
    };

    updateBridge();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      about.style.removeProperty("--about-bridge-reveal");
      about.removeAttribute("data-bridge-revealed");
      card.style.removeProperty("--hero-card-bridge-progress");
    };
  }, []);

  return (
    <div ref={bridgeRef} className="hero-about-bridge" aria-hidden="true">
      <div className="hero-about-bridge__card">
        <div className="hero-about-bridge__wash" />
        <i className="hero-about-bridge__corner hero-about-bridge__corner--a" />
        <i className="hero-about-bridge__corner hero-about-bridge__corner--b" />
        <span ref={announceRef} className="hero-about-bridge__label">
          PORTRAIT // ENTERING MEMORY
        </span>
      </div>
    </div>
  );
}
