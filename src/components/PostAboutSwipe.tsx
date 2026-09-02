import { animate, stagger } from "animejs";
import { Children, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import "./post-about-swipe.css";
import { Section } from "../motion/SectionTheme";
import { MeltSection } from "../motion/MeltSection";
import { MorphSurface } from "../motion/MorphSurface";
import { TextReveal } from "../motion/TextReveal";

interface PostAboutSwipeProps {
  children: ReactNode;
}

const CHAPTERS = [
  { label: "Experience", note: "01", scene: "starline", layout: "dossier", cue: "SELECTED RECORDS", theme: { bg: "#130a0c", fg: "#e8e8e3", accent: "#b8925a" } },
  { label: "Toolkit", note: "02", scene: "constellation", layout: "constellation", cue: "SYSTEM CONSTELLATION", theme: { bg: "#170b10", fg: "#eee9e5", accent: "#b8925a" } },
  { label: "Projects", note: "03", scene: "orbit", layout: "projects", cue: "LIVE ARCHIVE", theme: { bg: "#11090b", fg: "#e8e8e3", accent: "#c09a60" } },
  { label: "Credentials", note: "04", scene: "archive", layout: "archive", cue: "VERIFIED TRACE", theme: { bg: "#180d0d", fg: "#f0e9de", accent: "#b8925a" } },
  { label: "Contact", note: "05", scene: "botanical", layout: "contact", cue: "OPEN CHANNEL", theme: { bg: "#130a0c", fg: "#e8e8e3", accent: "#d0aa70" } },
] as const;

function ChapterScene({ chapter, active, children }: { chapter: (typeof CHAPTERS)[number]; active: boolean; children: ReactNode }) {
  const sceneRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = scene.querySelectorAll(".post-about-title-cut, .post-about-cue, .post-about-index span");
    const animation = animate(targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 640,
      delay: stagger(70),
      ease: "out(4)",
    });
    return () => {
      animation.revert();
    };
  }, [active]);

  const updateParallax = (event: ReactPointerEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene || event.pointerType === "touch") return;
    const rect = scene.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    scene.style.setProperty("--tilt-x", `${x.toFixed(3)}deg`);
    scene.style.setProperty("--tilt-y", `${y.toFixed(3)}deg`);
    scene.style.setProperty("--scene-x", `${(x * 2.6).toFixed(2)}%`);
    scene.style.setProperty("--scene-y", `${(y * 1.8).toFixed(2)}%`);
  };

  const resetParallax = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--tilt-x", "0deg");
    scene.style.setProperty("--tilt-y", "0deg");
    scene.style.setProperty("--scene-x", "0%");
    scene.style.setProperty("--scene-y", "0%");
  };

  return (
    <Section
      ref={sceneRef}
      theme={chapter.theme}
      threshold={0.4}
      className={`post-about-scene ${active ? "is-active" : ""}`}
      data-scene={chapter.scene}
      data-layout={chapter.layout}
      onPointerMove={updateParallax}
      onPointerLeave={resetParallax}
      aria-label={`${chapter.label} chapter`}
    >
      <MeltSection>
        <MorphSurface>
          <div className="post-about-scene__layer" data-morph-surface>
            <div className="post-about-artifact" aria-hidden="true" />
            <div className="post-about-cutline post-about-cutline--top" aria-hidden="true" />
            <div className="post-about-cutline post-about-cutline--bottom" aria-hidden="true" />
            <div className="post-about-index" aria-hidden="true"><span>{chapter.note}</span><i /></div>
            <div className="post-about-caption" aria-hidden="true">ZAEB // {chapter.cue}</div>
            <TextReveal as="h2" className="post-about-title-cut" ariaHidden>{chapter.label}</TextReveal>
            <div className="post-about-cue" aria-hidden="true"><span>↗</span><TextReveal as="span" scramble={chapter.note === "03"} ariaHidden>{chapter.cue}</TextReveal></div>
            <div className="post-about-scene-content">{children}</div>
            <div className="post-about-orbit" aria-hidden="true" />
          </div>
        </MorphSurface>
      </MeltSection>
    </Section>
  );
}

export default function PostAboutSwipe({ children }: PostAboutSwipeProps) {
  const childArray = useMemo(() => Children.toArray(children), [children]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scenes = Array.from(root.querySelectorAll(".post-about-scene")) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0] as IntersectionObserverEntry | undefined;
        if (mostVisible) setActiveIndex(scenes.indexOf(mostVisible.target as HTMLElement));
      },
      { threshold: [0.26, 0.46, 0.66], rootMargin: "-10% 0px -18% 0px" },
    );
    scenes.forEach((scene) => observer.observe(scene));

    const parentObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!!entry?.isIntersecting);
      },
      { threshold: 0.01 }
    );
    parentObserver.observe(root);

    return () => {
      observer.disconnect();
      parentObserver.disconnect();
    };
  }, []);

  return (
    <section ref={rootRef} className="post-about-swipe" aria-label="Portfolio chapters">
      <div className={`post-about-live-index ${isVisible ? "is-visible" : ""}`} aria-live="polite">
        <span>{CHAPTERS[activeIndex]?.note ?? "01"}</span>
        <i />
        <b>{CHAPTERS[activeIndex]?.label ?? "Experience"}</b>
      </div>
      {childArray.map((child, index) => {
        const chapter: (typeof CHAPTERS)[number] = CHAPTERS[index] ?? CHAPTERS[4];
        return <ChapterScene chapter={chapter} active={activeIndex === index}>{child}</ChapterScene>;
      })}
    </section>
  );
}
