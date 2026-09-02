import { useEffect, useRef, useState } from "react";
import "./custom-cursor.css";

type CustomCursorProps = {
  disabled?: boolean;
};

export default function CustomCursor({ disabled = false }: CustomCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<number | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsFinePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (disabled || !isFinePointer) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onPointerMove = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    const onPointerDown = () => {
      cursor.classList.remove("is-clicking");
      void cursor.offsetWidth;
      cursor.classList.add("is-clicking");
      if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = window.setTimeout(() => cursor.classList.remove("is-clicking"), 260);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current);
    };
  }, [disabled, isFinePointer]);

  if (disabled || !isFinePointer) return null;

  return (
    <div ref={cursorRef} className="portfolio-cursor" aria-hidden="true">
      <img className="portfolio-cursor-star" src="/cursor-assets/cursor-click-star.png" alt="" />
      <img className="portfolio-cursor-arrow" src="/cursor-assets/cursor-arrow.png" alt="" />
    </div>
  );
}
