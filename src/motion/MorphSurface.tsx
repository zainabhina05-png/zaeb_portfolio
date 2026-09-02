import { animate, stagger } from "animejs";
import { useEffect, useRef, type PropsWithChildren } from "react";
import "./morph-surface.css";

type MorphSurfaceProps = PropsWithChildren;

const RECT = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
const ORGANIC_CUT = "polygon(0 5%, 95% 0, 100% 8%, 97% 92%, 91% 100%, 5% 96%, 0 11%)";
const SETTLED_CUT = "polygon(0 2%, 98% 0, 100% 97%, 96% 100%, 3% 98%, 0 5%)";

/**
 * Adds a visual-only morph to marked surfaces. Content, geometry, and source
 * data are untouched; the `data-morph` attribute opts repeated elements in.
 */
export function MorphSurface({ children }: MorphSurfaceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-morph-surface], [data-morph]"));
    if (!targets.length) return;

    const enter = () => {
      animationRef.current?.revert();
      animationRef.current = animate(targets, reducedMotion ? {
        opacity: [0, 1],
        duration: 220,
        delay: stagger(45),
        ease: "out(3)",
      } : {
        opacity: [0, 1],
        clipPath: [RECT, ORGANIC_CUT, SETTLED_CUT],
        duration: 880,
        delay: stagger(58),
        ease: "out(5)",
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.24) enter();
      },
      { threshold: [0, 0.24, 0.6] },
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      animationRef.current?.revert();
    };
  }, []);

  return <div ref={rootRef} className="morph-surface">{children}</div>;
}
