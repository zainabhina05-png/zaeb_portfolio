import { animate } from "animejs";
import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, type HTMLAttributes, type PropsWithChildren, type Ref } from "react";

export interface SectionTheme {
  bg: string;
  fg: string;
  accent: string;
}

interface SectionThemeContextValue {
  applyTheme: (theme: SectionTheme, immediate?: boolean) => void;
}

const DEFAULT_THEME: SectionTheme = {
  bg: "#130a0c",
  fg: "#e8e8e3",
  accent: "#b8925a",
};

const SectionThemeContext = createContext<SectionThemeContextValue | null>(null);

function setRootTheme(theme: SectionTheme) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--fg", theme.fg);
  root.style.setProperty("--accent", theme.accent);
}

export function SectionThemeProvider({ children }: PropsWithChildren) {
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  const applyTheme = useCallback((theme: SectionTheme, immediate = false) => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    animationRef.current?.revert();
    if (immediate || reducedMotion) {
      setRootTheme(theme);
      return;
    }

    animationRef.current = animate(root, {
      "--bg": theme.bg,
      "--fg": theme.fg,
      "--accent": theme.accent,
      duration: 720,
      ease: "out(5)",
    });
  }, []);

  useEffect(() => {
    setRootTheme(DEFAULT_THEME);
    return () => {
      animationRef.current?.revert();
    };
  }, []);

  const value = useMemo<SectionThemeContextValue>(() => ({ applyTheme }), [applyTheme]);
  return <SectionThemeContext.Provider value={value}>{children}</SectionThemeContext.Provider>;
}

type SectionProps = PropsWithChildren<HTMLAttributes<HTMLElement> & {
  theme: SectionTheme;
  threshold?: number;
}>;

/**
 * Marks a normal-scroll chapter as a root-palette source. The wrapper owns only
 * theme entry detection; it does not impose presentation styles or mutate child content.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section({ theme, threshold = 0.4, children, className, ...rest }, forwardedRef) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const context = useContext(SectionThemeContext);

  if (!context) throw new Error("Section must be used inside SectionThemeProvider.");

  const assignRef = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) (forwardedRef as Ref<HTMLElement> & { current: HTMLElement | null }).current = node;
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const upperMargin = Math.round(threshold * 100);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) context.applyTheme(theme);
      },
      {
        rootMargin: `-${upperMargin}% 0px -${Math.max(0, 99 - upperMargin)}% 0px`,
        threshold: 0,
      },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [context, theme, threshold]);

  return (
    <section ref={assignRef} className={className} {...rest}>
      {children}
    </section>
  );
});
