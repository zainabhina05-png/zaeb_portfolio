import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import FlipFadeText from "./FlipFadeText";
import "./glasses-scroll-text.css";

const leftLensContent =
  "FULL STACK · REACT · TYPESCRIPT · NEXT.JS · MERN STACK · SYSTEMS DESIGN · REALTIME WEBSOCKETS · NODE.JS · EXPRESS · POSTGRESQL · DOCKER · CI/CD · FULL STACK · REACT · TYPESCRIPT · NEXT.JS · MERN STACK · SYSTEMS DESIGN · REALTIME WEBSOCKETS · NODE.JS · EXPRESS · POSTGRESQL · DOCKER · CI/CD ·";

const rightLensContent =
  "GAME SYSTEMS · THREE.JS 3D · OPEN SOURCE · C++ SFML · SHADER GRAPHS · MODULAR ARCHITECTURE · REACT THREE FIBER · GSAP · MOTION · GSAP SCROLL · GAME SYSTEMS · THREE.JS 3D · OPEN SOURCE · C++ SFML · SHADER GRAPHS · MODULAR ARCHITECTURE · REACT THREE FIBER · GSAP · MOTION · GSAP SCROLL ·";

const bgRow1 =
  "ZAEB · CREATIVE FULL STACK ARCHITECT · NEXT.JS · REACT · TYPESCRIPT · MERN STACK DEVELOPER · ZAEB · CREATIVE FULL STACK ARCHITECT · NEXT.JS · REACT · TYPESCRIPT · MERN STACK DEVELOPER ·";
const bgRow2 =
  "HIGH PERFORMANCE UI · GAME SYSTEMS · THREE.JS 3D · DISTRIBUTED SYSTEMS · DOCKER & CI/CD · TAILWIND CSS · GSAP · POSTGRESQL · HIGH PERFORMANCE UI · GAME SYSTEMS · THREE.JS 3D · DISTRIBUTED SYSTEMS ·";
const bgRow3 =
  "INTERACTION DESIGN · CREATIVE CODE · SHADER GRAPH · STATE MACHINES · OPEN SOURCE · CYBERNETIC DESIGN · C++ SFML ENGINE · NODE.JS APIS · INTERACTION DESIGN · CREATIVE CODE · SHADER GRAPH ·";

const knowMeWords = ["CREATIVE", "SYSTEMS", "THINKER", "BUILDER", "DESIGNER", "ENGINEER", "CURIOUS", "ALWAYS"];

function renderAlternatingLensText(text: string) {
  const words = text.split(" ");
  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      className={index % 2 === 0 ? "zaeb-lens-word zaeb-lens-word-red" : "zaeb-lens-word zaeb-lens-word-black"}
    >
      {word}{index < words.length - 1 ? " " : ""}
    </span>
  ));
}

export default function GlassesScrollText() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 94%", "end 8%"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 110, damping: 32, mass: 0.7, restDelta: 0.0015 });

  const line1X = useTransform(smoothProgress, [0, 1], ["6%", "-30%"]);
  const line2X = useTransform(smoothProgress, [0, 1], ["-30%", "12%"]);
  const line3X = useTransform(smoothProgress, [0, 1], ["8%", "-32%"]);

  // The title and word field lead the sequence. The glasses rise next, then lens text swipes.
  const titleOpacity = useTransform(smoothProgress, [0, 0.1, 0.2], [0, 1, 1]);
  const titleY = useTransform(smoothProgress, [0, 0.2], ["3rem", "0rem"]);
  const wordsOpacity = useTransform(smoothProgress, [0.08, 0.24, 0.42, 0.56], [0, 1, 0.78, 0]);
  const wordsY = useTransform(smoothProgress, [0.08, 0.3], ["5rem", "0rem"]);
  const wordsX = useTransform(smoothProgress, [0.08, 0.38], ["-2%", "0%"]);
  const glassesLift = useTransform(smoothProgress, [0.34, 0.66], ["9vh", "0vh"]);
  const glassesScale = useTransform(smoothProgress, [0.34, 0.66], [0.965, 1]);

  const lensProgress = useTransform(smoothProgress, [0.52, 0.96], [0, 1]);
  const leftX = useTransform(lensProgress, [0, 1], ["3vw", "-15vw"]);
  const rightX = useTransform(lensProgress, [0, 1], ["-15vw", "5vw"]);
  const leftXAlt = useTransform(lensProgress, [0, 1], ["-6vw", "10vw"]);
  const rightXAlt = useTransform(lensProgress, [0, 1], ["6vw", "-10vw"]);

  return (
    <section ref={sectionRef} className="zaeb-glasses-gap" aria-label="ZAEB optical magnification transition">
      <div className="zaeb-glasses-stage">
        <motion.h2 className="zaeb-glasses-know-title" style={{ opacity: titleOpacity, y: titleY }}>
          <FlipFadeText words={["KNOW ME BETTER"]} />
        </motion.h2>

        <motion.div className="zaeb-glasses-word-field" style={{ opacity: wordsOpacity, y: wordsY, x: wordsX }} aria-hidden="true">
          {knowMeWords.map((word, index) => (
            <span key={word} className={index % 2 === 0 ? "zaeb-know-word zaeb-know-word-red" : "zaeb-know-word zaeb-know-word-black"}>
              {word}
            </span>
          ))}
        </motion.div>

        <div className="zaeb-glasses-streams" aria-hidden="true">
          <motion.div className="zaeb-glasses-stream" style={{ x: line1X }}><span>{bgRow1}</span></motion.div>
          <motion.div className="zaeb-glasses-stream" style={{ x: line2X }}><span>{bgRow2}</span></motion.div>
          <motion.div className="zaeb-glasses-stream" style={{ x: line3X }}><span>{bgRow3}</span></motion.div>
        </div>

        <motion.div className="zaeb-glasses-overlap-shell" style={{ y: glassesLift, scale: glassesScale }}>
          <div className="zaeb-glasses-object" tabIndex={0} role="img" aria-label="Interactive ZAEB glasses frame">
            <svg className="zaeb-glasses-defs" aria-hidden="true">
              <defs>
                <filter id="zaeb-lens-optical-distortion" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="7" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>

            <div className="zaeb-glasses-lens-text" aria-hidden="true">
              <div className="zaeb-glasses-lens-pane zaeb-glasses-lens-pane-left">
                <div className="zaeb-glasses-lens-track" style={{ filter: "url(#zaeb-lens-optical-distortion)" }}>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: leftX }}><strong>{renderAlternatingLensText(leftLensContent)}</strong></motion.div>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: leftXAlt }}><strong>{renderAlternatingLensText(leftLensContent)}</strong></motion.div>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: leftX }}><strong>{renderAlternatingLensText(leftLensContent)}</strong></motion.div>
                </div>
                <span className="zaeb-lens-radial-glare" />
              </div>

              <div className="zaeb-glasses-lens-pane zaeb-glasses-lens-pane-right">
                <div className="zaeb-glasses-lens-track" style={{ filter: "url(#zaeb-lens-optical-distortion)" }}>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: rightX }}><strong>{renderAlternatingLensText(rightLensContent)}</strong></motion.div>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: rightXAlt }}><strong>{renderAlternatingLensText(rightLensContent)}</strong></motion.div>
                  <motion.div className="zaeb-glasses-stream zaeb-lens-highlight" style={{ x: rightX }}><strong>{renderAlternatingLensText(rightLensContent)}</strong></motion.div>
                </div>
                <span className="zaeb-lens-radial-glare" />
              </div>
              <span className="zaeb-glasses-sheen" />
            </div>

            <img src="/about-bg/zaeb-glasses-frame-clean.png" alt="ZAEB Ornate Wayfarer Glasses" className="zaeb-glasses-reference-frame" />

            <div className="zaeb-glasses-caption-line">
              <span>INSPECT THE LENS</span>
              <span>WAYFARER OPTICS · HIGH MAGNIFICATION</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
