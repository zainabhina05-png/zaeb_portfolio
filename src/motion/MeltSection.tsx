import { animate } from "animejs";
import { useEffect, useRef, type PropsWithChildren } from "react";
import "./melt-section.css";

type MeltSectionProps = PropsWithChildren<{
  threshold?: number;
}>;

/**
 * Visual-only chapter handoff. It observes an already-laid-out section rather
 * than changing content or scroll geometry, so it composes safely with themes.
 */
export function MeltSection({ threshold = 0.42, children }: MeltSectionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(false);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enter = () => {
      animationRef.current?.revert();
      animationRef.current = animate(target, reducedMotion ? {
        opacity: [0, 1],
        duration: 260,
        ease: "out(3)",
      } : {
        opacity: [0, 1],
        scale: [0.97, 1],
        filter: ["blur(4px)", "blur(0px)"],
        duration: 660,
        delay: 110,
        ease: "out(5)",
      });
    };

    const exit = () => {
      animationRef.current?.revert();
      animationRef.current = animate(target, reducedMotion ? {
        opacity: [1, 0],
        duration: 180,
        ease: "out(2)",
      } : {
        // One concurrent animation: scale, blur, and opacity move as a single melt gesture.
        scale: [1, 1.4],
        filter: ["blur(0px)", "blur(12px)"],
        opacity: [1, 0],
        duration: 760,
        ease: "out(5)",
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const isActive = entry.isIntersecting && entry.intersectionRatio >= threshold;
        if (isActive && !activeRef.current) enter();
        if (!isActive && activeRef.current) exit();
        activeRef.current = isActive;
      },
      { threshold: [0, threshold, 0.76] },
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      animationRef.current?.revert();
    };
  }, [threshold]);

  return (
    <div ref={rootRef} className="melt-section">
      <div ref={targetRef} className="melt-section__target">
        {children}
      </div>
    </div>
  );
}
