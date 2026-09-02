import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowDownRight, Wifi, Zap } from "lucide-react";
import portraitFace from "../assets/images/zaeb.jpeg";

interface DeveloperBadgeProps { isReady: boolean; }

export default function DeveloperBadge({ isReady }: DeveloperBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pendulumRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLSpanElement>(null);
  const idleRef = useRef<gsap.core.Timeline | null>(null);
  const [tapped, setTapped] = useState(false);

  useLayoutEffect(() => {
    const pendulum = pendulumRef.current;
    const badge = badgeRef.current;
    if (!pendulum || !badge) return;
    idleRef.current?.kill();
    gsap.killTweensOf([pendulum, badge, clipRef.current, scanlineRef.current].filter(Boolean));
    if (!isReady) {
      gsap.set(pendulum, { y: -380, opacity: 0, rotationZ: -32 });
      gsap.set(badge, { y: -120, rotationZ: 18 });
      if (clipRef.current) gsap.set(clipRef.current, { y: -50, rotationZ: -12 });
      return;
    }
    gsap.set(pendulum, { y: -380, opacity: 0, rotationZ: -32 });
    const entrance = gsap.timeline({ defaults: { overwrite: "auto" } });
    entrance.to(pendulum, { y: 0, opacity: 1, duration: 2.05, ease: "elastic.out(1, 0.62)" }, 0);
    entrance.to(pendulum, { rotationZ: 0, duration: 3.8, ease: "elastic.out(1.1, 0.42)", onComplete: startIdleSway }, 0);
    entrance.fromTo(badge, { y: -120, rotationZ: 18 }, { y: 0, rotationZ: 0, duration: 2.65, ease: "elastic.out(1.06, 0.5)" }, 0.12);
    if (clipRef.current) entrance.fromTo(clipRef.current, { y: -50, rotationZ: -12 }, { y: 0, rotationZ: 0, duration: 2.25, ease: "elastic.out(1.1, 0.55)" }, 0.08);
    if (scanlineRef.current) entrance.fromTo(scanlineRef.current, { top: "0%" }, { top: "100%", duration: 1.6, ease: "power2.inOut" }, 0.52);
    return () => { entrance.kill(); idleRef.current?.kill(); };

    function startIdleSway() {
      if (!pendulumRef.current || !badgeRef.current) return;
      idleRef.current?.kill();
      const sway = gsap.timeline({ repeat: -1, yoyo: true });
      idleRef.current = sway;
      sway.to(pendulumRef.current, { rotationZ: 2.4, duration: 3.4, ease: "sine.inOut" });
      gsap.to(badgeRef.current, { rotationZ: -1.1, y: "+=2", duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", overwrite: "auto" });
      if (clipRef.current) gsap.to(clipRef.current, { rotationZ: 1.4, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut", overwrite: "auto" });
      if (scanlineRef.current) gsap.to(scanlineRef.current, { top: "100%", duration: 4.8, repeat: -1, ease: "power1.inOut", overwrite: "auto" });
    }
  }, [isReady]);

  useEffect(() => {
    const container = containerRef.current;
    const pendulum = pendulumRef.current;
    const badge = badgeRef.current;
    const clip = clipRef.current;
    if (!container || !pendulum || !badge || !isReady) return;

    const toBadgeRx = gsap.quickTo(badge, "rotationX", { duration: 0.72, ease: "power3.out" });
    const toBadgeRy = gsap.quickTo(badge, "rotationY", { duration: 0.72, ease: "power3.out" });
    const toBadgeScale = gsap.quickTo(badge, "scale", { duration: 0.9, ease: "power3.out" });
    const toPendulumRz = gsap.quickTo(pendulum, "rotationZ", { duration: 0.92, ease: "power3.out" });
    const toPendulumX = gsap.quickTo(pendulum, "x", { duration: 0.92, ease: "power3.out" });
    const toPendulumY = gsap.quickTo(pendulum, "y", { duration: 0.92, ease: "power3.out" });
    const toClipRx = clip ? gsap.quickTo(clip, "rotationX", { duration: 0.78, ease: "power3.out" }) : null;
    const toClipRy = clip ? gsap.quickTo(clip, "rotationY", { duration: 0.78, ease: "power3.out" }) : null;
    let lastX = 0.5;
    let lastY = 0.5;

    const onMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      const dx = x - 0.5;
      const dy = y - 0.5;
      const velocity = Math.min(1, Math.hypot(x - lastX, y - lastY) * 4);
      lastX = x;
      lastY = y;
      idleRef.current?.pause();
      toBadgeRx(-dy * (13 + velocity * 4));
      toBadgeRy(dx * (13 + velocity * 4));
      toBadgeScale(1.015 + velocity * 0.018);
      toPendulumRz(dx * (4.5 + velocity * 3));
      toPendulumX(dx * (8 + velocity * 8));
      toPendulumY(dy * (3 + velocity * 5));
      toClipRx?.(-dy * 4.5);
      toClipRy?.(-dx * 4.5);
      if (shineRef.current) shineRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(237,230,221,.28), transparent 58%)`;
    };
    const onLeave = () => {
      toBadgeRx(0); toBadgeRy(0); toBadgeScale(1);
      toPendulumRz(0); toPendulumX(0); toPendulumY(0);
      toClipRx?.(0); toClipRy?.(0);
      if (shineRef.current) shineRef.current.style.background = "radial-gradient(circle at 50% 50%, rgba(237,230,221,.08), transparent 70%)";
      window.setTimeout(() => idleRef.current?.resume(), 740);
    };
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });
    return () => { container.removeEventListener("mousemove", onMove); container.removeEventListener("mouseleave", onLeave); gsap.killTweensOf([badge, pendulum, clip].filter(Boolean)); };
  }, [isReady]);

  const pulse = () => { setTapped(true); window.setTimeout(() => setTapped(false), 900); };

  return (
    <div ref={containerRef} className="zaeb-developer-badge-stage" style={{ perspective: "1200px" }}>
      <div ref={pendulumRef} className="zaeb-developer-pendulum">
        <div className="zaeb-developer-lanyard" aria-hidden="true"><svg viewBox="0 0 200 128" fill="none"><path d="M22 0 C42 40 72 90 100 114" stroke="#4e4938" strokeWidth="2.5" opacity=".86" /><path d="M22 0 C42 40 72 90 100 114" stroke="#9c9187" strokeWidth=".75" strokeDasharray="3 3" opacity=".45" /><path d="M178 0 C158 40 128 90 100 114" stroke="#4e4938" strokeWidth="2.5" opacity=".86" /><path d="M178 0 C158 40 128 90 100 114" stroke="#9c9187" strokeWidth=".75" strokeDasharray="3 3" opacity=".45" /><circle cx="100" cy="114" r="5" stroke="#ede6dd" strokeWidth="1.5" fill="#1e1b20" /></svg></div>
        <div ref={clipRef} className="zaeb-developer-clip"><span /><i /></div>
        <div ref={badgeRef} className={`zaeb-developer-card${tapped ? " is-tapped" : ""}`} onClick={pulse} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pulse(); } }}>
          <span ref={scanlineRef} className="zaeb-developer-scanline" /><span ref={shineRef} className="zaeb-developer-shine" />
          <div className="zaeb-developer-card-head"><div><b>ZAINAB PROFILE PASS</b><small>SECURE ACCESS PASS</small></div><div className="zaeb-developer-nfc"><Wifi size={15} /><small>NFC_TAP</small></div></div>
          <div className="zaeb-developer-portrait"><span className="zaeb-developer-corner top-left" /><span className="zaeb-developer-corner top-right" /><span className="zaeb-developer-corner bottom-left" /><span className="zaeb-developer-corner bottom-right" /><img src={portraitFace} alt="Zainab avatar" /><em>CAM_SYS_01</em></div>
          <div className="zaeb-developer-name"><strong>ZAINAB // (ZAEB)</strong><small>GAME DEV & FULL STACK</small></div>
          <div className="zaeb-developer-card-foot"><span>CLEARANCE LEVEL<br /><b>[LEVEL_05_MAX]</b></span><span>EMISSION ID<br /><b>CY_2026 // 9402</b></span><i className="zaeb-developer-barcode" /></div>
          <div className="zaeb-developer-tap"><Zap size={18} /><b>NFC BEACON BROADCASTING</b></div>
        </div>
      </div>
      <span className="zaeb-developer-prompt">{isReady ? "[HOVER TO TILT // CLICK TO PULSE]" : "[SCROLL DOWN TO INITIATE HANDSHAKE]"} <ArrowDownRight size={12} /></span>
    </div>
  );
}
