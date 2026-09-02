import { useEffect, useState } from "react";
import { motion, type MotionValue, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface ExperienceCardsProps {
  scrollProgress: MotionValue<number>;
}

interface ExperienceCardItem {
  title: string;
  image: string;
  href: string;
  kicker: string;
  start: number;
  end: number;
  index: number;
}

const EXPERIENCE_CARDS: ExperienceCardItem[] = [
  { title: "Full-Stack Systems", image: "/living-artifacts/experience-starline.webp", href: "#fullstack", kicker: "01 // SYSTEMS", start: 0.36, end: 0.51, index: 0 },
  { title: "Game Development", image: "/living-artifacts/projects-orbit.webp", href: "#gamedev", kicker: "02 // GAME DEV", start: 0.48, end: 0.63, index: 1 },
  { title: "3D & Interactive Web", image: "/about-bg/metallic-z-glow.jpg", href: "#3dweb", kicker: "03 // 3D WEB", start: 0.60, end: 0.75, index: 2 },
  { title: "Community & Leadership", image: "/living-artifacts/credentials-botanical.webp", href: "#community", kicker: "04 // LEADERSHIP", start: 0.72, end: 0.90, index: 3 },
];

function ExperienceCard({ card, scrollProgress, isMobile }: { card: ExperienceCardItem; scrollProgress: MotionValue<number>; isMobile: boolean }) {
  const exitEnd = Math.min(1, card.end + 0.08);
  const entranceStart = Math.max(0, card.start - 0.045);
  const even = card.index % 2 === 0;
  const xFrom = isMobile ? "0vw" : even ? "-8vw" : "8vw";
  const xTo = isMobile ? "0vw" : even ? "-2vw" : "2vw";
  const yFrom = isMobile ? "42px" : even ? "48px" : "86px";
  const yTo = isMobile ? "0px" : even ? "-12px" : "34px";
  const rotateFrom = isMobile ? 0 : even ? -5 : 5;
  const rotateTo = isMobile ? 0 : even ? -2 : 2;

  const opacity = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [0, 1, 1, 0]);
  const x = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [xFrom, xTo, xTo, isMobile ? "0vw" : even ? "-13vw" : "13vw"]);
  const y = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [yFrom, yTo, yTo, isMobile ? "-28px" : even ? "-72px" : "72px"]);
  const scale = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [0.9, 1, 1, 0.9]);
  const rotateX = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [isMobile ? 0 : 14, 0, 0, isMobile ? 0 : -10]);
  const rotateZ = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [rotateFrom, rotateTo, rotateTo, rotateFrom * 1.6]);
  const z = useTransform(scrollProgress, [entranceStart, card.start, card.end, exitEnd], [isMobile ? 0 : -160, 0, 0, isMobile ? 0 : 120]);

  return (
    <motion.article
      className={`experience-poster-card experience-poster-card-${card.index + 1}`}
      style={{ opacity, x, y, scale, rotateX, rotateZ, z, transformPerspective: 1200 }}
    >
      <img src={card.image} alt="" className="experience-poster-image" loading="lazy" />
      <div className="experience-poster-overlay" />
      <div className="experience-poster-content">
        <span className="experience-poster-kicker">{card.kicker}</span>
        <h3>{card.title}</h3>
        <a href={card.href} className="experience-poster-link">
          SEE MORE <ArrowUpRight size={13} />
        </a>
      </div>
    </motion.article>
  );
}

export default function ExperienceCards({ scrollProgress }: ExperienceCardsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 720);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="experience-card-layer" aria-label="Experience categories">
      {EXPERIENCE_CARDS.map((card) => (
        <ExperienceCard key={card.title} card={card} scrollProgress={scrollProgress} isMobile={isMobile} />
      ))}
    </div>
  );
}
