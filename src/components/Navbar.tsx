import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Map, Menu, X } from "lucide-react";

interface NavbarProps {
  activeSection: string;
  onOpenPortal?: () => void;
  portfolioMode?: "game" | "scroll";
  onSetPortfolioMode?: (mode: "game" | "scroll") => void;
  onTeleportToLandmark?: (section: string) => void;
}

const navItems = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({
  activeSection,
  portfolioMode = "scroll",
  onSetPortfolioMode,
  onTeleportToLandmark,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isNearTop, setIsNearTop] = useState(true);
  const lastScrollY = useRef(0);
  const [scrollingUp, setScrollingUp] = useState(true);

  useEffect(() => {
    const sync = () => setIntroDone(document.body.dataset.zaebIntro !== "true");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-zaeb-intro"] });
    return () => observer.disconnect();
  }, []);

  // Track scroll direction and top proximity for auto-hide
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNearTop(currentScrollY < 80);
      if (currentScrollY < lastScrollY.current - 4) {
        setScrollingUp(true);
      } else if (currentScrollY > lastScrollY.current + 6 && currentScrollY > 100) {
        setScrollingUp(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Top edge hover trigger zone
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 64) {
        setIsHovered(true);
      } else if (e.clientY > 90) {
        setIsHovered(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isVisible = introDone && (isNearTop || scrollingUp || isHovered || menuOpen);

  const handleScrollTo = (id: string) => {
    setMenuOpen(false);
    if (portfolioMode === "game" && onTeleportToLandmark) {
      onTeleportToLandmark(id);
      return;
    }
    if (portfolioMode === "game" && onSetPortfolioMode) {
      onSetPortfolioMode("scroll");
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openMap = () => {
    setMenuOpen(false);
    if (onSetPortfolioMode) onSetPortfolioMode("game");
  };

  return (
    <>
      {/* Invisible top hover hotspot to trigger navbar reveal when mouse approaches top */}
      <div
        className="zaeb-nav-hover-trigger"
        aria-hidden="true"
        onMouseEnter={() => setIsHovered(true)}
      />

      <nav
        className={`zaeb-bottom-nav${isVisible ? " is-visible" : " is-hidden"}`}
        aria-label="Portfolio navigation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="zaeb-bottom-nav-shell">
          <button
            type="button"
            className="zaeb-nav-wordmark"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Zainab
          </button>

          <div className="zaeb-nav-links" aria-label="Portfolio sections">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeSection === item.id ? "is-active" : ""}
                onClick={() => handleScrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="zaeb-nav-actions">
            <button type="button" className="zaeb-nav-resume" onClick={() => handleScrollTo("resume")}>
              <span>Resume</span><ArrowUpRight size={13} strokeWidth={1.7} />
            </button>
            <button type="button" className="zaeb-nav-power" onClick={openMap} aria-label="Open Explore Map">
              <span className="zaeb-nav-power-dot" aria-hidden="true" />
              <span className="zaeb-nav-power-label"><b>Portfolio</b><i aria-hidden="true" />Explore Map</span>
              <Map size={14} strokeWidth={1.7} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="zaeb-nav-menu"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="zaeb-nav-mobile-panel">
            {navItems.map((item) => (
              <button type="button" key={item.id} onClick={() => handleScrollTo(item.id)}>
                {item.label}
              </button>
            ))}
            <button type="button" onClick={() => handleScrollTo("resume")}>
              Resume <ArrowUpRight size={14} />
            </button>
            <button type="button" onClick={openMap}>
              Explore Map <Map size={14} />
            </button>
          </div>
        )}
      </nav>
    </>
  );
}



