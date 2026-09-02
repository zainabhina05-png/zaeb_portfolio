"use client";

import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/src/lib/utils";

interface PerspectiveGridProps {
  /** Additional CSS classes for the grid container */
  className?: string;
  /** Number of tiles per row/column (default: 40) */
  gridSize?: number;
  /** Whether to show the gradient overlay (default: true) */
  showOverlay?: boolean;
  /** Fade radius percentage for the gradient overlay (default: 80) */
  fadeRadius?: number;
}

export function PerspectiveGrid({
  className,
  gridSize = 40,
  showOverlay = true,
  fadeRadius = 80,
}: PerspectiveGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize tiles array to prevent unnecessary re-renders
  const tiles = useMemo(() => Array.from({ length: gridSize * gridSize }), [gridSize]);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-[#0a0a0a]",
        "[--fade-stop:#0a0a0a]",
        className
      )}
      style={{
        perspective: "2000px",
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute w-[80rem] aspect-square grid origin-center"
        style={{
          left: "50%",
          top: "50%",
          transform:
            "translate(-50%, -50%) rotateX(30deg) rotateY(-5deg) rotateZ(20deg) scale(2)",
          transformStyle: "preserve-3d",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          pointerEvents: "auto",
        }}
      >
        {/* Tiles */}
        {mounted &&
          tiles.map((_, i) => (
            <div
              key={i}
              className="tile min-h-[1px] min-w-[1px] border border-[#1a1d2e]/40 bg-transparent transition-colors duration-[1500ms] hover:duration-0 hover:border-[#7B1C3A] hover:bg-[#7B1C3A]/30"
              style={{
                pointerEvents: "auto",
              }}
            />
          ))}
      </div>

      {/* Radial Gradient Mask (Overlay) */}
      {showOverlay && (
        <div
          className="absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle, transparent 20%, var(--fade-stop) ${fadeRadius}%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export default PerspectiveGrid;
