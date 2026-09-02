import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "../motion/GsapLenisBridge";
import "./experience-star-transition.css";

type Star = { x: number; y: number; vy: number; color: string; char: string; life: number };

const STAR_CHARS = "01★✦*·";
const ASCII_CHARS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], width: number, height: number, progress: number) {
  ctx.clearRect(0, 0, width, height);
  const seamY = height * 0.42;

  stars.forEach((star) => {
    const inWhite = star.y > seamY;
    ctx.fillStyle = inWhite ? "#6b2126" : "#f4f5f1";
    ctx.font = "600 10px monospace";
    ctx.fillText(star.char, star.x, star.y);
  });

  if (progress > 0.35) {
    const asciiDensity = (progress - 0.35) / 0.35;
    ctx.globalAlpha = Math.min(1, asciiDensity * 1.2);
    for (let i = 0; i < 80 * asciiDensity; i += 1) {
      const x = Math.random() * width;
      const y = seamY + Math.random() * (height - seamY);
      ctx.fillStyle = Math.random() > 0.5 ? "#6b2126" : "#f4f5f1";
      ctx.font = "500 11px monospace";
      ctx.fillText(ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)], x, y);
    }
    ctx.globalAlpha = 1;
  }
}

function seedStars(width: number, count: number): Star[] {
  const seamY = width * 0.18;
  return Array.from({ length: count }, (_, index) => ({
    x: (index / count) * width + Math.random() * 18,
    y: seamY + Math.random() * 8,
    vy: 0.4 + Math.random() * 1.2,
    color: "#f4f5f1",
    char: STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
    life: Math.random(),
  }));
}

type ExperienceStarTransitionProps = {
  children: ReactNode;
};

export default function ExperienceStarTransition({ children }: ExperienceStarTransitionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollPanelRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const scrollPanel = scrollPanelRef.current;
    if (!root || !canvas || !scrollPanel) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = window.innerHeight;
      starsRef.current = seedStars(canvas.width, 48);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      scrollPanel.style.setProperty("--exp-scroll-unroll", "1");
      return () => window.removeEventListener("resize", resize);
    }

    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "+=280%",
      pin: true,
      scrub: 0.6,
      onUpdate(self) {
        const progress = self.progress;
        root.style.setProperty("--exp-transition-progress", progress.toFixed(4));

        const starPhase = Math.min(1, progress / 0.35);
        const asciiPhase = progress <= 0.35 ? 0 : Math.min(1, (progress - 0.35) / 0.35);
        const scrollPhase = progress <= 0.7 ? 0 : Math.min(1, (progress - 0.7) / 0.3);

        starsRef.current = starsRef.current.map((star) => ({
          ...star,
          y: star.y + star.vy * (1 + starPhase * 2.4) * (progress > 0.35 ? 2.2 : 1),
          char:
            asciiPhase > 0.4
              ? ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
              : STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)],
        }));

        drawStars(ctx, starsRef.current, canvas.width, canvas.height, progress);
        scrollPanel.style.setProperty("--exp-scroll-unroll", scrollPhase.toFixed(4));
        scrollPanel.style.setProperty("--exp-ascii-opacity", asciiPhase.toFixed(4));
      },
    });

    return () => {
      trigger.kill();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div ref={rootRef} className="experience-star-transition" aria-label="Experience chapter transition">
      <div className="experience-star-transition__red-zone" aria-hidden="true" />
      <canvas ref={canvasRef} className="experience-star-transition__canvas" aria-hidden="true" />
      <div ref={scrollPanelRef} className="experience-star-transition__scroll-panel">
        <div className="experience-star-transition__scroll-curl" aria-hidden="true" />
        <div className="experience-star-transition__content">{children}</div>
      </div>
    </div>
  );
}
