import { animate, scrambleText, splitText, stagger } from "animejs";
import { useEffect, useRef } from "react";
import "./text-reveal.css";

type RevealTag = "h2" | "div" | "span";

interface TextRevealProps {
  as?: RevealTag;
  children: string;
  className?: string;
  split?: "chars" | "words";
  scramble?: boolean;
  ariaHidden?: boolean;
}

/**
 * Split-text is used only for selected chapter headings. The original string is
 * retained as the accessible name, and the DOM is restored during cleanup.
 */
export function TextReveal({ as: Tag = "span", children, className, split = "chars", scramble = false, ariaHidden = false }: TextRevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const original = children;
    const rootObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        rootObserver.disconnect();

        if (scramble) {
          animate(element, {
            innerHTML: scrambleText({ text: original }),
            duration: 680,
            ease: "out(4)",
          });
          return;
        }

        const splitter = splitText(element, {
          chars: split === "chars",
          words: split === "words",
          accessible: true,
          includeSpaces: false,
        });
        const units = split === "chars" ? splitter.chars : splitter.words;
        animate(units, {
          opacity: [0, 1],
          translateY: ["0.78em", "0em"],
          duration: 620,
          delay: stagger(split === "chars" ? 22 : 54),
          ease: "out(5)",
        });
      },
      { threshold: 0.36 },
    );

    rootObserver.observe(element);
    return () => {
      rootObserver.disconnect();
      element.textContent = original;
    };
  }, [children, scramble, split]);

  return (
    <Tag
      ref={(node) => { elementRef.current = node; }}
      className={`text-reveal${className ? ` ${className}` : ""}`}
      aria-label={ariaHidden ? undefined : children}
      aria-hidden={ariaHidden || undefined}
    >
      {children}
    </Tag>
  );
}
