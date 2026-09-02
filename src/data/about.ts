export type AboutCell = {
  id: string;
  title: string;
  summary: string;
  expanded: string;
  layout: "about" | "frontend" | "backend" | "languages" | "testing" | "game" | "tools";
  tags: string[];
};

export const ZAEB_ABOUT = {
  name: "Zainab",
  heading: "ABOUT ME",
  role: "Full-stack developer building for the browser and beyond.",
  shortBio:
    "I'm Zainab — a front-end and MERN stack developer from Faisalabad, Pakistan, building production web apps and 3D interactive experiences that react to the people using them.",
  longBio:
    "Open-source contributor, community builder, systems thinker with a game-dev streak. I work across interfaces, APIs, data, motion, and interactive 3D so the product feels coherent from the first gesture to the system underneath.",
  markers: ["FAISALABAD, PAKISTAN", "MERN + NEXT.JS", "3D INTERACTIVE EXPERIENCES", "OPEN SOURCE"],
};

export const ZAEB_ABOUT_CELLS: AboutCell[] = [
  {
    id: "about",
    title: "ABOUT ME",
    summary: "I build interfaces that don't sit still.\nFull-stack products. 3D-driven experiences.\nSystems that hold both together.",
    expanded:
      "I build production web apps and 3D interactive experiences that react to the people using them — with a systems mindset that carries from interaction design through the full stack.",
    layout: "about",
    tags: ["FRONT-END", "MERN", "3D EXPERIENCES"],
  },
  {
    id: "frontend",
    title: "FRONTEND & 3D",
    summary: "HTML5 · React · Next.js · Three.js · GSAP",
    expanded:
      "HTML5, CSS3, SCSS, Bootstrap, React, React Router, Vite, Next.js, Tailwind CSS, jQuery, Three.js, React Three Fiber, and GSAP.",
    layout: "frontend",
    tags: ["REACT", "NEXT.JS", "R3F", "GSAP"],
  },
  {
    id: "backend",
    title: "BACKEND",
    summary: "Node.js · Express · Python · REST APIs",
    expanded:
      "Node.js, Express.js, Python, REST APIs, JWT, and Webhooks — from the first request to the service boundary.",
    layout: "backend",
    tags: ["NODE", "EXPRESS", "PYTHON", "REST"],
  },
  {
    id: "languages",
    title: "LANGUAGES & FUNDAMENTALS",
    summary: "C · C++ · Python · JavaScript · TypeScript",
    expanded:
      "C, C++, Python, JavaScript, TypeScript, data structures and algorithms, and object-oriented programming.",
    layout: "languages",
    tags: ["C++", "PYTHON", "JS", "TS"],
  },
  {
    id: "testing",
    title: "DATABASE & TESTING",
    summary: "MongoDB · MySQL · Supabase · Jest · Postman",
    expanded:
      "MongoDB, MongoDB Atlas, Snowflake, MySQL, Neon, Supabase, Jest, Supertest, Postman, Winston, and Morgan.",
    layout: "testing",
    tags: ["MONGO", "MYSQL", "JEST", "POSTMAN"],
  },
  {
    id: "game",
    title: "GAME DEV",
    summary: "C++ · C# · SFML",
    expanded:
      "C++, C#, and SFML are the roots underneath the interactive game systems and browser-native experiments I am building toward.",
    layout: "game",
    tags: ["C++", "C#", "SFML", "SYSTEMS"],
  },
  {
    id: "tools",
    title: "TOOLS & PRACTICES",
    summary: "Git · GitHub · VS Code · Docker · CI/CD",
    expanded:
      "Git, GitHub, VS Code, Docker, Vercel, Agile/Scrum, and CI/CD practices that keep experiments shippable.",
    layout: "tools",
    tags: ["GIT", "DOCKER", "VERCEL", "CI/CD"],
  },
];
