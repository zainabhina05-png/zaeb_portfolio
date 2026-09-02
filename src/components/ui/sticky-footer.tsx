"use client";

import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import {
  Mail,
  ArrowUp,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { CONTACT_DETAILS, SOCIAL_LINKS } from "../../data/contact";
import { PerspectiveGrid } from "./perspective-grid";

interface FooterLink {
  title: string;
  href: string;
  isExternal?: boolean;
}

interface FooterLinkGroup {
  label: string;
  links: FooterLink[];
}

type StickyFooterProps = React.ComponentProps<"footer">;

// Platforms that get burgundy hover treatment
const BURGUNDY_PLATFORMS = new Set(["GitHub", "LinkedIn", "X"]);

export function StickyFooter({ className, ...props }: StickyFooterProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(CONTACT_DETAILS.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinkGroups: FooterLinkGroup[] = [
    {
      label: "Navigation",
      links: [
        { title: "About & Architecture", href: "#about" },
        { title: "Experience Chronicles", href: "#experience" },
        { title: "Work & Case Index", href: "#projects" },
        { title: "Education & Credentials", href: "#education" },
        { title: "Verified Dossier", href: "#resume" },
      ],
    },
    {
      label: "Specializations",
      links: [
        { title: "React 19 & Next.js 15", href: "#about" },
        { title: "Three.js & WebGL 3D", href: "#experience" },
        { title: "MERN & High-Volume APIs", href: "#projects" },
        { title: "PostgreSQL & Snowflake", href: "#projects" },
        { title: "Tailwind & Motion", href: "#about" },
      ],
    },
    {
      label: "Connect",
      links: [
        { title: CONTACT_DETAILS.email, href: `mailto:${CONTACT_DETAILS.email}` },
        { title: CONTACT_DETAILS.location, href: "#contact" },
        { title: "Full-Stack & 3D Roles", href: "#contact" },
        { title: "Download Resume PDF", href: "#resume" },
      ],
    },
  ];

  return (
    <footer
      id="contact"
      className={cn(
        "relative w-full text-white border-t border-white/[0.06] overflow-hidden select-none",
        "min-h-[80vh]",
        className
      )}
      style={{
        backgroundColor: "#0a0a0a",
      }}
      {...props}
    >
      {/* Perspective Grid Background */}
      <div className="absolute inset-0 z-0">
        <PerspectiveGrid 
          gridSize={40}
          showOverlay={true}
          fadeRadius={85}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-14 py-16 md:py-20 pointer-events-none">
        <div className="pointer-events-auto">

        {/* ── Grid: Brand CTA + 3 nav columns ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-12 mb-16">

          {/* Left: Brand CTA */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            <div>
              <p className="font-mono text-[11px] sm:text-xs tracking-[0.24em] uppercase text-white/40 mb-2">
                Portfolio — 2026
              </p>
              <h2 className="font-['Space_Grotesk'] font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.15] tracking-tight">
                Let's build something<br />remarkable together.
              </h2>
            </div>

            <p className="font-light text-sm sm:text-base text-white/55 leading-relaxed max-w-md">
              Available for full-stack engineering, technical
              architecture, and immersive 3D web systems.
            </p>

            {/* Inquiry email copy — burgundy hover */}
            <div className="space-y-1.5 pt-1">
              <span className="font-mono text-[10.5px] uppercase tracking-widest text-white/35 flex items-center gap-1.5 font-medium">
                <Mail size={12} />
                Inquiry
              </span>
              <button
                type="button"
                onClick={copyEmail}
                className="group flex items-center justify-between gap-4 py-2.5 px-4 bg-white/[0.04] border border-white/[0.09] hover:border-[#7B1C3A]/60 hover:bg-[#7B1C3A]/[0.10] rounded-xl transition-all duration-300 w-full max-w-sm cursor-pointer"
                title="Click to copy email"
              >
                <span className="font-mono text-xs sm:text-sm text-white/70 group-hover:text-white truncate font-light transition-colors duration-200">
                  {CONTACT_DETAILS.email}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 text-white/40 group-hover:text-[#c46080] transition-colors duration-200">
                  {copied
                    ? <Check size={13} className="text-emerald-400" />
                    : <Copy size={13} />}
                </div>
              </button>
            </div>

            {/* Social pills — GitHub / LinkedIn / X get burgundy */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SOCIAL_LINKS.map((link) => {
                const isBurgundy = BURGUNDY_PLATFORMS.has(link.platform);
                return (
                  <a
                    key={link.platform}
                    href={link.urlPlaceholder}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "px-3 py-1.5 rounded-lg bg-white/[0.04] border font-mono text-xs sm:text-[13px] flex items-center gap-1.5 transition-all duration-200 font-light",
                      isBurgundy
                        ? "border-white/[0.08] text-white/55 hover:border-[#7B1C3A]/60 hover:bg-[#7B1C3A]/[0.10] hover:text-white"
                        : "border-white/[0.08] text-white/45 hover:border-white/25 hover:text-white"
                    )}
                  >
                    {link.platform}
                    <ExternalLink size={10} className="opacity-45" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: 3 link columns */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 pt-1">
            {footerLinkGroups.map((group) => (
              <div key={group.label} className="space-y-4">
                <h4 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-white tracking-wider">
                  {group.label}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={link.href}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noreferrer" : undefined}
                        className="text-xs sm:text-[13.5px] font-light text-white/50 hover:text-white transition-colors leading-relaxed inline-flex items-center gap-1.5 group"
                      >
                        <span>{link.title}</span>
                        {link.isExternal && (
                          <ExternalLink size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Back to Top */}
        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <p className="text-xs text-white/30 font-mono">
            © 2026 Personal Portfolio. All rights reserved.
          </p>
          
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-white/30 hover:text-white/80 transition-colors duration-300 cursor-pointer font-light tracking-widest uppercase"
          >
            Back to top
            <ArrowUp size={12} />
          </button>
        </div>

        </div>
      </div>
    </footer>
  );
}

export default StickyFooter;

