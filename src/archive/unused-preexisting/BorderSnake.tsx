import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface Food {
  progress: number; // 0 to 1 along the cumulative path
  id: number;
}

export default function BorderSnake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snakeLength, setSnakeLength] = useState(150); // Starting length in pixels
  const [foodEatenCount, setFoodEatenCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false); // Default false, user can toggle

  // Refs for animation loop variables (to avoid re-running useEffect)
  const stateRef = useRef({
    distance: 0,
    speed: 2.2, // pixels per frame
    points: [] as Point[],
    cumDists: [] as number[],
    totalLength: 0,
    bodyHistory: [] as Point[],
    foods: [] as Food[],
    particles: [] as Particle[],
    lastTime: 0,
    theme: "light" as "light" | "dark",
  });

  const sectionIds = [
    "about",
    "experience",
    "skills",
    "projects",
    "leadership",
    "education",
    "certifications",
    "resume",
    "contact"
  ];

  // Sound generator
  const playBeep = (freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context guard
    }
  };

  // Build the border path based on DOM sections
  const updatePath = () => {
    const state = stateRef.current;
    const points: Point[] = [];
    const clientWidth = document.documentElement.clientWidth || window.innerWidth;
    
    // Safety padding to prevent clipping
    const padX = 6;
    const padY = 2;

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const top = rect.top + window.scrollY + padY;
      const bottom = rect.bottom + window.scrollY - padY;
      const left = rect.left + window.scrollX + padX;
      const right = rect.right + window.scrollX - padX;

      // Add borders of this section as consecutive path points:
      // Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left -> Top-Left
      points.push({ x: left, y: top });
      points.push({ x: right, y: top });
      points.push({ x: right, y: bottom });
      points.push({ x: left, y: bottom });
      points.push({ x: left, y: top });
    });

    if (points.length === 0) return;

    // Filter out redundant sequential identical points
    const filteredPoints: Point[] = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = filteredPoints[filteredPoints.length - 1];
      const curr = points[i];
      if (Math.hypot(curr.x - prev.x, curr.y - prev.y) > 2) {
        filteredPoints.push(curr);
      }
    }

    // Connect last point back to first point on the left side to form a complete closed loop!
    if (filteredPoints.length > 1) {
      filteredPoints.push({ ...filteredPoints[0] });
    }

    // Compute cumulative distances
    const cumDists: number[] = [0];
    let total = 0;
    for (let i = 1; i < filteredPoints.length; i++) {
      const d = Math.hypot(
        filteredPoints[i].x - filteredPoints[i-1].x,
        filteredPoints[i].y - filteredPoints[i-1].y
      );
      total += d;
      cumDists.push(total);
    }

    state.points = filteredPoints;
    state.cumDists = cumDists;
    state.totalLength = total;
  };

  // Get point coordinates at distance d along the path
  const getPointAtDistance = (d: number): Point => {
    const { points, cumDists, totalLength } = stateRef.current;
    if (points.length === 0 || totalLength === 0) return { x: 0, y: 0 };

    let targetD = d % totalLength;
    if (targetD < 0) targetD += totalLength;

    let i = 0;
    while (i < cumDists.length - 1 && cumDists[i+1] < targetD) {
      i++;
    }

    const pStart = points[i];
    const pEnd = points[i+1];
    const segmentL = cumDists[i+1] - cumDists[i];
    if (segmentL === 0) return { ...pStart };

    const t = (targetD - cumDists[i]) / segmentL;
    return {
      x: pStart.x + (pEnd.x - pStart.x) * t,
      y: pStart.y + (pEnd.y - pStart.y) * t,
    };
  };

  // Handle resizing and initial layout
  useEffect(() => {
    updatePath();

    // Check current theme
    const isDark = document.documentElement.classList.contains("dark");
    stateRef.current.theme = isDark ? "dark" : "light";

    // Setup initial foods
    if (stateRef.current.foods.length === 0) {
      stateRef.current.foods = [
        { progress: 0.12, id: 1 },
        { progress: 0.45, id: 2 },
        { progress: 0.78, id: 3 },
      ];
    }

    const handleResize = () => {
      updatePath();
    };

    const observer = new MutationObserver(() => {
      updatePath();
      const isDarkNow = document.documentElement.classList.contains("dark");
      stateRef.current.theme = isDarkNow ? "dark" : "light";
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updatePath);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updatePath);
      observer.disconnect();
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (!canvas || !ctx) return;

      // Handle high-DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const state = stateRef.current;
      if (state.points.length === 0 || state.totalLength === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // 1. Move snake head
      if (isPlaying) {
        state.distance += state.speed;
        if (state.distance >= state.totalLength) {
          state.distance -= state.totalLength;
        }
      }

      const head = getPointAtDistance(state.distance);

      // 2. Add head to body history
      if (isPlaying) {
        state.bodyHistory.unshift(head);
        
        // We space segments by 1.5px. Number of points needed = snakeLength / 1.5
        const maxPoints = Math.floor(snakeLength / 1.5);
        if (state.bodyHistory.length > maxPoints) {
          state.bodyHistory.length = maxPoints;
        }
      }

      // 3. Draw Section Borders underneath (visual path helper)
      ctx.strokeStyle = state.theme === "dark" ? "rgba(134, 239, 172, 0.05)" : "rgba(76, 100, 68, 0.05)";
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      state.points.forEach((p, idx) => {
        const renderX = p.x - window.scrollX;
        const renderY = p.y - window.scrollY;
        if (idx === 0) ctx.moveTo(renderX, renderY);
        else ctx.lineTo(renderX, renderY);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // 4. Draw & Update Food
      state.foods.forEach((food) => {
        const foodDist = food.progress * state.totalLength;
        const foodPt = getPointAtDistance(foodDist);
        const renderX = foodPt.x - window.scrollX;
        const renderY = foodPt.y - window.scrollY;

        // Check eating collision (distance between head and food < 16px)
        const distToHead = Math.hypot(head.x - foodPt.x, head.y - foodPt.y);
        if (isPlaying && distToHead < 16) {
          // EAT FOOD!
          setSnakeLength((prev) => prev + 35); // Grow body length!
          setFoodEatenCount((prev) => prev + 1);

          // Audio feedback
          playBeep(523.25, "sine", 0.1); // C5 beep
          setTimeout(() => playBeep(659.25, "sine", 0.15), 80); // E5 beep

          // Particle burst
          const color = state.theme === "dark" ? "#86efac" : "#4c6444";
          for (let pIdx = 0; pIdx < 16; pIdx++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.5;
            state.particles.push({
              x: foodPt.x,
              y: foodPt.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: color,
              alpha: 1,
              size: 2 + Math.random() * 4,
            });
          }

          // Respawn food at a brand new progress
          food.progress = Math.random();
        }

        // Draw glowing food gem
        const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.15;
        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(Date.now() * 0.002);
        
        // Glow effect
        ctx.shadowColor = state.theme === "dark" ? "#86efac" : "#4c6444";
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = state.theme === "dark" ? "#86efac" : "#4c6444";
        const size = 5 * pulse;
        
        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // 5. Draw Particle Burst
      if (isPlaying) {
        state.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04; // Gravity drift
          p.alpha -= 0.015;
        });
        state.particles = state.particles.filter((p) => p.alpha > 0);
      }

      state.particles.forEach((p) => {
        const rx = p.x - window.scrollX;
        const ry = p.y - window.scrollY;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(rx, ry, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. Draw Snake Body
      const history = state.bodyHistory;
      if (history.length > 0) {
        const bodyColor = state.theme === "dark" ? "#86efac" : "#5d8553";
        const eyeColor = state.theme === "dark" ? "#102820" : "#ffffff";

        // Draw tail to neck (underneath head)
        for (let k = history.length - 1; k >= 0; k--) {
          const pt = history[k];
          const rx = pt.x - window.scrollX;
          const ry = pt.y - window.scrollY;

          // Scale size and opacity down towards the tail
          const ratio = 1 - k / history.length;
          const size = (k === 0 ? 6.5 : 4.8) * ratio;
          const alpha = 0.2 + 0.8 * ratio;

          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Glow effect on head/neck
          if (k < 5) {
            ctx.shadowColor = bodyColor;
            ctx.shadowBlur = 8;
          }

          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.arc(rx, ry, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw cute little snake eyes on the head!
        const headPt = history[0];
        const nextPt = history[1] || headPt;
        const rx = headPt.x - window.scrollX;
        const ry = headPt.y - window.scrollY;

        // Compute movement angle to orient eyes
        const angle = Math.atan2(headPt.y - nextPt.y, headPt.x - nextPt.x);
        const eyeOffsetDist = 2.5;
        const eyeAngleOffset = 0.65;

        const leftEyeX = rx + Math.cos(angle + eyeAngleOffset) * eyeOffsetDist;
        const leftEyeY = ry + Math.sin(angle + eyeAngleOffset) * eyeOffsetDist;
        const rightEyeX = rx + Math.cos(angle - eyeAngleOffset) * eyeOffsetDist;
        const rightEyeY = ry + Math.sin(angle - eyeAngleOffset) * eyeOffsetDist;

        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 1, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, snakeLength, soundEnabled]);

  const handleReset = () => {
    setSnakeLength(150);
    setFoodEatenCount(0);
    stateRef.current.distance = 0;
    stateRef.current.bodyHistory = [];
    stateRef.current.particles = [];
    playBeep(330, "sine", 0.15);
    setTimeout(() => playBeep(261.63, "sine", 0.2), 100);
  };

  return (
    <>
      {/* Absolute Layer containing Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[35]"
        style={{ mixBlendMode: "normal" }}
      />

      {/* Floating retro game controls in top-right margin */}
      <div className="fixed top-24 right-6 z-50 pointer-events-auto flex items-center gap-2 bg-brand-surface/75 border border-brand-border/80 backdrop-blur-md p-1.5 rounded-full shadow-lg">
        {/* Level Display */}
        <div className="px-3 py-1 font-mono text-[9px] font-bold text-brand-secondary uppercase flex items-center gap-1.5 border-r border-brand-border/40">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
          <span>SNAKE: L_{foodEatenCount + 1}</span>
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            playBeep(440, "sine", 0.08);
          }}
          className="p-1.5 hover:text-brand-accent text-brand-primary transition-colors focus:outline-none rounded-full hover:bg-brand-primary/5"
          title={isPlaying ? "Pause Snake" : "Resume Snake"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-1.5 hover:text-brand-accent text-brand-primary transition-colors focus:outline-none rounded-full hover:bg-brand-primary/5"
          title="Reset Snake"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) {
              // Beep once as handshake
              setTimeout(() => {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const osc = audioCtx.createOscillator();
                  const gain = audioCtx.createGain();
                  osc.connect(gain);
                  gain.connect(audioCtx.destination);
                  osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
                  gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                  osc.start();
                  osc.stop(audioCtx.currentTime + 0.15);
                } catch (e) {}
              }, 100);
            }
          }}
          className={`p-1.5 transition-colors focus:outline-none rounded-full hover:bg-brand-primary/5 ${soundEnabled ? "text-brand-accent font-extrabold" : "text-brand-primary/40 hover:text-brand-primary"}`}
          title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </>
  );
}
