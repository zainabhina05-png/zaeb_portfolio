import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Box, Code2, Layers, Sparkles } from "lucide-react";
import { STACK_CATEGORIES, type StackItem } from "./CategorizedStackGrid";
import { cn } from "../lib/utils";
import "./isometric-stack.css";
import "./staggered-stack-grid.css";

gsap.registerPlugin(ScrollTrigger);

type BentoCard = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  icon: ReactNode;
};

const BENTO_CARDS: BentoCard[] = [
  {
    id: "frontend",
    title: "FRONTEND",
    kicker: "INTERFACES",
    description: "React, Next.js, TypeScript, and Tailwind — surfaces that think before they render.",
    icon: <Code2 size={16} />,
  },
  {
    id: "uiux",
    title: "UI / UX",
    kicker: "SIGNAL",
    description: "Motion, hierarchy, and tactile feedback so the system feels alive in the hand.",
    icon: <Layers size={16} />,
  },
  {
    id: "systems",
    title: "SYSTEMS",
    kicker: "3D + API",
    description: "Three.js, GSAP, Node, and data layers that hold the product together.",
    icon: <Sparkles size={16} />,
  },
];

function flattenTiles(): StackItem[] {
  return STACK_CATEGORIES.flatMap((category) => category.items);
}

function splitText(text: string) {
  return text.split("").map((char, i) => (
    <span key={`${char}-${i}`} className="zaeb-stag-char" style={{ willChange: "transform" }}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function StaggeredStackGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeBento, setActiveBento] = useState(1);
  const tiles = useMemo(() => flattenTiles(), []);

  const mixedSlots = useMemo(() => {
    const slots: Array<StackItem | "BENTO"> = Array.from({ length: 21 }, (_, i) => tiles[i % tiles.length]);
    slots[16] = "BENTO";
    return slots;
  }, [tiles]);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const grid = gridRef.current;
    if (!root || !text || !grid) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Animate text characters
      const chars = text.querySelectorAll(".zaeb-stag-char");
      gsap.timeline({
        scrollTrigger: {
          trigger: text,
          start: "top 92%",
          end: "center 58%",
          scrub: 1,
        },
      }).from(chars, {
        ease: "sine.out",
        yPercent: 220,
        autoAlpha: 0,
        stagger: { each: 0.045, from: "center" },
      });

      // Pyramidal animation setup
      const gridItemsArray = Array.from(grid.querySelectorAll<HTMLElement>(".zaeb-stag-item"));
      const columnCount = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 7;
      const columns: HTMLElement[][] = Array.from({ length: columnCount }, () => []);
      
      // Calculate grid dimensions
      const gridRect = grid.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
      const colWidth = (gridRect.width - gap * (columnCount - 1)) / columnCount;

      // Assign items to columns
      gridItemsArray.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const col = Math.min(
          columnCount - 1,
          Math.max(0, Math.round((rect.left - gridRect.left) / (colWidth + gap))),
        );
        columns[col]?.push(item);
      });

      const middle = Math.floor(columnCount / 2);
      
      // Animate each column from center outward
      columns.forEach((columnItems, columnIndex) => {
        if (!columnItems.length) return;
        
        const distanceFromCenter = Math.abs(columnIndex - middle);
        const delayFactor = distanceFromCenter * 0.2;
        
        gsap.timeline({
          scrollTrigger: {
            trigger: grid,
            start: "top 88%",
            end: "center 52%",
            scrub: 1.5,
          },
        }).from(columnItems, {
          yPercent: 350,
          autoAlpha: 0,
          delay: delayFactor,
          ease: "sine.out",
          stagger: 0.04,
        });
      });

      // Bento container animation
      const bento = grid.querySelector(".zaeb-stag-bento");
      if (bento) {
        gsap.to(bento, {
          y: 28,
          scale: 1.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: grid,
            start: "top 55%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const timer = window.setTimeout(refresh, 180);
    window.addEventListener("resize", refresh);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="zaeb-stag">
      <div ref={textRef} className="zaeb-stag-title" aria-hidden="true">
        {splitText("STACK")}
      </div>

      <div ref={gridRef} className="zaeb-stag-grid">
        {mixedSlots.map((slot, index) => {
          if (slot === "BENTO") {
            return (
              <div key="bento" className="zaeb-stag-item zaeb-stag-bento">
                {BENTO_CARDS.map((card, cardIndex) => {
                  const isActive = activeBento === cardIndex;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={cn("zaeb-stag-card", isActive && "is-active")}
                      onMouseEnter={() => setActiveBento(cardIndex)}
                      onFocus={() => setActiveBento(cardIndex)}
                      onClick={() => setActiveBento(cardIndex)}
                      aria-pressed={isActive}
                    >
                      <span className="zaeb-stag-card-idle">
                        {card.icon}
                        <span>{card.title}</span>
                      </span>
                      <span className="zaeb-stag-card-live">
                        <span className="zaeb-stag-card-kicker">{card.kicker}</span>
                        <strong>{card.title}</strong>
                        <em>{card.description}</em>
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          }

          if (index === 17 || index === 18) return null;

          return (
            <figure key={`${slot.id}-${index}`} className="zaeb-stag-item zaeb-stag-tile">
              <div className="zaeb-stag-tile-face">
                <div className="zaeb-stag-tile-icon">{slot.icon ?? <Box size={22} />}</div>
                <figcaption>
                  <span>Build with</span>
                  <strong>{slot.name}</strong>
                </figcaption>
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
