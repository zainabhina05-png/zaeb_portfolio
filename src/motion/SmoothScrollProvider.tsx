import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { scrollObserver, type EasedScrollState } from "./ScrollObserver";

interface SmoothScrollContextValue {
  isPaused: boolean;
  isVirtual: boolean;
  setPaused: (paused: boolean) => void;
  scrollTo: (target: number | string | HTMLElement) => void;
  subscribe: (subscriber: (state: Readonly<EasedScrollState>) => void, emitImmediately?: boolean) => () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

const getNativeSnapshot = (timestamp = performance.now()) => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const scroll = window.scrollY || window.pageYOffset || 0;
  return { scroll, progress: Math.min(1, Math.max(0, scroll / maxScroll)), timestamp };
};

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  const [isPaused, setPaused] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const pausedRef = useRef(false);

  const setScrollPaused = useCallback((paused: boolean) => {
    pausedRef.current = paused;
    setPaused(paused);
    const lenis = lenisRef.current;
    if (lenis) {
      if (paused) lenis.stop();
      else lenis.start();
    }
    scrollObserver.publish({ paused, timestamp: performance.now() });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onNativeScroll = () => {
      const snapshot = getNativeSnapshot();
      scrollObserver.publish({
        ...snapshot,
        velocity: 0,
        direction: 0,
        virtual: false,
        paused: pausedRef.current,
      });
    };

    const enableNativeFallback = () => {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      setIsVirtual(false);
      onNativeScroll();
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      window.addEventListener("resize", onNativeScroll);
      return () => {
        window.removeEventListener("scroll", onNativeScroll);
        window.removeEventListener("resize", onNativeScroll);
      };
    };

    if (reducedMotion.matches) return enableNativeFallback();

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    setIsVirtual(true);

    lenis.on("scroll", (event) => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollObserver.publish({
        scroll: event.animatedScroll,
        progress: Math.min(1, Math.max(0, event.animatedScroll / maxScroll)),
        velocity: event.velocity,
        direction: event.direction === 0 ? 0 : event.direction > 0 ? 1 : -1,
        timestamp: performance.now(),
        virtual: true,
        paused: pausedRef.current,
      });
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };
    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
      setIsVirtual(false);
      scrollObserver.reset();
    };
  }, []);


  const scrollTo = useCallback((target: number | string | HTMLElement) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { immediate: true, force: true });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    element?.scrollIntoView({ block: "start", behavior: "auto" });
  }, []);

  const value = useMemo<SmoothScrollContextValue>(() => ({
    isPaused,
    isVirtual,
    setPaused: setScrollPaused,
    scrollTo,
    subscribe: scrollObserver.subscribe,
  }), [isPaused, isVirtual, scrollTo, setScrollPaused]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (!context) throw new Error("useSmoothScroll must be used inside SmoothScrollProvider.");
  return context;
}
