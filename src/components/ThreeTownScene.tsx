import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Compass, Sparkles, Volume2, VolumeX, Maximize2, Zap, ArrowRight, Layers, ShieldCheck, Mail, Cpu, Award, X, ExternalLink, Github, Send, Terminal, UserCheck } from "lucide-react";
import { PROJECT_PLACEHOLDERS } from "../data/projects";
import { EXPERIENCE_PLACEHOLDERS, LEADERSHIP_PLACEHOLDERS } from "../data/experience";
import { SKILL_CATEGORIES } from "../data";
import { EDUCATION_PLACEHOLDERS } from "../data/education";

interface ThreeTownSceneProps {
  paused?: boolean;
  teleportLandmark?: string | null;
  onLandmarkSelect: (landmarkId: string) => void;
  onExploreProgress?: (visitedCount: number, totalCount: number) => void;
  onSwitchToScrollMode?: () => void;
  /** Called whenever the player rides over a glowing XP orb. Optional â€” purely visual if omitted. */
  onCollectGem?: (amount: number) => void;
}

export interface LandmarkInfo {
  id: string;
  name: string;
  title: string;
  buildingName: string;
  description: string;
  position: [number, number, number];
  color: string;
  icon: string;
}

export const LANDMARKS: LandmarkInfo[] = [
  {
    id: "about",
    name: "About",
    title: "Cybernetic Library & Bio Hub",
    buildingName: "ABOUT_ARCHIVES",
    description: "Zainab's background, system engineering philosophy, & interests.",
    position: [-11, 0, -10],
    color: "#6b2126",
    icon: "UserCheck"
  },
  {
    id: "education",
    name: "Education",
    title: "Academy Citadel & Research",
    buildingName: "ACADEMY_CITADEL",
    description: "BS Computer Science, data structures & algorithms roadmap.",
    position: [0, 0, -13],
    color: "#581e14",
    icon: "Award"
  },
  {
    id: "experience",
    name: "Experience",
    title: "Operations Command Center",
    buildingName: "COMMAND_CENTER",
    description: "MERN stack developer, frontend engineering, & C++ systems.",
    position: [11, 0, -10],
    color: "#b8925a",
    icon: "ShieldCheck"
  },
  {
    id: "skills",
    name: "Skills",
    title: "Technical Stack Forge",
    buildingName: "STACK_FORGE_04",
    description: "Graphics engines, full-stack tools, & AI workflows.",
    position: [-12, 0, 4],
    color: "#a8938c",
    icon: "Layers"
  },
  {
    id: "projects",
    name: "Projects",
    title: "Systems Lab & Engine Foundry",
    buildingName: "SYSTEMS_ENGINE_LAB",
    description: "15+ shipped C++, WebGL, and MERN software systems.",
    position: [12, 0, 4],
    color: "#e8ddd3",
    icon: "Cpu"
  },
  {
    id: "leadership",
    name: "Leadership",
    title: "Town Hall & Strategy HQ",
    buildingName: "LEADERSHIP_HQ",
    description: "Team leadership, system architecture oversight, & mentoring.",
    position: [-8, 0, 12],
    color: "#4a1226",
    icon: "Zap"
  },
  {
    id: "bookstall",
    name: "Bookstall",
    title: "Brass Bookstall & Field Archive",
    buildingName: "ZAEB_BOOKSTALL",
    description: "Dismount for education, experience, project, certification, and contact field books.",
    position: [0, 0, 14],
    color: "#b8925a",
    icon: "BookOpen"
  },
  {
    id: "contact",
    name: "Contact",
    title: "Terminal Gate & Comms Spire",
    buildingName: "COMMS_SPIRE",
    description: "Direct connection, email transmission, & availability.",
    position: [8, 0, 12],
    color: "#c8b4b8",
    icon: "Mail"
  }
];

// World-space spots where glowing XP orbs float along the roads.
const ORB_POSITIONS: [number, number][] = [
  [-5.5, -5], [5.5, -5], [-6, 3], [6, 3],
  [-4, 7], [4, 7], [0, -6.5], [0, 6.5]
];

// Fusion pairs: riding between these two landmarks quickly awards a bonus badge
// tied to a real cross-discipline skill (not generic RPG flavor).
const FUSION_PAIRS: { a: string; b: string; badgeName: string; windowSeconds: number }[] = [
  { a: "skills", b: "projects", badgeName: "Full-Stack Engine Architect", windowSeconds: 15 }
];

export default function ThreeTownScene({
  teleportLandmark,
  onLandmarkSelect,
  onExploreProgress,
  onSwitchToScrollMode,
  onCollectGem
,
  paused = false
}: ThreeTownSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [nearbyLandmark, setNearbyLandmark] = useState<LandmarkInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeHud, setActiveHud] = useState<LandmarkInfo | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // Boost + juice + minimap state
  const [boostActive, setBoostActive] = useState(false);
  const [xpToast, setXpToast] = useState<{ id: number; text: string } | null>(null);
  const [fusionToast, setFusionToast] = useState<{ id: number; text: string } | null>(null);
  const [miniMapPos, setMiniMapPos] = useState({ x: 0, z: 0, heading: 0 });

  // Cross-component teleport request: minimap click -> animation loop reads this
  const teleportRequestRef = useRef<{ x: number; z: number } | null>(null);

  // Sound generator
  const playBeep = (freqs: number[], gain: number = 0.04) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.06);
        gain2.gain.setValueAtTime(gain, audioCtx.currentTime + idx * 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.06 + 0.12);
        osc.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.06);
        osc.stop(audioCtx.currentTime + idx * 0.06 + 0.14);
      });
    } catch (e) {
      // Audio fallback
    }
  };

  // Teleport or Select landmark directly
  const handleSelectLandmark = (landmark: LandmarkInfo) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(landmark.id);
      if (onExploreProgress) onExploreProgress(next.size, LANDMARKS.length);
      return next;
    });
    playBeep([600, 900]);
    setActiveHud(landmark);
    onLandmarkSelect(landmark.id);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#130a0c");
    scene.fog = new THREE.FogExp2("#130a0c", 0.028);

    const baseFov = 58; // wider FOV suits a low chase camera, racing-game style
    const camera = new THREE.PerspectiveCamera(baseFov, width / height, 0.1, 1000);
    camera.position.set(0, 2.8, -5.2);
    camera.lookAt(0, 1, 5);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight("#2e1016", 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight("#e8e8e3", 1.8);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    // Warm Ember accent point light at town center
    const centerPointLight = new THREE.PointLight("#b8925a", 3.5, 22);
    centerPointLight.position.set(0, 2.5, 0);
    scene.add(centerPointLight);

    // Distant stars for ambiance (static, high above the town)
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = Math.random() * 40 + 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: "#e8e8e3",
      size: 0.18,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // 4. TOWN GROUND & PAVEMENT
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#1d0a0e",
      roughness: 0.85,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid pavement lines
    const gridHelper = new THREE.GridHelper(36, 18, "#2e1016", "rgba(184,146,906,0.08)");
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Central circular plaza
    const plazaGeo = new THREE.CylinderGeometry(4, 4, 0.1, 32);
    const plazaMat = new THREE.MeshStandardMaterial({ color: "#2e1016", roughness: 0.5 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.05, 0);
    plaza.receiveShadow = true;
    scene.add(plaza);

    const ringGeo = new THREE.RingGeometry(3.8, 4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#b8925a", side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.11, 0);
    scene.add(ring);

    // Connecting stone pathways
    const pathMat = new THREE.MeshStandardMaterial({ color: "#2e1016", roughness: 0.7 });
    LANDMARKS.forEach((lm) => {
      const dx = lm.position[0];
      const dz = lm.position[2];
      const distance = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);

      const pathGeo = new THREE.PlaneGeometry(1.6, distance);
      const pathMesh = new THREE.Mesh(pathGeo, pathMat);
      pathMesh.rotation.x = -Math.PI / 2;
      pathMesh.rotation.z = -angle;
      pathMesh.position.set(dx / 2, 0.02, dz / 2);
      pathMesh.receiveShadow = true;
      scene.add(pathMesh);
    });

    // 5. BUILDINGS / LANDMARKS & FLOATING CRYSTALS
    const landmarkMeshes: THREE.Group[] = [];
    const floatingGems: THREE.Mesh[] = [];
    const beaconRings: THREE.Mesh[] = [];
    // Parallel arrays (same order as LANDMARKS) for proximity-reactive glow
    const landmarkLights: THREE.PointLight[] = [];
    const landmarkWindowMats: THREE.MeshStandardMaterial[] = [];

    LANDMARKS.forEach((lm) => {
      const group = new THREE.Group();
      group.position.set(...lm.position);

      const colorHex = lm.color;

      // Base pedestal
      const baseGeo = new THREE.BoxGeometry(3.5, 0.4, 3.5);
      const baseMat = new THREE.MeshStandardMaterial({ color: "#2e1016", roughness: 0.4 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Main Building Structure
      const bldgGeo = new THREE.BoxGeometry(2.8, 3.2, 2.8);
      const bldgMat = new THREE.MeshStandardMaterial({ color: "#2b0b14", roughness: 0.3, metalness: 0.6 });
      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
      bldgMesh.position.y = 2;
      bldgMesh.castShadow = true;
      bldgMesh.receiveShadow = true;
      group.add(bldgMesh);

      // Glass Accent Windows
      const winGeo = new THREE.BoxGeometry(2.82, 1, 1.8);
      const winMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.y = 2.2;
      group.add(winMesh);
      landmarkWindowMats.push(winMat);

      // Top Roof Spire / Beacon
      const roofGeo = new THREE.ConeGeometry(1, 1.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: "#6b2126", roughness: 0.2 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = 4.35;
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.castShadow = true;
      group.add(roofMesh);

      // Floating Glow Ring (this spins, not the whole building)
      const beaconRingGeo = new THREE.TorusGeometry(1.6, 0.06, 16, 32);
      const beaconRingMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beaconRing.rotation.x = Math.PI / 2;
      beaconRing.position.y = 0.45;
      group.add(beaconRing);
      beaconRings.push(beaconRing);

      // Floating holographic crystal / obelisk gem on spire
      const gemGeo = new THREE.OctahedronGeometry(0.5, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.y = 5.6;
      group.add(gemMesh);
      floatingGems.push(gemMesh);

      // Point light for building glow (intensity reacts to player proximity)
      const bldgLight = new THREE.PointLight(colorHex, 2.5, 9);
      bldgLight.position.set(0, 3, 0);
      group.add(bldgLight);
      landmarkLights.push(bldgLight);

      scene.add(group);
      landmarkMeshes.push(group);
    });

    // 5B. ENVIRONMENT DECOR: CYBERNETIC TREES & LAMP POSTS
    const treePositions: [number, number][] = [
      [-5, -4], [5, -4], [-5, 4], [5, 4],
      [-14, -2], [14, -2], [-14, 8], [14, 8],
      [0, -8], [0, 8]
    ];

    treePositions.forEach(([x, z]) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 0, z);

      const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: "#6b2126", roughness: 0.8 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      treeGroup.add(trunk);

      const canopyGeo = new THREE.ConeGeometry(0.7, 1.8, 6);
      const canopyMat = new THREE.MeshStandardMaterial({ color: "#1e3a29", roughness: 0.6, metalness: 0.2 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.y = 1.9;
      canopy.castShadow = true;
      treeGroup.add(canopy);

      scene.add(treeGroup);
    });

    // Lamp Posts with glowing lights along paths
    const lampPositions: [number, number][] = [
      [-3.5, -3.5], [3.5, -3.5], [-3.5, 3.5], [3.5, 3.5]
    ];

    lampPositions.forEach(([x, z]) => {
      const postGroup = new THREE.Group();
      postGroup.position.set(x, 0, z);

      const postGeo = new THREE.CylinderGeometry(0.04, 0.06, 2.2, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: "#faf4f0", metalness: 0.8, roughness: 0.2 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 1.1;
      postGroup.add(post);

      const bulbGeo = new THREE.SphereGeometry(0.15, 12, 12);
      const bulbMat = new THREE.MeshBasicMaterial({ color: "#e8ddd3" });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 2.2;
      postGroup.add(bulb);

      const lampLight = new THREE.PointLight("#e8ddd3", 1.8, 6);
      lampLight.position.set(0, 2.2, 0);
      postGroup.add(lampLight);

      scene.add(postGroup);
    });

    // 5C. FLOATING XP ORBS SCATTERED ALONG THE ROADS
    const orbGroup = new THREE.Group();
    const orbs: { mesh: THREE.Mesh; collected: boolean; respawnAt: number }[] = [];

    ORB_POSITIONS.forEach(([x, z]) => {
      const orbGeo = new THREE.OctahedronGeometry(0.28, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: "#e8b876",
        emissive: "#e8b876",
        emissiveIntensity: 1.1,
        roughness: 0.15,
        metalness: 0.6,
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbMesh.position.set(x, 0.6, z);
      orbGroup.add(orbMesh);
      orbs.push({ mesh: orbMesh, collected: false, respawnAt: 0 });
    });
    scene.add(orbGroup);

    // 5D. PICKUP BURST RING (the "yummy" pop effect on orb collection)
    const burstGeo = new THREE.RingGeometry(0.1, 0.32, 24);
    const burstMat = new THREE.MeshBasicMaterial({ color: "#e8b876", transparent: true, opacity: 0, side: THREE.DoubleSide });
    const burstMesh = new THREE.Mesh(burstGeo, burstMat);
    burstMesh.rotation.x = Math.PI / 2;
    burstMesh.visible = false;
    scene.add(burstMesh);
    let burstLife = 0;

    // 6. CHARACTER (WHITE MAXI-SCOOTER WITH RIDER)
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0, 0);

    const whiteBodyMat = new THREE.MeshStandardMaterial({ color: "#e8e8e3", roughness: 0.2, metalness: 0.1 });
    const darkTrimMat = new THREE.MeshStandardMaterial({ color: "#0d0d0d", roughness: 0.6 });
    const tireRubberMat = new THREE.MeshStandardMaterial({ color: "#0d0d0d", roughness: 0.9 });
    const rimAlloyMat = new THREE.MeshStandardMaterial({ color: "#e8e8e3", roughness: 0.3, metalness: 0.8 });
    const windshieldMat = new THREE.MeshStandardMaterial({ color: "#130a0c", roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.9 });
    const headlightMat = new THREE.MeshBasicMaterial({ color: "#e8ddd3" });
    const exhaustMat = new THREE.MeshStandardMaterial({ color: "#4a4442", roughness: 0.4, metalness: 0.7 });

    const frontWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 24);
    const frontWheel = new THREE.Mesh(frontWheelGeo, tireRubberMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.32, 0.9);
    frontWheel.castShadow = true;
    characterGroup.add(frontWheel);

    const frontRimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.17, 16);
    const frontRim = new THREE.Mesh(frontRimGeo, rimAlloyMat);
    frontRim.rotation.z = Math.PI / 2;
    frontRim.position.set(0, 0.32, 0.9);
    characterGroup.add(frontRim);

    const rearWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.18, 24);
    const rearWheel = new THREE.Mesh(rearWheelGeo, tireRubberMat);
    rearWheel.rotation.z = Math.PI / 2;
    rearWheel.position.set(0, 0.32, -0.7);
    rearWheel.castShadow = true;
    characterGroup.add(rearWheel);

    const rearRimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.19, 16);
    const rearRim = new THREE.Mesh(rearRimGeo, rimAlloyMat);
    rearRim.rotation.z = Math.PI / 2;
    rearRim.position.set(0, 0.32, -0.7);
    characterGroup.add(rearRim);

    const deckGeo = new THREE.BoxGeometry(0.65, 0.25, 1.4);
    const deckMesh = new THREE.Mesh(deckGeo, darkTrimMat);
    deckMesh.position.set(0, 0.38, 0.0);
    characterGroup.add(deckMesh);

    const noseGeo = new THREE.ConeGeometry(0.5, 0.9, 16);
    const noseMesh = new THREE.Mesh(noseGeo, whiteBodyMat);
    noseMesh.rotation.x = -Math.PI / 3.5;
    noseMesh.position.set(0, 0.85, 0.85);
    noseMesh.castShadow = true;
    characterGroup.add(noseMesh);

    const lightBoxGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const lightBox = new THREE.Mesh(lightBoxGeo, headlightMat);
    lightBox.position.set(0, 0.72, 1.15);
    characterGroup.add(lightBox);

    const scooterSpotLight = new THREE.SpotLight("#e8ddd3", 4, 12, Math.PI / 6, 0.3);
    scooterSpotLight.position.set(0, 0.72, 1.15);
    scooterSpotLight.target.position.set(0, 0, 5);
    characterGroup.add(scooterSpotLight);
    characterGroup.add(scooterSpotLight.target);

    const shieldGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.6, 16, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const shieldMesh = new THREE.Mesh(shieldGeo, windshieldMat);
    shieldMesh.rotation.x = -Math.PI / 6;
    shieldMesh.position.set(0, 1.25, 0.65);
    characterGroup.add(shieldMesh);

    const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12);
    const handleMesh = new THREE.Mesh(handleGeo, darkTrimMat);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.position.set(0, 1.1, 0.55);
    characterGroup.add(handleMesh);

    [-0.35, 0.35].forEach((xPos) => {
      const mirrorGeo = new THREE.SphereGeometry(0.07, 12, 12);
      const mirror = new THREE.Mesh(mirrorGeo, darkTrimMat);
      mirror.position.set(xPos, 1.32, 0.52);
      characterGroup.add(mirror);
    });

    const rearBodyGeo = new THREE.BoxGeometry(0.68, 0.55, 1.1);
    const rearBody = new THREE.Mesh(rearBodyGeo, whiteBodyMat);
    rearBody.position.set(0, 0.7, -0.4);
    rearBody.castShadow = true;
    characterGroup.add(rearBody);

    const tailFinGeo = new THREE.ConeGeometry(0.35, 0.6, 3);
    const tailFin = new THREE.Mesh(tailFinGeo, whiteBodyMat);
    tailFin.rotation.x = Math.PI / 2.5;
    tailFin.position.set(0, 0.85, -0.9);
    characterGroup.add(tailFin);

    const seatGeo = new THREE.BoxGeometry(0.55, 0.2, 0.85);
    const seatMesh = new THREE.Mesh(seatGeo, darkTrimMat);
    seatMesh.position.set(0, 0.98, -0.3);
    characterGroup.add(seatMesh);

    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.7, 16);
    const exhaustMesh = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaustMesh.rotation.x = Math.PI / 2;
    exhaustMesh.position.set(0.38, 0.35, -0.55);
    characterGroup.add(exhaustMesh);

    const riderTorsoGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.65, 12);
    const riderTorsoMat = new THREE.MeshStandardMaterial({ color: "#1d0a0e", roughness: 0.5 });
    const riderTorso = new THREE.Mesh(riderTorsoGeo, riderTorsoMat);
    riderTorso.rotation.x = 0.2;
    riderTorso.position.set(0, 1.35, -0.15);
    riderTorso.castShadow = true;
    characterGroup.add(riderTorso);

    const riderHeadGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const riderHeadMat = new THREE.MeshStandardMaterial({ color: "#b8925a", roughness: 0.4 });
    const riderHead = new THREE.Mesh(riderHeadGeo, riderHeadMat);
    riderHead.position.set(0, 1.78, 0.0);
    riderHead.castShadow = true;
    characterGroup.add(riderHead);

    const riderHelmetGeo = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.6);
    const riderHelmetMat = new THREE.MeshStandardMaterial({ color: "#e8e8e3", roughness: 0.1, metalness: 0.5 });
    const riderHelmet = new THREE.Mesh(riderHelmetGeo, riderHelmetMat);
    riderHelmet.position.set(0, 1.8, 0.0);
    characterGroup.add(riderHelmet);

    const targetRingGeo = new THREE.RingGeometry(0.3, 0.6, 24);
    const targetRingMat = new THREE.MeshBasicMaterial({ color: "#b8925a", side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const targetMarker = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetMarker.rotation.x = Math.PI / 2;
    targetMarker.position.y = 0.02;
    scene.add(targetMarker);

    scene.add(characterGroup);

    // 7. AMBIENT PARTICLES (Floating Light Specks)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 32;
      positions[i + 1] = Math.random() * 8 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 32;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: "#b8925a",
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7B. EXHAUST DUST TRAIL POOL
    const dustPoolSize = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustPoolSize * 3);
    const dustLife = new Float32Array(dustPoolSize).fill(0);
    const dustVelocity: THREE.Vector3[] = Array.from({ length: dustPoolSize }, () => new THREE.Vector3());
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: "#c8b4b8",
      size: 0.22,
      transparent: true,
      opacity: 0.5,
      blending: THREE.NormalBlending,
    });
    const dustSystem = new THREE.Points(dustGeo, dustMat);
    scene.add(dustSystem);
    let dustCursor = 0;

    // 8. MOVEMENT & CONTROLS ENGINE
    const keysPressed: Record<string, boolean> = {};
    let targetPos = new THREE.Vector3(0, 0, 0);
    let isMovingToTarget = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;
      isMovingToTarget = false;
      targetMarker.material.opacity = 0;
      if (e.key === "Shift") setBoostActive(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
      if (e.key === "Shift") setBoostActive(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ground);
      if (intersects.length > 0) {
        targetPos.copy(intersects[0].point);
        targetPos.y = 0;
        targetPos.x = Math.max(-15, Math.min(15, targetPos.x));
        targetPos.z = Math.max(-15, Math.min(15, targetPos.z));
        isMovingToTarget = true;
        targetMarker.position.set(targetPos.x, 0.02, targetPos.z);
        targetMarker.material.opacity = 0.8;
      }
    };
    renderer.domElement.addEventListener("click", handleCanvasClick);

    // 9. ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameTick = 0;

    // Juice-system closure state
    let comboCounter = 0;
    let lastPickupTime = -999;
    let bouncePunch = 0;
    let lastActiveTime = 0;
    // Fusion tracking: last time each landmark id was visited
    const lastVisitTime: Record<string, number> = {};

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (pausedRef.current) {
        Object.keys(keysPressed).forEach((key) => { keysPressed[key] = false; });
        renderer.render(scene, camera);
        return;
      }
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();
      frameTick++;

      // Consume any minimap teleport request
      if (teleportRequestRef.current) {
        targetPos.set(teleportRequestRef.current.x, 0, teleportRequestRef.current.z);
        isMovingToTarget = true;
        targetMarker.position.set(targetPos.x, 0.02, targetPos.z);
        targetMarker.material.opacity = 0.8;
        teleportRequestRef.current = null;
      }

      // Rotate spires & animate floating gems (buildings themselves stay put)
      beaconRings.forEach((ringMesh, idx) => {
        ringMesh.rotation.z = time * 0.6 + idx;
      });
      floatingGems.forEach((gem, idx) => {
        gem.rotation.y = time * 1.2 + idx;
        gem.position.y = 5.6 + Math.sin(time * 2.5 + idx) * 0.25;
      });

      // Ambient particles drift upward
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const yIdx = i * 3 + 1;
        posAttr.array[yIdx] += delta * 0.4;
        if (posAttr.array[yIdx] > 9) posAttr.array[yIdx] = 0.5;
      }
      posAttr.needsUpdate = true;

      // XP orbs bob + respawn
      orbs.forEach((orb, idx) => {
        if (orb.collected) {
          if (time > orb.respawnAt) {
            orb.collected = false;
            orb.mesh.visible = true;
          }
        } else {
          orb.mesh.rotation.y = time * 1.6 + idx;
          orb.mesh.position.y = 0.6 + Math.sin(time * 2.2 + idx * 1.3) * 0.18;
        }
      });

      // Pickup burst ring decay
      if (burstLife > 0) {
        burstLife -= delta * 2;
        const scale = 1 + (1 - burstLife) * 3;
        burstMesh.scale.set(scale, scale, scale);
        burstMat.opacity = Math.max(0, burstLife * 0.9);
        if (burstLife <= 0) burstMesh.visible = false;
      }

      // Boost / speed
      const boosting = keysPressed["shift"];
      const speedMultiplier = boosting ? 1.85 : 1;
      const moveSpeed = 8.0 * delta * speedMultiplier;
      const moveVec = new THREE.Vector3();

      if (keysPressed["w"] || keysPressed["arrowup"]) moveVec.z -= 1;
      if (keysPressed["s"] || keysPressed["arrowdown"]) moveVec.z += 1;
      if (keysPressed["a"] || keysPressed["arrowleft"]) moveVec.x -= 1;
      if (keysPressed["d"] || keysPressed["arrowright"]) moveVec.x += 1;

      let isCurrentMoving = false;
      let targetHeadingAngle = characterGroup.rotation.y;

      if (moveVec.lengthSq() > 0) {
        moveVec.normalize().multiplyScalar(moveSpeed);
        characterGroup.position.add(moveVec);
        targetHeadingAngle = Math.atan2(moveVec.x, moveVec.z);
        isCurrentMoving = true;
      } else if (isMovingToTarget) {
        const dist = characterGroup.position.distanceTo(targetPos);
        if (dist > 0.3) {
          const dir = new THREE.Vector3().subVectors(targetPos, characterGroup.position).normalize();
          characterGroup.position.addScaledVector(dir, moveSpeed);
          targetHeadingAngle = Math.atan2(dir.x, dir.z);
          isCurrentMoving = true;
          const pulseScale = 1 + Math.sin(time * 10) * 0.15;
          targetMarker.scale.set(pulseScale, pulseScale, pulseScale);
        } else {
          isMovingToTarget = false;
          targetMarker.material.opacity = 0;
        }
      }

      if (isCurrentMoving) {
        lastActiveTime = time;

        let diff = targetHeadingAngle - characterGroup.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        characterGroup.rotation.y += diff * Math.min(1, delta * 12);

        const wheelRollSpeed = moveSpeed * 3.5;
        frontWheel.rotation.x += wheelRollSpeed;
        rearWheel.rotation.x += wheelRollSpeed;

        const targetRoll = -diff * 0.25;
        characterGroup.rotation.z += (targetRoll - characterGroup.rotation.z) * Math.min(1, delta * 8);

        characterGroup.position.y = Math.abs(Math.sin(time * 18)) * 0.04;

        if (frameTick % 2 === 0) {
          const exhaustWorldPos = new THREE.Vector3(0.38, 0.3, -0.9);
          exhaustWorldPos.applyMatrix4(characterGroup.matrixWorld);
          const idx = dustCursor;
          dustPositions[idx * 3] = exhaustWorldPos.x;
          dustPositions[idx * 3 + 1] = exhaustWorldPos.y;
          dustPositions[idx * 3 + 2] = exhaustWorldPos.z;
          dustLife[idx] = 1;
          dustVelocity[idx].set((Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
          dustCursor = (dustCursor + 1) % dustPoolSize;
        }
      } else {
        const idleTime = time - lastActiveTime;
        if (idleTime > 4) {
          // Idle personality: gentle wobble + blinking headlight after a few seconds AFK
          characterGroup.rotation.z = Math.sin(time * 1.4) * 0.025;
          const blink = (Math.sin(time * 2.2) + 1) / 2;
          scooterSpotLight.intensity = 2 + blink * 3;
        } else {
          characterGroup.rotation.z *= 0.9;
          scooterSpotLight.intensity = 4;
        }
        characterGroup.position.y = Math.sin(time * 2) * 0.02;
      }

      // Squash-stretch pop decay (applied regardless of movement state)
      bouncePunch *= 0.85;
      characterGroup.scale.set(1 - bouncePunch * 0.08, 1 + bouncePunch * 0.18, 1 - bouncePunch * 0.08);

      // Advect + fade exhaust dust
      for (let i = 0; i < dustPoolSize; i++) {
        if (dustLife[i] <= 0) continue;
        dustPositions[i * 3] += dustVelocity[i].x * delta;
        dustPositions[i * 3 + 1] += dustVelocity[i].y * delta;
        dustPositions[i * 3 + 2] += dustVelocity[i].z * delta;
        dustLife[i] -= delta * 1.2;
        if (dustLife[i] <= 0) dustPositions[i * 3 + 1] = -999;
      }
      (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // Clamp character position
      characterGroup.position.x = Math.max(-16, Math.min(16, characterGroup.position.x));
      characterGroup.position.z = Math.max(-16, Math.min(16, characterGroup.position.z));

      // === ASPHALT-STYLE LOW CHASE CAMERA ===
      // Sits low and close behind the scooter, follows heading, banks into turns.
      const desiredHeight = 2.6 + (boosting ? 0.4 : 0);
      const desiredDistance = 5.0 + (boosting ? 1.2 : 0);
      const behindX = characterGroup.position.x - Math.sin(characterGroup.rotation.y) * desiredDistance;
      const behindZ = characterGroup.position.z - Math.cos(characterGroup.rotation.y) * desiredDistance;
      const camFactor = 1 - Math.exp(-8 * delta);
      camera.position.x += (behindX - camera.position.x) * camFactor;
      camera.position.z += (behindZ - camera.position.z) * camFactor;
      camera.position.y += (desiredHeight - camera.position.y) * camFactor;

      const lookAheadDist = 4.5;
      const lookTarget = new THREE.Vector3(
        characterGroup.position.x + Math.sin(characterGroup.rotation.y) * lookAheadDist,
        1.05,
        characterGroup.position.z + Math.cos(characterGroup.rotation.y) * lookAheadDist
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(lookTarget);
      // Subtle banking roll into turns, echoing the scooter's own lean
      camera.rotateZ(-characterGroup.rotation.z * 0.55);

      const targetFov = boosting && isCurrentMoving ? baseFov + 8 : baseFov;
      camera.fov += (targetFov - camera.fov) * camFactor;
      camera.updateProjectionMatrix();

      // Proximity checks + reactive building glow
      let foundNearby: LandmarkInfo | null = null;
      LANDMARKS.forEach((lm, idx) => {
        const lmVec = new THREE.Vector3(...lm.position);
        const dist = characterGroup.position.distanceTo(lmVec);
        if (dist < 4.2) foundNearby = lm;

        const proximity = Math.max(0, 1 - dist / 11);
        landmarkLights[idx].intensity = 2.5 + proximity * 4.5;
        landmarkWindowMats[idx].emissiveIntensity = 0.6 + proximity * 1.3;

        // Fusion combo tracking: mark visit time when close enough
        if (dist < 4.2) {
          const prevVisit = lastVisitTime[lm.id];
          lastVisitTime[lm.id] = time;

          FUSION_PAIRS.forEach((pair) => {
            const other = pair.a === lm.id ? pair.b : pair.b === lm.id ? pair.a : null;
            if (!other) return;
            const otherTime = lastVisitTime[other];
            if (otherTime !== undefined && time - otherTime < pair.windowSeconds && time - otherTime > 0.05) {
              // Avoid re-firing every frame while lingering: only fire once per approach
              if (prevVisit === undefined || time - prevVisit > pair.windowSeconds) {
                playBeep([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.05);
                const toastId = Date.now() + Math.random();
                setFusionToast({ id: toastId, text: `âš¡ FUSION UNLOCKED â€” ${pair.badgeName}` });
                setTimeout(() => setFusionToast((cur) => (cur && cur.id === toastId ? null : cur)), 2600);
              }
            }
          });
        }
      });
      setNearbyLandmark(foundNearby);

      // XP orb collisions with combo juice
      orbs.forEach((orb) => {
        if (orb.collected) return;
        const dist = Math.hypot(
          characterGroup.position.x - orb.mesh.position.x,
          characterGroup.position.z - orb.mesh.position.z
        );
        if (dist < 0.9) {
          orb.collected = true;
          orb.mesh.visible = false;
          orb.respawnAt = time + 8;
          bouncePunch = 1;

          burstMesh.position.set(orb.mesh.position.x, 0.15, orb.mesh.position.z);
          burstMesh.visible = true;
          burstLife = 1;
          burstMat.opacity = 0.9;

          if (time - lastPickupTime < 3) {
            comboCounter++;
          } else {
            comboCounter = 1;
          }
          lastPickupTime = time;

          const comboClamp = Math.min(comboCounter, 6);
          const pitchBump = 1 + comboClamp * 0.08;
          playBeep([659.25 * pitchBump, 987.77 * pitchBump], 0.045);

          if (onCollectGem) onCollectGem(15);
          const toastId = Date.now() + Math.random();
          const label = comboCounter > 1 ? `+15 XP  COMBO x${comboCounter}!` : "+15 XP";
          setXpToast({ id: toastId, text: label });
          setTimeout(() => setXpToast((cur) => (cur && cur.id === toastId ? null : cur)), 1100);
        }
      });

      // Throttled minimap position sync
      if (frameTick % 6 === 0) {
        setMiniMapPos({
          x: characterGroup.position.x,
          z: characterGroup.position.z,
          heading: characterGroup.rotation.y,
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      resizeObserver.disconnect();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const mapScale = (v: number) => 50 + (v / 16) * 42;

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg w-screen h-screen overflow-hidden select-none  flex flex-col font-sans">
      {/* 3D CANVAS MOUNT */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair absolute inset-0" />

      {/* BOOST SPEED-LINE VIGNETTE OVERLAY */}
      {boostActive && (
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(201,121,63,0.3) 100%)",
            transition: "opacity 0.15s ease",
          }}
        />
      )}

      {/* FLOATING XP / COMBO TOAST */}
      {xpToast && (
        <div key={xpToast.id} className="absolute top-1/4 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center">
          <span className="font-mono text-lg font-bold text-amber-300 drop-shadow-lg animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap">
            {xpToast.text}
          </span>
        </div>
      )}

      {/* FUSION COMBO TOAST */}
      {fusionToast && (
        <div key={fusionToast.id} className="absolute top-1/3 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center">
          <span className="font-mono text-base font-bold text-emerald-300 drop-shadow-lg bg-brand-surface/90 border border-emerald-400/50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300 whitespace-nowrap">
            {fusionToast.text}
          </span>
        </div>
      )}

      {/* TOP MINIMAL HUD OVERLAY BAR */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-30 pointer-events-none">
        <div className="bg-brand-surface/90 border border-brand-border/80 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center gap-3 pointer-events-auto shadow-lg">
          <Compass className="w-4 h-4 text-brand-accent animate-spin-slow" />
          <div>
            <span className="font-mono text-[9px] text-brand-accent uppercase font-bold block leading-none tracking-widest">
              ZAINAB'S 3D REALM // FULLSCREEN GAME WORLD
            </span>
            <span className="text-xs font-display font-bold text-brand-secondary">
              Explorable Town Scene
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto bg-brand-surface/95 border border-brand-border p-1.5 rounded-xl backdrop-blur-md shadow-lg">
          {LANDMARKS.map((lm) => (
            <button
              key={lm.id}
              onClick={() => handleSelectLandmark(lm)}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeHud?.id === lm.id
                  ? "bg-brand-accent text-white shadow-xs"
                  : visited.has(lm.id)
                  ? "bg-brand-surface-light text-brand-secondary border border-brand-border hover:bg-brand-surface-light/80"
                  : "hover:bg-brand-accent/20 text-brand-tertiary hover:text-brand-secondary"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lm.color }} />
              <span>{lm.name}</span>
            </button>
          ))}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg border border-brand-border text-brand-tertiary hover:text-brand-secondary cursor-pointer ml-1"
            title="Toggle Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-accent" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {onSwitchToScrollMode && (
            <button
              onClick={onSwitchToScrollMode}
              className="px-3.5 py-1.5 rounded-lg bg-brand-surface-light border border-brand-border text-brand-secondary hover:border-brand-accent hover:text-brand-accent font-mono text-xs font-bold cursor-pointer transition-all ml-1 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Game Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* INTERACTIVE MINIMAP â€” click a dot to dash the scooter there */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="relative w-36 h-36 bg-brand-surface/90 border border-brand-border/80 rounded-xl backdrop-blur-md shadow-lg overflow-hidden pointer-events-auto">
          {LANDMARKS.map((lm) => (
            <button
              key={lm.id}
              onClick={() => {
                teleportRequestRef.current = { x: lm.position[0], z: lm.position[2] };
              }}
              className="absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-150 transition-transform"
              style={{
                left: `${mapScale(lm.position[0])}%`,
                top: `${mapScale(lm.position[2])}%`,
                backgroundColor: lm.color,
                boxShadow: `0 0 4px ${lm.color}`,
              }}
              title={`Ride to ${lm.name}`}
            />
          ))}
          <div
            className="absolute w-0 h-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${mapScale(miniMapPos.x)}%`,
              top: `${mapScale(miniMapPos.z)}%`,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "9px solid #e8e8e3",
              transform: `translate(-50%, -50%) rotate(${miniMapPos.heading}rad)`,
              filter: "drop-shadow(0 0 3px #b8925a)",
            }}
          />
          <span className="absolute bottom-1 left-1.5 font-mono text-[8px] text-brand-tertiary uppercase tracking-wider pointer-events-none">
            Tap to ride
          </span>
        </div>
      </div>

      {/* BOTTOM CONTROLS & NEARBY PROMPT OVERLAY */}
      <div className="absolute bottom-4 left-44 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 pointer-events-none">
        <div className="bg-brand-surface/90 border border-brand-border/80 px-4 py-2.5 rounded-xl backdrop-blur-md text-xs font-mono text-brand-tertiary pointer-events-auto flex items-center gap-2 shadow-lg">
          <span className="text-brand-accent font-bold">[WASD / ARROWS / CLICK-TO-MOVE]</span>
          <span>Ride to checkpoints</span>
          <span className={`ml-2 font-bold ${boostActive ? "text-amber-400" : "text-brand-tertiary/70"}`}>
            [HOLD SHIFT: BOOST]
          </span>
        </div>

        {nearbyLandmark && !activeHud && (
          <button
            onClick={() => handleSelectLandmark(nearbyLandmark)}
            className="bg-brand-accent text-white px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-accent-glow flex items-center gap-2 animate-bounce pointer-events-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{nearbyLandmark.id === "bookstall" ? "DISMOUNT Â· OPEN FIELD BOOKS" : `ENTER ${nearbyLandmark.buildingName} (${nearbyLandmark.name})`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* EDITORIAL IN-GAME PORTFOLIO HUD MODAL OVERLAY */}
      {activeHud && (
        <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md z-40 flex items-center justify-center p-4 md:p-8">
          <div className="bg-brand-surface border border-brand-border rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col relative  animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex items-center justify-between p-5 border-b border-brand-border bg-brand-surface-light/50">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeHud.color }} />
                <div>
                  <span className="font-mono text-[10px] text-brand-accent font-bold uppercase tracking-widest block">
                    {activeHud.buildingName} // IN-GAME PORTFOLIO HUD
                  </span>
                  <h3 className="text-xl font-display font-bold text-brand-secondary">
                    {activeHud.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 bg-brand-surface border border-brand-border p-1 rounded-xl">
                  {LANDMARKS.map((lm) => (
                    <button
                      key={lm.id}
                      onClick={() => handleSelectLandmark(lm)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                        activeHud.id === lm.id
                          ? "bg-brand-accent text-white"
                          : "text-brand-tertiary hover:text-brand-secondary"
                      }`}
                    >
                      {lm.name}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveHud(null)}
                  className="p-2 text-brand-tertiary hover:text-brand-secondary bg-brand-surface hover:bg-brand-border rounded-xl transition-all cursor-pointer border border-brand-border"
                  title="Close HUD Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {activeHud.id === "about" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // BIOGRAPHICAL ARCHIVES & SYSTEM PHILOSOPHY
                    </p>
                    <span className="font-mono text-xs text-pink-400 font-bold">[BIO_ARCHIVES_ACTIVE]</span>
                  </div>

                  <div className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-4">
                    <h4 className="text-lg font-bold text-brand-secondary">Zainab Hina</h4>
                    <p className="text-xs text-brand-primary/90 leading-relaxed">
                      Passionate Software Engineer specializing in C++ low-level game engine systems, high-performance WebGL 3D graphics, and full-stack MERN web platforms. Dedicated to mastering clean entity-component architecture, memory efficiency, and intuitive UI/UX design.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                      <div className="p-3 bg-brand-surface border border-brand-border rounded-lg">
                        <span className="text-brand-accent block font-bold">CORE FOCUS</span>
                        <span className="text-brand-secondary">C++ Systems / WebGL 3D / MERN Stack</span>
                      </div>
                      <div className="p-3 bg-brand-surface border border-brand-border rounded-lg">
                        <span className="text-brand-accent block font-bold">LEARNING ROADMAP</span>
                        <span className="text-brand-secondary">33.5 hrs/week dedicated practice</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeHud.id === "education" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // ACADEMY CITADEL: ACADEMIC CREDENTIALS & ROADMAP
                    </p>
                    <span className="font-mono text-xs text-purple-400 font-bold">[ACADEMY_ONLINE]</span>
                  </div>

                  <div className="space-y-4">
                    {EDUCATION_PLACEHOLDERS.map((edu) => (
                      <div key={edu.id} className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="text-base font-bold text-brand-secondary">{edu.degreePlaceholder}</h4>
                            <span className="text-xs font-mono text-brand-accent font-semibold">{edu.institutionPlaceholder}</span>
                          </div>
                          <span className="font-mono text-xs text-brand-tertiary bg-brand-surface px-2.5 py-1 rounded border border-brand-border">
                            {edu.periodPlaceholder}
                          </span>
                        </div>
                        <p className="text-xs text-brand-primary/80 leading-relaxed pt-1">
                          {edu.descriptionPlaceholder}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeHud.id === "experience" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // OPERATIONS CENTER: CAREER HISTORY & IMPACT
                    </p>
                    <span className="font-mono text-xs text-brand-brass font-bold">[COMMAND_TIMELINE]</span>
                  </div>

                  <div className="space-y-4">
                    {EXPERIENCE_PLACEHOLDERS.map((exp) => (
                      <div key={exp.id} className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h4 className="text-base font-bold text-brand-secondary">{exp.rolePlaceholder}</h4>
                            <span className="text-xs font-mono text-brand-accent font-semibold">{exp.companyPlaceholder}</span>
                          </div>
                          <span className="font-mono text-xs text-brand-tertiary bg-brand-surface px-2.5 py-1 rounded border border-brand-border">
                            {exp.periodPlaceholder}
                          </span>
                        </div>
                        <p className="text-xs text-brand-primary/80 leading-relaxed">
                          {exp.descriptionPlaceholder}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {exp.technologies.map((tech) => (
                            <span key={tech} className="px-2 py-0.5 bg-brand-surface border border-brand-border rounded text-[10px] font-mono text-brand-tertiary">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeHud.id === "projects" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // SYSTEM FOUNDRY: 6 FEATURED SHIPPED PROJECTS
                    </p>
                    <span className="font-mono text-xs text-brand-accent font-bold">[ENGINE_FOUNDRY_ACTIVE]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECT_PLACEHOLDERS.map((proj) => (
                      <div key={proj.id} className="p-4 bg-brand-surface-light border border-brand-border rounded-xl space-y-3 hover:border-brand-accent/50 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] text-brand-accent uppercase font-bold">
                            {proj.categoryPlaceholder}
                          </span>
                          <span className="font-mono text-[10px] text-brand-tertiary">{proj.yearPlaceholder}</span>
                        </div>
                        <h4 className="text-base font-bold text-brand-secondary">{proj.titlePlaceholder}</h4>
                        <p className="text-xs text-brand-primary/80 line-clamp-2">{proj.descriptionPlaceholder}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techStack.map((tech) => (
                            <span key={tech} className="font-mono text-[9px] px-2 py-0.5 bg-brand-surface border border-brand-border rounded text-brand-tertiary">
                              {tech}
                            </span>
                          ))}
                        </div>
                        {proj.links.live !== "#" && (
                          <div className="pt-2 flex gap-3 font-mono text-xs">
                            <a href={proj.links.live} target="_blank" rel="noreferrer" className="text-brand-accent hover:underline flex items-center gap-1 font-bold">
                              <span>Live Preview</span> <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeHud.id === "leadership" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // OPERATIONS CENTER: LEADERSHIP & ARCHITECTURE ROLES
                    </p>
                    <span className="font-mono text-xs text-amber-500 font-bold">[HQ_SYSTEMS]</span>
                  </div>

                  <div className="space-y-4">
                    {LEADERSHIP_PLACEHOLDERS.map((lead) => (
                      <div key={lead.id} className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-bold text-brand-secondary">{lead.rolePlaceholder}</h4>
                            <span className="text-xs font-mono text-brand-accent font-semibold">{lead.organizationPlaceholder}</span>
                          </div>
                          <span className="font-mono text-xs text-brand-tertiary bg-brand-surface px-2.5 py-1 rounded border border-brand-border">
                            {lead.periodPlaceholder}
                          </span>
                        </div>
                        <p className="text-xs text-brand-primary/80 leading-relaxed pt-1">
                          {lead.descriptionPlaceholder}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeHud.id === "skills" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // TECHNICAL WORKSHOP: STACK MATRIX & GRAPHICS
                    </p>
                    <span className="font-mono text-xs text-emerald-400 font-bold">[WORKSHOP_03]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SKILL_CATEGORIES.map((cat) => (
                      <div key={cat.categoryName} className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-3">
                        <h4 className="font-mono text-xs text-brand-accent font-bold uppercase tracking-wider">
                          {cat.categoryName}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((skillName) => (
                            <span key={skillName} className="px-2.5 py-1 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono font-medium text-brand-secondary">
                              {skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeHud.id === "contact" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-brand-tertiary font-mono">
                      // TERMINAL GATE: DIRECT COMMS TRANSMITTER
                    </p>
                    <span className="font-mono text-xs text-brand-brass font-bold">[GATE_ONLINE]</span>
                  </div>

                  <div className="p-5 bg-brand-surface-light border border-brand-border rounded-xl space-y-4">
                    <div className="flex items-center gap-3 border-b border-brand-border pb-3">
                      <Mail className="w-5 h-5 text-brand-accent" />
                      <div>
                        <span className="text-xs font-mono text-brand-tertiary block">DIRECT EMAIL</span>
                        <a href="mailto:zainab.hina05@gmail.com" className="text-sm font-bold text-brand-secondary hover:text-brand-accent">
                          zainab.hina05@gmail.com
                        </a>
                      </div>
                    </div>

                    {messageSent ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-center space-y-1">
                        <p className="font-mono text-xs font-bold text-emerald-400 uppercase">
                          [TRANSMISSION SENT SUCCESSFULLY]
                        </p>
                        <p className="text-xs text-brand-primary">
                          Thank you for contacting Zainab. She will get back to you shortly!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="font-mono text-xs text-brand-tertiary block uppercase">
                          Transmit Message to Zainab
                        </label>
                        <textarea
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Type your message or project inquiry..."
                          className="w-full h-24 p-3 bg-brand-surface border border-brand-border rounded-xl font-mono text-xs text-brand-secondary focus:outline-none focus:border-brand-accent"
                        />
                        <button
                          onClick={() => {
                            if (contactMessage.trim()) {
                              setMessageSent(true);
                            }
                          }}
                          className="w-full py-3 bg-brand-accent text-white font-mono text-xs font-bold uppercase rounded-xl hover:bg-brand-accent/90 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Transmit Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-brand-border bg-brand-surface-light/80 flex items-center justify-between">
              <span className="font-mono text-[10px] text-brand-tertiary">
                AVATAR LOCATION: {activeHud.buildingName}
              </span>
              <button
                onClick={() => setActiveHud(null)}
                className="px-5 py-2 bg-brand-surface border border-brand-border hover:border-brand-accent text-brand-secondary rounded-xl font-mono text-xs font-bold transition-all cursor-pointer"
              >
                Continue Exploring 3D Town
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}






