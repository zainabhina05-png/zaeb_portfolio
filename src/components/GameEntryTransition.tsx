import { useEffect, useState, type CSSProperties } from "react";
import "./game-entry-transition.css";

type EntryBeat = "shards" | "flash" | "drop" | "done";

export default function GameEntryTransition() {
  const [beat, setBeat] = useState<EntryBeat>("shards");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const finish = window.setTimeout(() => setBeat("done"), 420);
      return () => window.clearTimeout(finish);
    }

    const flash = window.setTimeout(() => setBeat("flash"), 520);
    const drop = window.setTimeout(() => setBeat("drop"), 700);
    const finish = window.setTimeout(() => setBeat("done"), 1320);
    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(drop);
      window.clearTimeout(finish);
    };
  }, [reducedMotion]);

  if (beat === "done") return null;

  return (
    <div className={`game-entry-transition game-entry-${beat}${reducedMotion ? " reduced-motion" : ""}`} aria-hidden="true">
      <div className="game-entry-shards">
        {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ "--shard": index } as CSSProperties} />)}
      </div>
      <div className="game-entry-flash" />
      <div className="game-entry-drop" />
      <span className="game-entry-label">Entering the town</span>
    </div>
  );
}
