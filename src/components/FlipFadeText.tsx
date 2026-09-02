import { useCallback, useEffect, useMemo, useState, memo } from "react";
import { AnimatePresence, motion } from "motion/react";

interface FlipFadeTextProps {
  words: string[];
  interval?: number;
  className?: string;
  textClassName?: string;
  letterDuration?: number;
  staggerDelay?: number;
  exitStaggerDelay?: number;
}

const FlipLetter = memo(function FlipLetter({ char, duration }: { char: string; duration: number }) {
  return (
    <motion.span
      className="zaeb-flip-letter"
      initial={{ rotateX: 90, y: 18, opacity: 0, filter: "blur(6px)" }}
      animate={{ rotateX: 0, y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ rotateX: -90, y: -18, opacity: 0, filter: "blur(6px)" }}
      transition={{ duration, ease: [0.2, 0.65, 0.3, 0.9] }}
    >
      {char}
    </motion.span>
  );
});

export default function FlipFadeText({
  words,
  interval = 2800,
  className = "",
  textClassName = "",
  letterDuration = 0.42,
  staggerDelay = 0.06,
  exitStaggerDelay = 0.03,
}: FlipFadeTextProps) {
  const [index, setIndex] = useState(0);
  const updateIndex = useCallback(() => setIndex((current) => (current + 1) % words.length), [words.length]);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = window.setInterval(updateIndex, interval);
    return () => window.clearInterval(timer);
  }, [interval, updateIndex, words.length]);

  const currentText = useMemo(() => words[index] ?? words[0] ?? "", [index, words]);
  const currentWords = useMemo(() => currentText.split(/\s+/).filter(Boolean), [currentText]);

  return (
    <span className={`zaeb-flip-fade ${className}`} style={{ perspective: "1000px" }} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentText}
          className={`zaeb-flip-word ${textClassName}`}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: {},
            animate: { transition: { staggerChildren: staggerDelay * 4 } },
            exit: { transition: { staggerChildren: exitStaggerDelay * 3 } },
          }}
        >
          {currentWords.map((word, wordIndex) => (
            <motion.span
              key={`${currentText}-${word}-${wordIndex}`}
              className="zaeb-flip-word-unit"
              variants={{
                initial: { opacity: 0, y: 16, rotateX: 45, filter: "blur(5px)" },
                animate: { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" },
                exit: { opacity: 0, y: -16, rotateX: -45, filter: "blur(5px)" },
              }}
              transition={{ duration: 0.36, ease: [0.2, 0.65, 0.3, 0.9] }}
            >
              {word.split("").map((char, letterIndex) => (
                <FlipLetter key={`${word}-${letterIndex}`} char={char} duration={letterDuration} />
              ))}
              {wordIndex < currentWords.length - 1 ? "\u00a0" : ""}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
