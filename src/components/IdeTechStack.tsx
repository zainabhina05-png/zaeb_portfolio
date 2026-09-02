import { useState, useRef, useEffect, type FocusEvent as ReactFocusEvent, type MouseEvent as ReactMouseEvent } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, FileCode, Folder, Terminal, GitBranch, PanelLeftClose, PanelLeftOpen, Layers, Code2 } from "lucide-react";
import { IDE_FOLDERS, INITIAL_FILE, type StackFile } from "../data/ideStack";
import ImageRevealList, { type ImageRevealListItem } from "./ImageRevealList";
import CategorizedStackGrid from "./CategorizedStackGrid";
import "./ide-panel.css";

// ── Syntax highlighter ───────────────────────────────────────────────────────
function highlightCode(code: string) {
  const lines = code.split("\n");

  return lines.map((line, lineIndex) => {
    // Full-line comment
    if (/^\s*(\/\/|#|--|\/\*)/.test(line)) {
      return (
        <div key={lineIndex} className="ide-code-line">
          <span className="ide-line-num">{lineIndex + 1}</span>
          <span className="ide-token-comment">{line}</span>
        </div>
      );
    }

    const tokenRegex = /("""[\s\S]*?"""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b(?:import|export|from|default|const|let|var|function|return|async|await|interface|type|if|else|for|while|new|class|extends|implements|typeof|instanceof|void|this|super|throw|try|catch|finally|model|datasource|generator|services|build|ports|depends_on|image|environment|name|on|jobs|steps|uses|run|runs-on|auto|int|float|bool|true|false|null|undefined|nullptr|public|private|void|enum|struct|include|namespace|template)\b|[{}()[\];,.<>:=+\-*/&|!@#]+|[a-zA-Z_$][a-zA-Z0-9_$]*|\d+\.?\d*|\s+)/g;
    const tokens = line.match(tokenRegex) || [line];

    const KEYWORDS = new Set([
      "import","export","from","default","const","let","var","function","return",
      "async","await","interface","type","if","else","for","while","new","class",
      "extends","implements","typeof","instanceof","void","this","super","throw",
      "try","catch","finally","model","datasource","generator","services","build",
      "ports","depends_on","image","environment","name","on","jobs","steps","uses",
      "run","runs-on","auto","int","float","bool","true","false","null","undefined",
      "nullptr","public","private","enum","struct","include","namespace","template",
    ]);

    const TYPES = new Set([
      "ProjectCardProps","NextConfig","THREE","Scene","PerspectiveCamera","WebGLRenderer",
      "Router","Project","User","DateTime","UUID","TEXT","TIMESTAMPTZ","Player",
      "PhysicsWorld","Vector2f","MongoClient","String","Boolean","Number","Date",
      "Promise","Array","Map","Set","Error","Request","Response","NextRequest",
    ]);

    return (
      <div key={lineIndex} className="ide-code-line">
        <span className="ide-line-num">{lineIndex + 1}</span>
        <span className="ide-line-content">
          {tokens.map((tok, tokIndex) => {
            if (/^("""[\s\S]*?"""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)$/.test(tok))
              return <span key={tokIndex} className="ide-token-string">{tok}</span>;
            if (KEYWORDS.has(tok))
              return <span key={tokIndex} className="ide-token-keyword">{tok}</span>;
            if (TYPES.has(tok))
              return <span key={tokIndex} className="ide-token-type">{tok}</span>;
            if (/^[{}()[\];,.<>:=+\-*/&|!@#]+$/.test(tok))
              return <span key={tokIndex} className="ide-token-punct">{tok}</span>;
            if (/^\d+\.?\d*$/.test(tok))
              return <span key={tokIndex} className="ide-token-string">{tok}</span>;
            if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(tok)) {
              const nextNonSpace = tokens.slice(tokIndex + 1).find((t) => t.trim().length > 0);
              if (nextNonSpace?.startsWith("("))
                return <span key={tokIndex} className="ide-token-func">{tok}</span>;
              return <span key={tokIndex} className="ide-token-var">{tok}</span>;
            }
            return <span key={tokIndex}>{tok}</span>;
          })}
        </span>
      </div>
    );
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
const PINNED_IDS = ["readme-md", "react-tsx", "server-route", "schema-prisma", "player-controller", "docker-compose", "ci-pipeline"];

type PreviewTool = { name: string; icon: string; color: string };

const PREVIEW_BY_FILE: Record<string, { label: string; tools: PreviewTool[] }> = {
  "readme-md": {
    label: "CORE STACK / README",
    tools: [
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/F8F8F2", color: "#F8F8F2" },
      { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB", color: "#61DAFB" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6", color: "#3178C6" },
      { name: "Tailwind", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4", color: "#06B6D4" },
      { name: "Three.js", icon: "https://cdn.simpleicons.org/threedotjs/F8F8F2", color: "#F8F8F2" },
      { name: "GSAP", icon: "https://cdn.simpleicons.org/greensock/88CE02", color: "#88CE02" },
    ],
  },
  "react-tsx": {
    label: "FRONTEND / REACT",
    tools: [
      { name: "React", icon: "https://cdn.simpleicons.org/react/61DAFB", color: "#61DAFB" },
      { name: "Next.js", icon: "https://cdn.simpleicons.org/nextdotjs/F8F8F2", color: "#F8F8F2" },
      { name: "TypeScript", icon: "https://cdn.simpleicons.org/typescript/3178C6", color: "#3178C6" },
      { name: "Vite", icon: "https://cdn.simpleicons.org/vite/BD93F9", color: "#BD93F9" },
    ],
  },
  "tailwind-css": {
    label: "STYLING / UI",
    tools: [
      { name: "Tailwind", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4", color: "#06B6D4" },
      { name: "CSS", icon: "https://cdn.simpleicons.org/css3/1572B6", color: "#1572B6" },
      { name: "SCSS", icon: "https://cdn.simpleicons.org/sass/CC6699", color: "#CC6699" },
    ],
  },
  "three-module": {
    label: "3D / MOTION",
    tools: [
      { name: "Three.js", icon: "https://cdn.simpleicons.org/threedotjs/F8F8F2", color: "#F8F8F2" },
      { name: "GSAP", icon: "https://cdn.simpleicons.org/greensock/88CE02", color: "#88CE02" },
      { name: "WebGL", icon: "https://cdn.simpleicons.org/webgl/990000", color: "#990000" },
    ],
  },
  "server-route": {
    label: "BACKEND / API",
    tools: [
      { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/83CD29", color: "#83CD29" },
      { name: "Express", icon: "https://cdn.simpleicons.org/express/F8F8F2", color: "#F8F8F2" },
      { name: "JWT", icon: "https://cdn.simpleicons.org/jsonwebtokens/F92672", color: "#F92672" },
    ],
  },
  "schema-prisma": {
    label: "DATA / ORM",
    tools: [
      { name: "Prisma", icon: "https://cdn.simpleicons.org/prisma/F8F8F2", color: "#F8F8F2" },
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1", color: "#4169E1" },
      { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/47A248", color: "#47A248" },
    ],
  },
  "player-controller": {
    label: "GAME DEV / C++",
    tools: [
      { name: "C++", icon: "https://cdn.simpleicons.org/cplusplus/00599C", color: "#00599C" },
      { name: "C#", icon: "https://cdn.simpleicons.org/csharp/239120", color: "#239120" },
      { name: "SFML", icon: "https://cdn.simpleicons.org/sfml/8CC445", color: "#8CC445" },
    ],
  },
  "docker-compose": {
    label: "DEVOPS / CONTAINERS",
    tools: [
      { name: "Docker", icon: "https://cdn.simpleicons.org/docker/2496ED", color: "#2496ED" },
      { name: "Redis", icon: "https://cdn.simpleicons.org/redis/DC382D", color: "#DC382D" },
      { name: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql/4169E1", color: "#4169E1" },
    ],
  },
  "ci-pipeline": {
    label: "CI / DELIVERY",
    tools: [
      { name: "GitHub Actions", icon: "https://cdn.simpleicons.org/githubactions/2088FF", color: "#2088FF" },
      { name: "Jest", icon: "https://cdn.simpleicons.org/jest/C21325", color: "#C21325" },
      { name: "Vercel", icon: "https://cdn.simpleicons.org/vercel/F8F8F2", color: "#F8F8F2" },
    ],
  },
};

export default function IdeTechStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFile, setActiveFile] = useState<StackFile>(INITIAL_FILE);
  const [prevFile,   setPrevFile]   = useState<StackFile | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(IDE_FOLDERS.map((f) => [f.id, true]))
  );
  const [switching, setSwitching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredPreview, setHoveredPreview] = useState<{ fileId: string; top: number } | null>(null);
  const [readmeViewMode, setReadmeViewMode] = useState<"matrix" | "raw">("matrix");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll curtain reveal
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "start 0.35"] });
  const clipPath = useTransform(scrollYProgress, [0, 1], ["inset(0 50% 0 50%)", "inset(0 0% 0 0%)"]);
  const scale    = useTransform(scrollYProgress, [0, 1], [1.03, 1]);

  const toggleFolder = (id: string) =>
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSelectFile = (file: StackFile) => {
    if (file.id === activeFile.id) return;
    setPrevFile(activeFile);
    setSwitching(true);
    setTimeout(() => {
      setActiveFile(file);
      setSwitching(false);
      setPrevFile(null);
    }, 180);
  };

  const handleSelectFileById = (fileId: string) => {
    const file = allFiles.find((f) => f.id === fileId);
    if (file) handleSelectFile(file);
  };

  const handlePreviewEnter = (event: ReactMouseEvent<HTMLButtonElement> | ReactFocusEvent<HTMLButtonElement>, fileId: string) => {
    const panel = containerRef.current?.querySelector<HTMLElement>(".ide-panel");
    if (!panel) return;
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const rawTop = buttonRect.top - panelRect.top + buttonRect.height / 2;
    const previewHeight = 132;
    const top = Math.max(12, Math.min(panelRect.height - previewHeight - 12, rawTop));
    setHoveredPreview({ fileId, top });
  };

  const allFiles = IDE_FOLDERS.flatMap((f) => f.files);
  const imageRevealItems: ImageRevealListItem[] = allFiles.map((file, index) => {
    const preview = PREVIEW_BY_FILE[file.id];
    return {
      id: file.id,
      title: file.name,
      subtitle: file.folder,
      number: String(index + 1).padStart(2, "0"),
      image: preview?.tools[0]?.icon || "/about-bg/metallic-z-glow.jpg",
      href: `#ide-file-${file.id}`,
    };
  });
  const pinnedTabs = allFiles.filter((f) => PINNED_IDS.includes(f.id) || f.id === activeFile.id)
                             .slice(0, 7); // cap at 7 tabs

  return (
    <div ref={containerRef} className="ide-panel-mask">
      <motion.div style={{ clipPath, scale }} className={`ide-panel${sidebarOpen ? " is-sidebar-open" : " is-sidebar-collapsed"}`}>

        {/* ── Top Bar ── */}
        <div className="ide-top-bar">
          <div className="ide-traffic-lights" aria-hidden="true">
            <span className="ide-dot ide-dot-red"   />
            <span className="ide-dot ide-dot-amber" />
            <span className="ide-dot ide-dot-green" />
          </div>

          <div className="ide-tabs-scroll">
            {pinnedTabs.map((file) => {
              const isActive = file.id === activeFile.id;
              return (
                <button
                  type="button"
                  key={file.id}
                  className={`ide-tab${isActive ? " is-active" : ""}`}
                  onClick={() => handleSelectFile(file)}
                >
                  <FileCode size={13} className="ide-tab-icon" />
                  <span>{file.name}</span>
                  {isActive && (
                    <motion.div layoutId="ide-active-tab-indicator" className="ide-tab-indicator" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="ide-sidebar-toggle"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Collapse file tree" : "Expand file tree"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            <span>{sidebarOpen ? "HIDE TREE" : "SHOW TREE"}</span>
          </button>

          <div className="ide-top-meta">
            <GitBranch size={11} className="ide-top-branch-icon" />
            <span>main</span>
          </div>
        </div>

        {/* ── Breadcrumb bar ── */}
        <div className="ide-breadcrumb" aria-label="File path">
          <span className="ide-bc-segment ide-bc-root">zaeb-portfolio</span>
          <span className="ide-bc-sep">/</span>
          <span className="ide-bc-segment ide-bc-folder">{activeFile.folder}</span>
          <span className="ide-bc-sep">/</span>
          <span className="ide-bc-segment ide-bc-file">{activeFile.name}</span>

          {activeFile.id === "readme-md" && (
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReadmeViewMode("matrix")}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  readmeViewMode === "matrix"
                    ? "bg-[#e0455f] text-white"
                    : "text-[#dac6bd] hover:text-white"
                }`}
              >
                <Layers size={11} />
                <span>3D MATRIX</span>
              </button>
              <button
                type="button"
                onClick={() => setReadmeViewMode("raw")}
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                  readmeViewMode === "raw"
                    ? "bg-[#e0455f] text-white"
                    : "text-[#dac6bd] hover:text-white"
                }`}
              >
                <Code2 size={11} />
                <span>SOURCE</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile chip row ── */}
        {isMobile && (
          <div className="ide-mobile-chips">
            {IDE_FOLDERS.flatMap((folder) =>
              folder.files.map((file) => {
                const isActive = file.id === activeFile.id;
                return (
                  <button
                    type="button"
                    key={file.id}
                    className={`ide-mobile-chip${isActive ? " is-active" : ""}`}
                    onClick={() => handleSelectFile(file)}
                  >
                    <span className="ide-chip-folder">{folder.name}/</span>
                    <span className="ide-chip-name">{file.name}</span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ── Body: Sidebar + Editor ── */}
        <div className="ide-body">

          {/* Desktop file tree with Image Hover Previews intact */}
          {sidebarOpen && (
            <aside className="ide-sidebar" aria-label="Project explorer">
              <div className="ide-sidebar-header">EXPLORER // TECH_STACK</div>
              <div className="ide-file-tree">
                {IDE_FOLDERS.map((folder) => {
                  const isOpen = openFolders[folder.id] ?? true;
                  return (
                    <div key={folder.id} className="ide-tree-folder">
                      <button
                        type="button"
                        className="ide-folder-btn"
                        onClick={() => toggleFolder(folder.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <Folder size={13} className="ide-folder-icon" />
                        <span>{folder.name}</span>
                        <span className="ide-folder-count">{folder.files.length}</span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            className="ide-tree-files"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          >
                            {folder.files.map((file) => {
                              const isActive = file.id === activeFile.id;
                              return (
                                <button
                                  type="button"
                                  key={file.id}
                                  className={`ide-file-btn${isActive ? " is-active" : ""}`}
                                  onClick={() => handleSelectFile(file)}
                                  onMouseEnter={(event) => PREVIEW_BY_FILE[file.id] && handlePreviewEnter(event, file.id)}
                                  onMouseLeave={() => setHoveredPreview(null)}
                                  onFocus={(event) => PREVIEW_BY_FILE[file.id] && handlePreviewEnter(event, file.id)}
                                  onBlur={() => setHoveredPreview(null)}
                                >
                                  <FileCode size={12} className="ide-file-icon" />
                                  <span>{file.name}</span>
                                  {isActive && <span className="ide-file-active-cursor" aria-hidden="true" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Keep Image Reveal List for interactive visual exploration */}
              <div className="ide-image-reveal-browser">
                <div className="ide-sidebar-header">IMAGE REVEAL // FILE PREVIEWS</div>
                <ImageRevealList items={imageRevealItems} className="ide-image-reveal-list" />
              </div>
            </aside>
          )}

          {/* Code editor pane / 3D Isometric Matrix */}
          <main className="ide-editor-container">

            {/* File intro description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFile.id + "-intro"}
                className="ide-file-intro"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.22 }}
              >
                <span className="ide-intro-tag">// {activeFile.intro}</span>
              </motion.div>
            </AnimatePresence>

            {/* Viewport: Either Categorized 3D Glow Blocks or Code Lines */}
            <div className={`ide-code-viewport${switching ? " is-switching" : ""}${activeFile.id === "readme-md" ? " ide-readme-mode" : ""}`}>
              <AnimatePresence mode="wait">
                {activeFile.id === "readme-md" && readmeViewMode === "matrix" ? (
                  <motion.div
                    key="readme-matrix"
                    className="w-full h-full min-h-[520px] flex flex-col"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <CategorizedStackGrid onSelectFile={handleSelectFileById} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeFile.id}
                    className="ide-code-lines"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {highlightCode(activeFile.code)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Terminal bar */}
            <div className="ide-terminal-bar">
              <div className="ide-terminal-prompt">
                <Terminal size={12} className="ide-term-icon" />
                <span className="ide-term-user">zaeb@dev</span>
                <span className="ide-term-path">~/{activeFile.folder}</span>
                <span className="ide-term-branch">(main)</span>
                <span className="ide-term-symbol">%</span>
                <span className="ide-term-cmd">open {activeFile.name}</span>
              </div>
              <div className="ide-terminal-status">
                <span>UTF-8</span>
                <span>{activeFile.language.toUpperCase()}</span>
                <span>SPACES: 2</span>
              </div>
            </div>
          </main>
        </div>

        {/* Floating image preview on file hover (Intact) */}
        <AnimatePresence>
          {hoveredPreview && PREVIEW_BY_FILE[hoveredPreview.fileId] && (
            <motion.div
              className="ide-hover-preview-floating"
              style={{ top: hoveredPreview.top }}
              initial={{ opacity: 0, x: -12, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            >
              <span className="ide-image-reveal-label">{PREVIEW_BY_FILE[hoveredPreview.fileId].label}</span>
              <span className="ide-image-reveal-tools">
                {PREVIEW_BY_FILE[hoveredPreview.fileId].tools.map((tool) => (
                  <span className="ide-image-reveal-tool" key={tool.name} style={{ color: tool.color }}>
                    <span className="ide-tool-glyph" style={{ backgroundColor: tool.color }}>{tool.name.slice(0, 1)}</span>
                    <img src={tool.icon} alt="" loading="eager" decoding="async" referrerPolicy="no-referrer" />
                    <span>{tool.name}</span>
                  </span>
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
