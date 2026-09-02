import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { ArrowDownRight, Terminal, Layers, Cpu } from "lucide-react";
import IdeTechStack from "./IdeTechStack";
import DeveloperBadge from "./DeveloperBadge";
import AboutCyclicBackground from "./AboutCyclicBackground";
import FlipFadeText from "./FlipFadeText";
import { ZAEB_ABOUT } from "../data/about";
import "./about-zaeb-v3.css";

export default function About() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);

  // Trigger lanyard physics drop animation right as user scrolls into view
  const isBadgeInView = useInView(badgeRef, { once: true, amount: 0.25 });

  // Heading scroll reveal with drop animation
  const { scrollYProgress: headingProgress } = useScroll({
    target: headingRef,
    offset: ["start 92%", "center 55%"],
  });
  const headingY       = useTransform(headingProgress, [0, 1], ["-120px", "0px"]);
  const headingOpacity = useTransform(headingProgress, [0, 0.4, 1], [0, 0.6, 1]);

  return (
    <section id="about" ref={sectionRef} className="zaeb-about relative overflow-hidden" aria-label="About Zainab">
      {/* Cyclic Animation on top of the 3-shade Taupe/Cream background */}
      <AboutCyclicBackground />

      <div className="zaeb-about-shell relative z-10">

        {/* Section eyebrow */}
        <div className="zaeb-about-header-meta">
          <p className="zaeb-about-eyebrow">
            <Terminal size={12} className="inline mr-1 text-brand-brass" />
            02 / PROFILE SIGNAL // ABOUT ME
          </p>
          <span className="zaeb-about-status-pill">
            <span className="zaeb-status-dot" /> SYSTEM_ACTIVE
          </span>
        </div>

        {/* ── 1. Big Display Heading ── */}
        <div ref={headingRef} className="zaeb-about-hero-block">
          <motion.div
            style={{ y: headingY, opacity: headingOpacity }}
            className="zaeb-about-headline-wrap"
          >
            <h2 className="zaeb-about-big-heading">
              <span className="zaeb-heading-mask">
                <span className="zaeb-heading-line"><FlipFadeText words={["ABOUT ME"]} /></span>
              </span>
            </h2>
            <div className="zaeb-about-dialogue-statement">
              <p className="zaeb-about-punchline">
                I design interfaces that <span className="zaeb-highlight-text">think</span>.{" "}
                I build systems that <span className="zaeb-highlight-text">respond</span>.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── 2. Developer Badge + Bio ── */}
        <div ref={badgeRef} className="zaeb-about-pass-section">
          <div className="zaeb-about-pass-grid">
            <div className="zaeb-about-bio-card">
              <div className="zaeb-bio-card-header">
                <Cpu size={14} className="text-[#e0455f]" />
                <span>BIOGRAPHICAL DATA // CORE_MISSION</span>
              </div>
              <p className="zaeb-bio-paragraph-lead">{ZAEB_ABOUT.shortBio}</p>
              <p className="zaeb-bio-paragraph-body">{ZAEB_ABOUT.longBio}</p>
              <div className="zaeb-bio-tags-row">
                {ZAEB_ABOUT.markers.map((marker, i) => (
                  <span key={i} className="zaeb-bio-tag">{marker}</span>
                ))}
              </div>
            </div>

            <div className="zaeb-about-badge-column">
              <DeveloperBadge isReady={isBadgeInView} />
            </div>
          </div>
        </div>

        {/* ── 3. IDE Tech Stack ── */}
        <div className="zaeb-about-ide-section">
          <div className="zaeb-ide-section-header">
            <div className="zaeb-ide-title-badge">
              <Layers size={14} className="text-[#e0455f]" />
              <span>FRONTEND · UI / UX · SYSTEMS</span>
            </div>
            <span className="zaeb-ide-hint-text">INTERACTIVE IDE STACK EXPLORER</span>
          </div>
          <IdeTechStack />
        </div>

        {/* Section footer */}
        <div className="zaeb-about-footer-line">
          <span>{ZAEB_ABOUT.markers.join("  ◆  ")}</span>
          <span className="zaeb-about-next-cue">
            NEXT / EXPERIENCE &amp; PROJECTS <ArrowDownRight size={14} aria-hidden="true" />
          </span>
        </div>

      </div>
    </section>
  );
}
