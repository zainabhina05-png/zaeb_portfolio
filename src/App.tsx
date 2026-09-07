/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useReducer, useState } from "react";
import Navbar from "./components/Navbar";
import InteractiveGrid from "./components/InteractiveGrid";
import CustomCursor from "./components/CustomCursor";
import Hero from "./components/Hero";
import GlassesScrollText from "./components/GlassesScrollText";
import About from "./components/About";
import Experience from "./components/Experience";
import WorkIndex from "./components/WorkIndex";
import Education from "./components/Education";
import Resume from "./components/Resume";
import Footer from "./components/Footer";
const AdventureGame = lazy(() => import("./components/AdventureGame"));
import GameEntryTransition from "./components/GameEntryTransition";
import { useSmoothScroll } from "./motion/SmoothScrollProvider";
import { navigationReducer, type NavigationState } from "./state/navigationMachine";

export default function App() {
  const { setPaused: setSmoothScrollPaused } = useSmoothScroll();
  const [navigationState, dispatchNavigation] = useReducer(
    navigationReducer,
    "greeting",
  );

  useEffect(() => {
    console.info(`[Navigation machine] Current state: ${navigationState}`);
    window.__portfolioNavigation = {
      state: navigationState,
      transition: (next: NavigationState) =>
        dispatchNavigation({ type: "transition", next }),
    };

    return () => {
      delete window.__portfolioNavigation;
    };
  }, [navigationState]);

  const [portfolioMode, setPortfolioMode] = useState<"game" | "scroll">("scroll");

  useEffect(() => {
    setSmoothScrollPaused(portfolioMode === "game");
  }, [portfolioMode, setSmoothScrollPaused]);

  const [activeSection, setActiveSection] = useState("");
  const [teleportSection, setTeleportSection] = useState<string | null>(null);

  // Track the section nearest the reading line so the navbar active state follows scroll position.
  useEffect(() => {
    const sectionIds = [
      "about",
      "experience",
      "projects",
      "education",
      "resume",
      "contact",
    ];

    const getActiveSection = () => {
      const focusY = window.innerHeight * 0.35;
      let bestSection = "";
      let bestDistance = Number.POSITIVE_INFINITY;

      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const distance = rect.top <= focusY && rect.bottom >= focusY ? 0 : Math.min(Math.abs(rect.top - focusY), Math.abs(rect.bottom - focusY));
        const isCandidate = rect.bottom > focusY && rect.top < window.innerHeight;
        if (isCandidate && distance < bestDistance) {
          bestDistance = distance;
          bestSection = id;
        }
      });

      if (bestSection) setActiveSection(bestSection);
    };

    getActiveSection();
    window.addEventListener("scroll", getActiveSection, { passive: true });
    window.addEventListener("resize", getActiveSection);
    return () => {
      window.removeEventListener("scroll", getActiveSection);
      window.removeEventListener("resize", getActiveSection);
    };
  }, []);

  const handleExploreClick = () => {
    dispatchNavigation({ type: "transition", next: "gamemode_entry" });
    setPortfolioMode("game");
  };

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-secondary overflow-x-clip selection:bg-brand-primary selection:text-brand-surface font-sans">
      {/* Background Interactive canvas overlay */}
      <InteractiveGrid />

      {/* Exquisite micro-noise physical texture overlay */}
      <div className="noise-overlay" />

      {/* Advanced smoothing Cursor pointer */}
      <CustomCursor disabled={portfolioMode === "game"} />

      {/* Dynamic Header sticky menu (Hidden in full-screen 3D game mode) */}
      {portfolioMode !== "game" && (
        <Navbar
          activeSection={activeSection}
          onOpenPortal={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          portfolioMode={portfolioMode}
          onSetPortfolioMode={setPortfolioMode}
          onTeleportToLandmark={(section) => {
            setTeleportSection(section);
          }}
        />
      )}

      {/* Main Scaffold Layout */}
      <main className="relative z-10 w-full" id="root-viewport-scaffold">
        <Hero onExploreClick={handleExploreClick} />
        <GlassesScrollText />

        {/* Dynamic Mode Switch Block */}
        {portfolioMode === "game" ? (
          <>
            <GameEntryTransition />
            <Suspense fallback={<div className="fixed inset-0 z-50 grid place-items-center bg-brand-bg text-brand-brass-hot font-mono text-xs tracking-[0.14em] uppercase">Loading town</div>}>
              <AdventureGame
                teleportSection={teleportSection}
                onTeleportComplete={() => setTeleportSection(null)}
                onSwitchToScrollMode={() => setPortfolioMode("scroll")}
              />
            </Suspense>
          </>
        ) : (
          <>
            {/* 01. About section */}
            <About />

            {/* 02. Experience section */}
            <Experience />

            {/* 03. Projects / WorkIndex section */}
            <WorkIndex />

            {/* 04. Education & Certifications section */}
            <Education />

            {/* 05. 3D Tilted Resume Dossier */}
            <Resume />

            {/* 06. Sticky Footer with Giant ZAEB */}
            <Footer />
          </>
        )}
      </main>

    </div>
  );
}
