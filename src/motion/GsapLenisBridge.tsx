import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollObserver } from "./ScrollObserver";

gsap.registerPlugin(ScrollTrigger);

/**
 * Keeps GSAP ScrollTrigger in sync with the Lenis-driven scroll clock.
 */
export function GsapLenisBridge() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const onScroll = () => ScrollTrigger.update();
    const unsubscribe = scrollObserver.subscribe(onScroll, false);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          window.scrollTo(0, value as number);
        }
        return window.scrollY || window.pageYOffset || 0;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.refresh();

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}

export { ScrollTrigger, gsap };
