import { useEffect, useRef, useState } from "react";
import "./about-diorama.css";

export default function AboutDiorama() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.22 },
    );
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={sceneRef}
      className={`about-diorama${visible ? " is-visible" : ""}${reducedMotion ? " reduced-motion" : ""}`}
      aria-label="Zaeb's rider studio diorama"
    >
      <div className="about-diorama-frame" aria-hidden="true">
        <div className="about-diorama-backdrop" />
        <div className="about-diorama-grid" />
        <div className="about-diorama-horizon" />
        <div className="about-diorama-floor" />
        <div className="about-diorama-stage-light about-diorama-stage-light-left" />
        <div className="about-diorama-stage-light about-diorama-stage-light-right" />

        <div className="about-diorama-rider">
          <img className="about-diorama-standing" src="/greeting-assets/zaeb-standing.webp" alt="" />
          <img className="about-diorama-step-a" src="/greeting-assets/zaeb-step-a.webp" alt="" />
          <img className="about-diorama-step-b" src="/greeting-assets/zaeb-step-b.webp" alt="" />
          <img className="about-diorama-scooter" src="/greeting-assets/zaeb-scooter.webp" alt="" />
          <img className="about-diorama-scooter-motion" src="/greeting-assets/zaeb-scooter-motion.webp" alt="" />
          <span className="about-diorama-exhaust about-diorama-exhaust-one" />
          <span className="about-diorama-exhaust about-diorama-exhaust-two" />
        </div>

        <span className="about-diorama-corner about-diorama-corner-tl" />
        <span className="about-diorama-corner about-diorama-corner-br" />
        <span className="about-diorama-caption">01 / 01 · rider protocol</span>
      </div>
      <p className="about-diorama-label">From quiet observation to deliberate momentum.</p>
    </aside>
  );
}
