import React, { useState, useEffect, useRef } from "react";
import { Cpu, Check, Layers, HardDrive, Terminal, Paintbrush, Swords, Zap, Shield, Sparkles } from "lucide-react";
import { SKILL_CATEGORIES } from "../data";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Helper icons to represent categories technically
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "frontend":
        return <Layers className="w-5 h-5 text-brand-accent animate-pulse" />;
      case "backend":
        return <Terminal className="w-5 h-5 text-brand-accent animate-pulse" />;
      case "cloud & databases":
        return <HardDrive className="w-5 h-5 text-brand-accent animate-pulse" />;
      case "tools & workflows":
        return <Cpu className="w-5 h-5 text-brand-accent animate-pulse" />;
      default:
        return <Paintbrush className="w-5 h-5 text-brand-accent animate-pulse" />;
    }
  };

  // GSAP ScrollTrigger reveal stagger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Filter out null values
    const validCards = cardsRef.current.filter((card): card is HTMLDivElement => card !== null);

    const anim = gsap.fromTo(
      validCards,
      {
        opacity: 0,
        y: 60,
        rotationX: -15,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      anim.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el) trigger.kill();
      });
    };
  }, []);

  // 3D Card tilt mouse tracking using GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    const maxTiltX = 10; 
    const maxTiltY = 10;
    
    gsap.to(card, {
      rotateY: normX * maxTiltX,
      rotateX: -normY * maxTiltY,
      transformPerspective: 800,
      scale: 1.02,
      borderColor: "var(--color-brand-accent)",
      boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = (index: number) => {
    setActiveCard(null);
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      borderColor: "rgba(16, 40, 32, 0.16)",
      boxShadow: "0 0px 0px rgba(0,0,0,0)",
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <section 
      id="skills" 
      ref={sectionRef} 
      className="relative py-32 px-4 md:px-10 bg-brand-bg border-t-2 border-double border-brand-border/40"
      style={{ perspective: "1000px" }}
    >
      {/* Background visual grid elements */}
      <div className="absolute top-1/3 left-0 w-full h-[1px] bg-brand-border/10 pointer-events-none" />
      <div className="absolute top-2/3 left-0 w-full h-[1px] bg-brand-border/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Heading & Grid Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-double border-brand-border pb-6">
          <div className="space-y-2">
            <span className="font-mono text-[10px] tracking-[0.25em] text-brand-primary uppercase block font-semibold">
              03 // SKILL MATRIX: INVENTORY TREE
            </span>
            <h2 className="text-4xl md:text-5.5xl font-gothic-sharp font-black text-brand-secondary tracking-wide uppercase">
              ABILITY TREES
            </h2>
          </div>
          <span className="font-mono text-[10px] text-brand-accent uppercase tracking-widest font-bold bg-brand-surface/20 px-3 py-1 border border-brand-border/40">
            [ABILITY MASTERIES: UNLOCKED]
          </span>
        </div>

        {/* Bento Grid Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8" id="skills-grid-container">
          {SKILL_CATEGORIES.map((category, idx) => {
            return (
              <div
                key={category.categoryName}
                ref={(el) => { cardsRef.current[idx] = el; }}
                data-morph onMouseMove={(e) => handleMouseMove(e, idx)}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => handleMouseLeave(idx)}
                className="group relative border-2 border-double border-brand-border bg-brand-surface/10 p-6 flex flex-col justify-between overflow-hidden transition-colors duration-500 hover:border-brand-primary/40 interactive-card min-h-[340px] transform-gpu shadow-[3px_3px_0px_0px_rgba(16,40,32,0.15)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Visual hover background subtle gradient blur */}
                <div 
                  className="absolute -top-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                  style={{ transform: "translateZ(30px)" }}
                />

                <div className="space-y-6 relative z-10" style={{ transform: "translateZ(40px)" }}>
                  {/* Category Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 border border-brand-border/60 bg-brand-surface/50 group-hover:border-brand-accent/50 transition-colors">
                        {getIcon(category.categoryName)}
                      </div>
                      <h3 className="font-gothic-sharp font-black text-lg text-brand-secondary uppercase tracking-wider">
                        {category.categoryName}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-brand-accent font-bold tracking-widest">
                      [T_0{idx + 1}]
                    </span>
                  </div>

                  {/* Skills List inside Category */}
                  <div className="space-y-2 font-mono text-xs text-brand-primary uppercase tracking-wide">
                    {category.skills.map((skill, sIdx) => (
                      <div key={`${category.categoryName}-${skill}-${sIdx}`} className="flex items-center gap-2.5 group/item py-0.5">
                        <span className="text-brand-accent font-bold text-[10px] select-none group-hover/item:animate-pulse">◆</span>
                        <span className="group-hover/item:text-brand-secondary transition-colors font-medium">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Interactive Blueprint Decoration */}
                <div 
                  className="pt-6 mt-6 border-t border-brand-border/20 flex justify-between items-center relative z-10"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <span className="font-mono text-[9px] tracking-widest text-brand-primary/40 uppercase font-bold">
                    TREE STATE // READY
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-all duration-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-all duration-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-accent/20 group-hover:bg-brand-accent transition-all duration-700" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
