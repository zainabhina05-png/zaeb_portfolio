import React, { useEffect, useRef } from "react";
import { Award, Users, Star, Crown, ShieldAlert } from "lucide-react";
import { LEADERSHIP_PLACEHOLDERS } from "../data/experience";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Leadership() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Left Column entrance
    gsap.fromTo(leftColRef.current,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: leftColRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        }
      }
    );

    // Cards entrance stagger
    const validCards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null);
    gsap.fromTo(validCards,
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsContainerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === el || trigger.trigger === leftColRef.current || trigger.trigger === cardsContainerRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  // 3D Card tilt on hover using GSAP
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    gsap.to(card, {
      rotateY: normX * 10,
      rotateX: -normY * 10,
      transformPerspective: 800,
      scale: 1.01,
      borderColor: "var(--color-brand-accent)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
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
      id="leadership" 
      ref={containerRef} 
      className="relative py-32 px-4 md:px-10 bg-brand-bg border-t-2 border-double border-brand-border/40"
      style={{ perspective: "1200px" }}
    >
      {/* Subtle radial lights */}
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-brand-primary/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Heading & Grid Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-double border-brand-border pb-6">
          <div className="space-y-2">
            <span className="font-mono text-[10px] tracking-[0.25em] text-brand-primary uppercase block font-semibold">
              05 // QUEST ROLE: MENTOR & COMMANDER
            </span>
            <h2 className="text-4xl md:text-5.5xl font-gothic-sharp font-black text-brand-secondary tracking-wide uppercase">
              GUILD LEADERSHIP
            </h2>
          </div>
          <span className="font-mono text-[10px] text-brand-accent mt-4 md:mt-0 uppercase tracking-widest flex items-center gap-2 font-bold bg-brand-surface/20 px-3 py-1 border border-brand-border/50">
            <Users className="w-4 h-4 text-brand-accent animate-pulse" /> [MENTORSHIP INFLUENCE: 100%]
          </span>
        </div>

        {/* Asymmetrical Editorial split grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          {/* Left Column: Philosophical Credo (Spans 5) */}
          <div ref={leftColRef} className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-surface border border-brand-border/40 text-[9px] font-mono tracking-widest text-brand-accent uppercase font-bold">
              <Crown className="w-3.5 h-3.5 text-brand-accent animate-bounce" />
              <span>[COMMAND ARCHITECTURE]</span>
            </div>
            <p className="text-2xl md:text-3xl font-gothic-sharp font-black text-brand-secondary leading-tight uppercase">
              "True engineering leadership is not about managing lines of code, but inspiring developers to orchestrate legendary user experiences."
            </p>
            <p className="text-brand-primary font-mono text-xs uppercase tracking-wide leading-relaxed">
              Leading squad members, coordinating sprint cycles, unblocking structural database challenges, and building rich, reliable application realms.
            </p>
          </div>

          {/* Right Column: Key Leadership Milestone Blocks (Spans 7) */}
          <div ref={cardsContainerRef} className="lg:col-span-7 space-y-8 lg:pl-8 border-t lg:border-t-0 lg:border-l-2 lg:border-double border-brand-border/30 pt-8 lg:pt-0">
            {LEADERSHIP_PLACEHOLDERS.map((lead, index) => (
              <div
                key={lead.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className="group relative border-2 border-double border-brand-border bg-brand-surface/10 p-6 overflow-hidden hover:border-brand-accent transition-all duration-300 interactive-card transform-gpu shadow-[3px_3px_0px_0px_rgba(16,40,32,0.15)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Highlight corner element */}
                <div 
                  className="absolute top-0 right-0 p-4 font-mono text-[8px] text-brand-accent/50 tracking-widest uppercase font-bold"
                  style={{ transform: "translateZ(20px)" }}
                >
                  LEAD_LEVEL_0{index + 1}
                </div>

                <div className="space-y-4" style={{ transform: "translateZ(30px)" }}>
                  {/* Lead Title & Meta */}
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] tracking-widest text-brand-accent uppercase block font-bold">
                      [{lead.periodPlaceholder}]
                    </span>
                    <h3 className="text-xl font-gothic-sharp font-black text-brand-secondary uppercase tracking-wide">
                      {lead.rolePlaceholder}
                    </h3>
                    <span className="font-mono text-[10px] text-brand-primary uppercase tracking-widest block flex items-center gap-1.5 font-semibold">
                      <Star className="w-3.5 h-3.5 text-brand-accent animate-pulse" /> GUILD REGION: {lead.organizationPlaceholder}
                    </span>
                  </div>

                  {/* Narrative details */}
                  <p className="text-brand-primary font-mono text-xs leading-relaxed uppercase tracking-wide">
                    {lead.descriptionPlaceholder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

