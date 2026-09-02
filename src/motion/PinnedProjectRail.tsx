import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./GsapLenisBridge";
import { scrollObserver } from "./ScrollObserver";
import "./pinned-project-rail.css";

type PinnedProjectRailProps = {
  children: ReactNode;
  onProgress?: (progress: number) => void;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Desktop-only pinned project rail driven by GSAP ScrollTrigger scrub.
 */
export function PinnedProjectRail({ children, onProgress }: PinnedProjectRailProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const desktopQuery = window.matchMedia("(min-width: 900px)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let trigger: ScrollTrigger | null = null;

    const setFallback = () => {
      const active = desktopQuery.matches && !reducedQuery.matches;
      root.toggleAttribute("data-pinned-rail", active);

      if (trigger) {
        trigger.kill();
        trigger = null;
      }

      if (!active) {
        root.style.setProperty("--project-rail-progress", "0");
        track.style.transform = "";
        onProgress?.(0);
        return;
      }

      trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "+=240%",
        pin: true,
        scrub: 0.55,
        onUpdate(self) {
          const progress = clamp(self.progress);
          root.style.setProperty("--project-rail-progress", progress.toFixed(4));
          track.style.transform = `translate3d(${-progress * 18}vw, 0, 0)`;
          onProgress?.(progress);
        },
      });
    };

    setFallback();
    desktopQuery.addEventListener("change", setFallback);
    reducedQuery.addEventListener("change", setFallback);

    const unsubscribe = scrollObserver.subscribe(() => ScrollTrigger.update(), false);

    return () => {
      unsubscribe();
      trigger?.kill();
      desktopQuery.removeEventListener("change", setFallback);
      reducedQuery.removeEventListener("change", setFallback);
    };
  }, [onProgress]);

  return (
    <div ref={rootRef} className="pinned-project-rail">
      <div className="pinned-project-rail__sticky">
        <div ref={trackRef} className="pinned-project-rail__track">
          {children}
        </div>
      </div>
    </div>
  );
}
