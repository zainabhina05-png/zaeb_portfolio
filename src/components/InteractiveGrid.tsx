import { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    const dotSpacing = 40;
    const dotRadius = 1;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render a subtle, ambient horizontal/vertical gradient glow behind the grid
      if (mouseRef.current.active) {
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          300
        );
        gradient.addColorStop(0, "rgba(92, 111, 68, 0.08)");
        gradient.addColorStop(1, "rgba(252, 250, 242, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const originX = c * dotSpacing;
          const originY = r * dotSpacing;

          let drawX = originX;
          let drawY = originY;

          const dx = mouseRef.current.x - originX;
          const dy = mouseRef.current.y - originY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let alpha = 0.08;
          let rAccent = dotRadius;

          if (distance < 200) {
            // Magnetic warp
            const factor = (200 - distance) / 200;
            const force = factor * 8; // move up to 8px away/towards
            drawX -= (dx / distance) * force;
            drawY -= (dy / distance) * force;

            // Brighten opacity
            alpha = 0.08 + factor * 0.25;
            rAccent = dotRadius + factor * 1.5;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, rAccent, 0, Math.PI * 2);
          
          ctx.fillStyle = `rgba(45, 74, 43, ${alpha * 1.5})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
