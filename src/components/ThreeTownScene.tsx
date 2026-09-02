import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  ShieldCheck,
  Mail,
  Cpu,
  Award,
  X,
  Sun,
  Sunset,
  CloudRain,
  Moon,
  ArrowRight,
  UserCheck,
  Gauge,
  Navigation,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Camera,
  MapPin,
  Play,
  Flame,
  Zap,
  CheckCircle2
} from "lucide-react";
import {
  PROJECT_PLACEHOLDERS,
  EXPERIENCE_PLACEHOLDERS,
  SKILL_CATEGORIES,
  LEADERSHIP_PLACEHOLDERS,
  EDUCATION_PLACEHOLDERS,
  CERTIFICATION_PLACEHOLDERS
} from "../data";
import { AsphaltTheme } from "../utils/asphaltGenerator";
import { buildRoadNetwork } from "../utils/roadNetworkBuilder";
import { CameraViewMode, CAMERA_VIEWS, updateCameraView } from "../utils/cameraManager";
import {
  createGhibliEnvironment,
  GhibliAtmosphere,
  GHIBLI_ATMOSPHERES
} from "../utils/ghibliEnvironment";
import { createRoadCollisionEngine } from "../utils/roadCollision";
import { createCelMaterial, createSilhouetteOutline } from "../utils/celShading";
import { createScooterPlayer, ScooterPlayerInstance } from "../utils/scooterPlayer";

interface ThreeTownSceneProps {
  teleportLandmark?: string | null;
  onLandmarkSelect: (landmarkId: string) => void;
  onExploreProgress?: (visitedCount: number, totalCount: number) => void;
  onSwitchToScrollMode?: () => void;
  onExit3D?: () => void;
}

export type GameColorTheme = "midnight" | "ghibli" | "cyber" | "sakura";

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
    title: "Grand Botanical Herbarium & Archives",
    buildingName: "BOTANICAL_ATELIER",
    description: "Zainab's background, system engineering philosophy, & interests.",
    position: [-54, 0, -46],
    color: "#ec4899",
    icon: "UserCheck"
  },
  {
    id: "education",
    name: "Education",
    title: "Celestial Observatory & Clocktower",
    buildingName: "CELESTIAL_OBSERVATORY",
    description: "BS Computer Science, data structures & algorithms roadmap.",
    position: [0, 0, -68],
    color: "#8b5cf6",
    icon: "Award"
  },
  {
    id: "experience",
    name: "Experience",
    title: "Cotswolds Clockwork Workshop",
    buildingName: "CLOCKWORK_WORKSHOP",
    description: "MERN stack developer, frontend engineering, & C++ systems.",
    position: [54, 0, -46],
    color: "#3b82f6",
    icon: "ShieldCheck"
  },
  {
    id: "skills",
    name: "Skills",
    title: "Alchemist's Starlight Forge",
    buildingName: "STARLIGHT_FORGE",
    description: "Graphics engines, full-stack tools, & AI workflows.",
    position: [-65, 0, 16],
    color: "#10b981",
    icon: "Layers"
  },
  {
    id: "projects",
    name: "Projects",
    title: "Airship Foundry & Inventor's Guild",
    buildingName: "AIRSHIP_FOUNDRY",
    description: "15+ shipped C++, WebGL, and MERN software systems.",
    position: [65, 0, 16],
    color: "#f97316",
    icon: "Cpu"
  },
  {
    id: "leadership",
    name: "Leadership",
    title: "Town Council & Sunstone Pavilion",
    buildingName: "SUNSTONE_PAVILION",
    description: "Team leadership, system architecture oversight, & mentoring.",
    position: [-44, 0, 58],
    color: "#f59e0b",
    icon: "Zap"
  },
  {
    id: "contact",
    name: "Contact",
    title: "Wandering Post Office & Pigeon Aviary",
    buildingName: "POST_OFFICE_SPIRE",
    description: "Direct connection, email transmission, & availability.",
    position: [44, 0, 58],
    color: "#06b6d4",
    icon: "Mail"
  }
];

export const GAME_THEMES: Array<{
  id: GameColorTheme;
  name: string;
  badge: string;
  accentColor: string;
  bgGlass: string;
  borderClass: string;
  textClass: string;
  activeBtn: string;
}> = [
  {
    id: "midnight",
    name: "Midnight Biker",
    badge: "🏍️ CHIC OBSIDIAN",
    accentColor: "#38bdf8",
    bgGlass: "bg-zinc-950/90",
    borderClass: "border-zinc-700/60",
    textClass: "text-zinc-100",
    activeBtn: "bg-sky-400 text-zinc-950 shadow-sky-500/20"
  },
  {
    id: "ghibli",
    name: "Ghibli Sunset",
    badge: "🌅 GOLDEN HOUR",
    accentColor: "#f59e0b",
    bgGlass: "bg-amber-950/90",
    borderClass: "border-amber-600/50",
    textClass: "text-amber-50",
    activeBtn: "bg-amber-400 text-amber-950 shadow-amber-500/20"
  },
  {
    id: "cyber",
    name: "Cyber Twilight",
    badge: "🌆 SYNTHWAVE",
    accentColor: "#ec4899",
    bgGlass: "bg-slate-950/90",
    borderClass: "border-purple-600/50",
    textClass: "text-purple-50",
    activeBtn: "bg-fuchsia-500 text-white shadow-fuchsia-500/20"
  },
  {
    id: "sakura",
    name: "Sakura Meadow",
    badge: "🌸 SPRING ROSE",
    accentColor: "#fb7185",
    bgGlass: "bg-stone-950/90",
    borderClass: "border-rose-700/50",
    textClass: "text-rose-50",
    activeBtn: "bg-rose-400 text-rose-950 shadow-rose-500/20"
  }
];

export default function ThreeTownScene({
  teleportLandmark,
  onLandmarkSelect,
  onExploreProgress,
  onSwitchToScrollMode,
  onExit3D
}: ThreeTownSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeHud, setActiveHud] = useState<LandmarkInfo | null>(null);

  // Simplified: Lock to rainy environment and cinematic camera only
  const atmosphere: GhibliAtmosphere = "rainy";
  const setAtmosphereRef = useRef<((atm: GhibliAtmosphere) => void) | null>(null);

  // Camera locked to cinematic mode
  const cameraMode: CameraViewMode = "cinematic";
  const cameraModeRef = useRef<CameraViewMode>("cinematic");

  const [asphaltTheme] = useState<AsphaltTheme>("wet");
  const updateRoadThemeRef = useRef<((theme: AsphaltTheme) => void) | null>(null);

  const [isAutoCruising, setIsAutoCruising] = useState(false);
  const [autoTargetLandmark, setAutoTargetLandmark] = useState<LandmarkInfo | null>(null);

  const navigateToLandmarkRef = useRef<((landmark: LandmarkInfo) => void) | null>(null);
  const teleportToLandmarkRef = useRef<((landmark: LandmarkInfo) => void) | null>(null);

  // Sound feedback synthesizer
  const playBeep = (freqs: number[], type: OscillatorType = "sine") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.05 + 0.14);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.05);
        osc.stop(audioCtx.currentTime + idx * 0.05 + 0.16);
      });
    } catch (e) {}
  };

  // SMART AUTO-DRIVE: When any destination is clicked, drive to that part by itself automatically along the roads!
  const handleSelectLandmark = (landmark: LandmarkInfo) => {
    setAutoTargetLandmark(landmark);
    setIsAutoCruising(true);
    playBeep([480, 640, 800, 960], "triangle");
    if (navigateToLandmarkRef.current) {
      navigateToLandmarkRef.current(landmark);
    }
  };

  // Instant Teleport option
  const handleTeleportDirectly = (landmark: LandmarkInfo) => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(landmark.id);
      if (onExploreProgress) onExploreProgress(next.size, LANDMARKS.length);
      return next;
    });
    playBeep([600, 900]);
    setActiveHud(landmark);
    onLandmarkSelect(landmark.id);
    if (teleportToLandmarkRef.current) {
      teleportToLandmarkRef.current(landmark);
    }
  };

  useEffect(() => {
    if (teleportLandmark) {
      const targetLm = LANDMARKS.find((l) => l.id === teleportLandmark);
      if (targetLm) {
        handleSelectLandmark(targetLm);
      }
    }
  }, [teleportLandmark]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0284c7");
    scene.fog = new THREE.FogExp2("#38bdf8", 0.0075);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 10, 18);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight("#fef08a", 1.8);
    scene.add(ambientLight);

    const dirSunLight = new THREE.DirectionalLight("#fffbeb", 2.6);
    dirSunLight.position.set(45, 60, 35);
    dirSunLight.castShadow = true;
    dirSunLight.shadow.mapSize.width = 2048;
    dirSunLight.shadow.mapSize.height = 2048;
    dirSunLight.shadow.camera.near = 0.5;
    dirSunLight.shadow.camera.far = 180;
    dirSunLight.shadow.camera.left = -90;
    dirSunLight.shadow.camera.right = 90;
    dirSunLight.shadow.camera.top = 90;
    dirSunLight.shadow.camera.bottom = -90;
    dirSunLight.shadow.bias = -0.0004;
    scene.add(dirSunLight);

    const fillLight = new THREE.DirectionalLight("#38bdf8", 0.9);
    fillLight.position.set(-40, 25, -40);
    scene.add(fillLight);

    const centerPointLight = new THREE.PointLight("#fde047", 2.5, 30);
    centerPointLight.position.set(0, 4, 0);
    scene.add(centerPointLight);

    // 4. ROAD COLLISION & CONTAINMENT ENGINE
    const collisionEngine = createRoadCollisionEngine(LANDMARKS);

    // 5. CLEAN & PROPERLY ALIGNED ROAD NETWORK
    const roadNetwork = buildRoadNetwork(scene, LANDMARKS, asphaltTheme);
    updateRoadThemeRef.current = (theme) => {
      roadNetwork.updateRoadTheme(theme);
    };

    // 6. GHIBLI ENVIRONMENT
    const ghibliEnv = createGhibliEnvironment(scene, LANDMARKS, collisionEngine, atmosphere);
    setAtmosphereRef.current = (mode) => {
      ghibliEnv.setAtmosphere(mode);
      const cfg = GHIBLI_ATMOSPHERES[mode];
      ambientLight.color.set(cfg.ambientColor);
      ambientLight.intensity = cfg.ambientIntensity;
      dirSunLight.color.set(cfg.sunColor);
      dirSunLight.intensity = cfg.sunIntensity;
      dirSunLight.position.set(cfg.sunPosition[0], cfg.sunPosition[1], cfg.sunPosition[2]);
      fillLight.intensity = mode === "night" ? 0.3 : 0.9;
      centerPointLight.intensity = mode === "night" ? 3.5 : 2.2;
    };

    // 7. GHIBLI-STYLED LANDMARK STRUCTURES WITH RAYCAST INTERACTION
    const floatingGems: THREE.Mesh[] = [];
    const interactiveLandmarkMeshes: Array<{ mesh: THREE.Object3D; landmark: LandmarkInfo }> = [];

    LANDMARKS.forEach((lm) => {
      const group = new THREE.Group();
      group.position.set(...lm.position);
      const colorHex = lm.color;

      // Cobblestone foundation plaza
      const baseGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.4, 32);
      const baseMat = createCelMaterial({ color: "#f1f5f9", steps: 3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      const baseOutline = createSilhouetteOutline(baseGeo, "#292524", 1.035);
      baseOutline.position.y = 0.2;
      group.add(baseOutline);

      // Stucco & Timber Main Storybook Building
      const bldgGeo = new THREE.BoxGeometry(2.6, 2.8, 2.6);
      const bldgMat = createCelMaterial({ color: "#fffbeb", steps: 3 });
      const bldgMesh = new THREE.Mesh(bldgGeo, bldgMat);
      bldgMesh.position.y = 1.8;
      bldgMesh.castShadow = true;
      bldgMesh.receiveShadow = true;
      group.add(bldgMesh);
      interactiveLandmarkMeshes.push({ mesh: bldgMesh, landmark: lm });

      const bldgOutline = createSilhouetteOutline(bldgGeo, "#1c1917", 1.03);
      bldgOutline.position.y = 1.8;
      group.add(bldgOutline);

      // Stained-Glass Windows
      const winGeo = new THREE.BoxGeometry(2.64, 1.1, 1.6);
      const winMat = createCelMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.85,
        steps: 2,
      });
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.y = 2.0;
      group.add(winMesh);

      // Terracotta Steep Roof with Gables
      const roofGeo = new THREE.ConeGeometry(2.1, 1.8, 4);
      roofGeo.rotateY(Math.PI / 4);
      const roofMat = createCelMaterial({ color: "#c2410c", steps: 3 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = 4.1;
      roofMesh.castShadow = true;
      group.add(roofMesh);

      const roofOutline = createSilhouetteOutline(roofGeo, "#1c1917", 1.04);
      roofOutline.position.y = 4.1;
      group.add(roofOutline);

      // Floating Holographic Realm Gem
      const gemGeo = new THREE.OctahedronGeometry(0.5, 0);
      const gemMat = createCelMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: 0.95,
        steps: 3,
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.y = 6.4;
      group.add(gemMesh);
      floatingGems.push(gemMesh);
      interactiveLandmarkMeshes.push({ mesh: gemMesh, landmark: lm });

      // Landmark Lantern Glow
      const bldgLight = new THREE.PointLight(colorHex, 2.2, 8);
      bldgLight.position.set(0, 3.2, 0);
      group.add(bldgLight);

      scene.add(group);
    });

    // 8. MODULAR SCOOTER PLAYER CHARACTER
    const scooterPlayer: ScooterPlayerInstance = createScooterPlayer({
      bodyColor: "#18181b",
      helmetColor: "#09090b",
      jacketColor: "#09090b",
      enableHeadlightBeam: true,
    });
    const characterGroup = scooterPlayer.group;
    scene.add(characterGroup);

    setScooterThemeRef.current = (theme) => {
      scooterPlayer.setThemeColors(theme);
    };

    // Target Destination Beacon Rings
    const beaconGroup = new THREE.Group();
    const targetRingGeo = new THREE.RingGeometry(0.4, 0.8, 32);
    const targetRingMat = new THREE.MeshBasicMaterial({ color: "#38bdf8", side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const targetMarker = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetMarker.rotation.x = Math.PI / 2;
    targetMarker.position.y = 0.08;
    beaconGroup.add(targetMarker);

    const beaconPillarGeo = new THREE.CylinderGeometry(0.1, 0.8, 12, 16, 1, true);
    const beaconPillarMat = new THREE.MeshBasicMaterial({
      color: "#38bdf8",
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const beaconPillar = new THREE.Mesh(beaconPillarGeo, beaconPillarMat);
    beaconPillar.position.y = 6;
    beaconGroup.add(beaconPillar);

    scene.add(beaconGroup);

    // 9. CONTROLS & ROAD WAYPOINT PATHFINDER
    const keysPressed: Record<string, boolean> = {};
    let activeWaypoints: THREE.Vector3[] = [];
    let isMovingToTarget = false;
    let targetLandmarkObject: LandmarkInfo | null = null;

    // Navigate smoothly to clicked destination
    navigateToLandmarkRef.current = (landmark) => {
      targetLandmarkObject = landmark;
      const lmVec = new THREE.Vector3(...landmark.position);
      const destinationOnRoad = collisionEngine.getClosestRoadPoint(lmVec.x, lmVec.z);
      const waypoints = collisionEngine.findRoadPath(characterGroup.position, destinationOnRoad);
      activeWaypoints = waypoints;
      isMovingToTarget = waypoints.length > 0;
      if (waypoints.length > 0) {
        const finalP = waypoints[waypoints.length - 1];
        beaconGroup.position.set(finalP.x, 0, finalP.z);
        targetRingMat.color.set(landmark.color);
        beaconPillarMat.color.set(landmark.color);
        targetRingMat.opacity = 0.9;
        beaconPillarMat.opacity = 0.35;
      }
    };

    teleportToLandmarkRef.current = (landmark) => {
      const lmVec = new THREE.Vector3(...landmark.position);
      const roadSpot = collisionEngine.getClosestRoadPoint(lmVec.x, lmVec.z);
      characterGroup.position.set(roadSpot.x, 0, roadSpot.z);
      const angle = Math.atan2(lmVec.x - roadSpot.x, lmVec.z - roadSpot.z);
      characterGroup.rotation.y = angle;
      activeWaypoints = [];
      isMovingToTarget = false;
      targetRingMat.opacity = 0;
      beaconPillarMat.opacity = 0;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      keysPressed[e.key.toLowerCase()] = true;
      activeWaypoints = [];
      isMovingToTarget = false;
      setIsAutoCruising(false);
      targetRingMat.opacity = 0;
      beaconPillarMat.opacity = 0;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Raycaster for clicking landmarks or road points
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check if user clicked directly on any Landmark building or Gem
      const interactiveMeshes = interactiveLandmarkMeshes.map((item) => item.mesh);
      const landmarkHits = raycaster.intersectObjects(interactiveMeshes, true);
      if (landmarkHits.length > 0) {
        const hitMesh = landmarkHits[0].object;
        const found = interactiveLandmarkMeshes.find((item) => item.mesh === hitMesh || item.mesh.children.includes(hitMesh));
        if (found) {
          handleSelectLandmark(found.landmark);
          return;
        }
      }

      // Check click on ground / road
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

      if (hit) {
        const roadPoint = collisionEngine.getClosestRoadPoint(intersectionPoint.x, intersectionPoint.z);
        const distFromRoad = Math.hypot(intersectionPoint.x - roadPoint.x, intersectionPoint.z - roadPoint.z);

        if (distFromRoad <= 2.5) {
          const waypoints = collisionEngine.findRoadPath(characterGroup.position, roadPoint);
          activeWaypoints = waypoints;
          isMovingToTarget = waypoints.length > 0;
          beaconGroup.position.set(roadPoint.x, 0, roadPoint.z);
          targetRingMat.color.set("#38bdf8");
          beaconPillarMat.color.set("#38bdf8");
          targetRingMat.opacity = 0.85;
          beaconPillarMat.opacity = 0.3;
          playBeep([440, 660]);
        } else {
          playBeep([220, 180]);
        }
      }
    };

    renderer.domElement.addEventListener("click", handleCanvasClick);

    // 10. MAIN GAME LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Update Ghibli environment
      ghibliEnv.updateAnimation(time, delta, prefersReducedMotion);

      // Rotate floating gems & beacon pulse
      floatingGems.forEach((gem, idx) => {
        if (prefersReducedMotion) {
          gem.position.y = 6.4;
          gem.rotation.y = idx * (Math.PI / 4);
        } else {
          gem.rotation.y = time * 1.2 + idx;
          gem.position.y = 6.4 + Math.sin(time * 2.5 + idx) * 0.2;
        }
      });

      if (targetRingMat.opacity > 0) {
        targetMarker.rotation.z = time * 2;
        targetMarker.scale.setScalar(1 + Math.sin(time * 6) * 0.08);
      }

      // -----------------------------------------------------------------------
      // STRICT ROAD-CONSTRAINED DRIVING PHYSICS (AUTO-CRUISE + MANUAL)
      // -----------------------------------------------------------------------
      const isBoost = keysPressed["shift"] || false;
      const forwardMaxSpeed = isBoost ? 24.0 : 16.0;
      const reverseMaxSpeed = 7.0;
      const turnRate = isBoost ? 2.8 : 3.4;

      const vControls = virtualControlsRef.current;
      
      let throttle = 0;
      if (keysPressed["w"] || keysPressed["arrowup"] || vControls.up) throttle += 1;
      if (keysPressed["s"] || keysPressed["arrowdown"] || vControls.down) throttle -= 1;

      let steering = 0;
      if (keysPressed["a"] || keysPressed["arrowleft"] || vControls.left) steering += 1;
      if (keysPressed["d"] || keysPressed["arrowright"] || vControls.right) steering -= 1;

      let isMoving = false;

      if (throttle !== 0 || steering !== 0) {
        // Manual driving takes precedence
        activeWaypoints = [];
        isMovingToTarget = false;
        setIsAutoCruising(false);
        targetRingMat.opacity = 0;
        beaconPillarMat.opacity = 0;

        if (steering !== 0) {
          characterGroup.rotation.y += steering * turnRate * delta;
        }

        const effectiveThrottle = throttle !== 0 ? throttle : (steering !== 0 ? 0.75 : 0);

        if (effectiveThrottle !== 0) {
          const speed = effectiveThrottle > 0 ? forwardMaxSpeed : reverseMaxSpeed;
          const facingAngle = characterGroup.rotation.y;
          
          const moveStep = new THREE.Vector3(
            Math.sin(facingAngle) * Math.sign(effectiveThrottle),
            0,
            Math.cos(facingAngle) * Math.sign(effectiveThrottle)
          ).multiplyScalar(speed * delta * Math.abs(effectiveThrottle));

          const { newPos } = collisionEngine.resolveRoadMovement(
            characterGroup.position,
            moveStep,
            0.35
          );

          if (newPos.distanceToSquared(characterGroup.position) > 0.000001) {
            characterGroup.position.copy(newPos);
            isMoving = true;
          }
        }
      } else if (activeWaypoints.length > 0) {
        // Automatic Autopilot / GPS Cruise to Destination!
        const currentTarget = activeWaypoints[0];
        const dist = characterGroup.position.distanceTo(currentTarget);

        if (autoTargetLandmark) {
          const lmPos = new THREE.Vector3(...autoTargetLandmark.position);
          const distToDest = Math.round(characterGroup.position.distanceTo(lmPos));
          setDistanceToTargetMeters(distToDest);
        }

        if (dist > 0.65) {
          const dir = new THREE.Vector3().subVectors(currentTarget, characterGroup.position).normalize();
          const cruiseSpeed = isBoost ? 24.0 : 17.5;
          const stepDelta = dir.clone().multiplyScalar(cruiseSpeed * delta);
          
          const { newPos } = collisionEngine.resolveRoadMovement(
            characterGroup.position,
            stepDelta,
            0.35
          );
          characterGroup.position.copy(newPos);
          
          // Smoothly steer heading toward target
          const targetHeading = Math.atan2(dir.x, dir.z);
          let diff = targetHeading - characterGroup.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          characterGroup.rotation.y += diff * Math.min(1, delta * 12);
          
          isMoving = true;
        } else {
          // Reached intermediate waypoint, shift to next
          activeWaypoints.shift();
          if (activeWaypoints.length === 0) {
            // ARRIVED AT DESTINATION!
            isMovingToTarget = false;
            setIsAutoCruising(false);
            targetRingMat.opacity = 0;
            beaconPillarMat.opacity = 0;
            setDistanceToTargetMeters(null);

            if (targetLandmarkObject) {
              const arrivedLm = targetLandmarkObject;
              setVisited((prev) => {
                const next = new Set(prev);
                next.add(arrivedLm.id);
                if (onExploreProgress) onExploreProgress(next.size, LANDMARKS.length);
                return next;
              });
              playBeep([523, 659, 783, 1046]);
              setActiveHud(arrivedLm);
              onLandmarkSelect(arrivedLm.id);
            }
          }
        }
      }

      // Update Modular Scooter Player Animations & Particles
      scooterPlayer.update(delta, time, 0, isMoving, steering, isBoost);

      // Camera Follow
      updateCameraView(camera, cameraModeRef.current, characterGroup, delta, time, isMoving);

      // Landmark Proximity Detection
      let foundNearby: LandmarkInfo | null = null;
      LANDMARKS.forEach((lm) => {
        const lmVec = new THREE.Vector3(...lm.position);
        if (characterGroup.position.distanceTo(lmVec) < 7.5) {
          foundNearby = lm;
        }
      });
      setNearbyLandmark(foundNearby);

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

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.domElement.removeEventListener("click", handleCanvasClick);
      scooterPlayer.destroy();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const currentThemeConfig = GAME_THEMES.find((t) => t.id === gameTheme) || GAME_THEMES[0];

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-slate-950 font-sans">
      {/* 3D CANVAS MOUNT */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair absolute inset-0" />

      {/* SIMPLIFIED TOP HEADER */}
      <header className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        {/* Portfolio World Badge */}
        <div className="bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2.5 pointer-events-auto shadow-lg text-slate-100">
          <Compass className="w-4 h-4 text-sky-400" />
          <div>
            <span className="text-sm font-semibold">Zainab's Portfolio World</span>
            <span className="block text-[10px] text-slate-400">Click landmarks to explore</span>
          </div>
        </div>

        {/* Simple Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Audio Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg backdrop-blur-md"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit 3D */}
          {(onExit3D || onSwitchToScrollMode) && (
            <button
              onClick={() => {
                if (onExit3D) onExit3D();
                else if (onSwitchToScrollMode) onSwitchToScrollMode();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 hover:border-sky-400 hover:text-sky-300 font-medium text-sm transition-all flex items-center gap-2 shadow-lg backdrop-blur-md"
              title="Return to 2D View"
            >
              <X className="w-4 h-4" />
              <span>Exit 3D</span>
            </button>
          )}
        </div>
      </header>

      {/* CLICK-TO-DRIVE DESTINATIONS BAR (Click ANY destination to drive there automatically!) */}
      <nav aria-label="Destinations Bar" className="absolute top-18 sm:top-16 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 pointer-events-none flex justify-center">
        <div className={`flex items-center gap-1.5 pointer-events-auto ${currentThemeConfig.bgGlass} border ${currentThemeConfig.borderClass} p-1.5 px-3 rounded-2xl backdrop-blur-md shadow-2xl max-w-full overflow-x-auto scrollbar-none`}>
          <span className="text-[10px] font-mono text-sky-400 px-1.5 font-bold uppercase shrink-0 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-sky-400 animate-pulse" /> CLICK TO AUTO-DRIVE:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {LANDMARKS.map((lm) => {
              const isTargeting = isAutoCruising && autoTargetLandmark?.id === lm.id;
              const isVisited = visited.has(lm.id);

              return (
                <button
                  key={lm.id}
                  onClick={() => handleSelectLandmark(lm)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isTargeting
                      ? "bg-sky-400 text-zinc-950 shadow-lg scale-105 animate-pulse"
                      : activeHud?.id === lm.id
                      ? "bg-sky-500/30 text-sky-200 border border-sky-400"
                      : isVisited
                      ? "bg-zinc-800/80 text-zinc-200 border border-zinc-700/60 hover:bg-zinc-700"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                  title={`Auto-drive scooter to ${lm.name} (${lm.title})`}
                >
                  <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: lm.color }} />
                  <span>{lm.name}</span>
                  {isTargeting && <span className="text-[9px] bg-zinc-950 text-sky-300 px-1 rounded">DRIVING</span>}
                  {isVisited && !isTargeting && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* AUTOPILOT ACTIVE BANNER */}
      {isAutoCruising && autoTargetLandmark && (
        <div className="absolute top-30 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="bg-sky-950/90 border border-sky-400 text-sky-200 px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md">
            <Navigation className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
            <span>AUTOPILOT CRUISING TO: {autoTargetLandmark.name.toUpperCase()}</span>
            {distanceToTargetMeters !== null && (
              <span className="bg-sky-400 text-zinc-950 px-1.5 py-0.2 rounded font-mono text-[10px]">
                {distanceToTargetMeters}m
              </span>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM LEFT: ROADWAY TELEMETRY & SPEEDOMETER */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-none flex flex-col gap-2">
        <div className={`${currentThemeConfig.bgGlass} border ${currentThemeConfig.borderClass} p-3.5 rounded-2xl backdrop-blur-md pointer-events-auto shadow-2xl ${currentThemeConfig.textClass} space-y-2.5 w-80`}>
          
          <div className="flex justify-between items-center border-b border-zinc-700/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-300">
                SCOOTER TELEMETRY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-emerald-400">
                {currentSpeedKmh} KM/H
              </span>
              {currentSpeedKmh > 50 && (
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-400" /> BOOST
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">CURRENT ROAD:</span>
              <span className="text-sky-300 font-bold truncate max-w-[170px]">{currentRoadName}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">NAVIGATION:</span>
              <span className="text-emerald-400 font-bold">
                {isAutoCruising ? `GPS AUTOPILOT (${autoTargetLandmark?.name})` : "MANUAL DRIVE"}
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">PROGRESS:</span>
              <span className="text-amber-300 font-bold">{visited.size} / {LANDMARKS.length} TOWNS DISCOVERED</span>
            </div>
          </div>

          <div className="pt-2 text-[9px] font-mono text-zinc-400 border-t border-zinc-700/60 flex items-center justify-between">
            <span>[WASD / ARROWS] Drive</span>
            <span>[SHIFT] Boost</span>
            <span>[CLICK TOWN] Auto-Drive</span>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: TOUCH/MOUSE VIRTUAL D-PAD */}
      <div className={`absolute bottom-4 right-4 z-30 pointer-events-auto flex flex-col items-center gap-1 ${currentThemeConfig.bgGlass} border ${currentThemeConfig.borderClass} p-2 rounded-2xl backdrop-blur-md shadow-2xl`}>
        <button
          onMouseDown={() => (virtualControlsRef.current.up = true)}
          onMouseUp={() => (virtualControlsRef.current.up = false)}
          onTouchStart={() => (virtualControlsRef.current.up = true)}
          onTouchEnd={() => (virtualControlsRef.current.up = false)}
          className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 active:bg-sky-400 active:text-zinc-950 text-zinc-200 flex items-center justify-center cursor-pointer transition-all shadow"
          title="Drive Forward"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onMouseDown={() => (virtualControlsRef.current.left = true)}
            onMouseUp={() => (virtualControlsRef.current.left = false)}
            onTouchStart={() => (virtualControlsRef.current.left = true)}
            onTouchEnd={() => (virtualControlsRef.current.left = false)}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 active:bg-sky-400 active:text-zinc-950 text-zinc-200 flex items-center justify-center cursor-pointer transition-all shadow"
            title="Steer Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-sky-400 text-[10px] font-bold font-mono">
            DRIVE
          </div>
          <button
            onMouseDown={() => (virtualControlsRef.current.right = true)}
            onMouseUp={() => (virtualControlsRef.current.right = false)}
            onTouchStart={() => (virtualControlsRef.current.right = true)}
            onTouchEnd={() => (virtualControlsRef.current.right = false)}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 active:bg-sky-400 active:text-zinc-950 text-zinc-200 flex items-center justify-center cursor-pointer transition-all shadow"
            title="Steer Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onMouseDown={() => (virtualControlsRef.current.down = true)}
          onMouseUp={() => (virtualControlsRef.current.down = false)}
          onTouchStart={() => (virtualControlsRef.current.down = true)}
          onTouchEnd={() => (virtualControlsRef.current.down = false)}
          className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 active:bg-sky-400 active:text-zinc-950 text-zinc-200 flex items-center justify-center cursor-pointer transition-all shadow"
          title="Reverse"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* PROXIMITY ACTION POPUP TO ENTER LANDMARK */}
      {nearbyLandmark && !activeHud && !isAutoCruising && (
        <div className="absolute bottom-24 right-4 md:right-28 z-30 pointer-events-none">
          <button
            onClick={() => handleTeleportDirectly(nearbyLandmark)}
            className="bg-sky-400 hover:bg-sky-300 text-zinc-950 px-5 py-3 rounded-2xl font-mono text-xs font-extrabold uppercase tracking-wider shadow-2xl flex items-center gap-2 animate-bounce pointer-events-auto cursor-pointer transition-all border border-sky-300"
          >
            <Sparkles className="w-4 h-4 text-zinc-950" />
            <span>EXPLORE {nearbyLandmark.buildingName} ({nearbyLandmark.name})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EDITORIAL STORYBOOK PORTFOLIO HUD MODAL */}
      {activeHud && (
        <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md z-40 flex items-center justify-center p-4 md:p-8">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col relative shadow-2xl overflow-hidden text-zinc-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full shadow-md" style={{ backgroundColor: activeHud.color }} />
                <div>
                  <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-widest block">
                    {activeHud.buildingName} // REALM ARCHIVES
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {activeHud.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveHud(null)}
                  className="p-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer border border-zinc-700"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
              
              {/* ABOUT */}
              {activeHud.id === "about" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Zainab Hina — Game Developer & Systems Engineer</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Software engineer building C++ game loops, high-performance WebGL 3D architectures, and scalable full-stack web applications. Passionate about procedural graphics, shaders, memory efficiency, and interactive web experiences.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
                    <div className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-2xl">
                      <span className="text-sky-400 font-bold block">SPECIALIZATION</span>
                      <span className="text-zinc-200">C++ / WebGL / Three.js / MERN / Game Engines</span>
                    </div>
                    <div className="p-3 bg-zinc-800/80 border border-zinc-700 rounded-2xl">
                      <span className="text-sky-400 font-bold block">LOCATION</span>
                      <span className="text-zinc-200">Faisalabad, Pakistan (Open to Global Remote)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PROJECTS */}
              {activeHud.id === "projects" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Featured Projects & Engines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROJECT_PLACEHOLDERS.map((proj) => (
                      <div key={proj.id} className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] text-sky-400 font-bold uppercase">{proj.categoryPlaceholder}</span>
                          <span className="font-mono text-[10px] text-zinc-400">{proj.yearPlaceholder}</span>
                        </div>
                        <h5 className="font-bold text-white text-base">{proj.titlePlaceholder}</h5>
                        <p className="text-xs text-zinc-300 line-clamp-2">{proj.descriptionPlaceholder}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.techStack.map((tech) => (
                            <span key={tech} className="font-mono text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {activeHud.id === "skills" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Technical Skills & Toolchain</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SKILL_CATEGORIES.map((cat, idx) => (
                      <div key={cat.categoryName || idx} className="p-3.5 bg-zinc-800/80 border border-zinc-700 rounded-2xl space-y-2">
                        <span className="text-xs font-bold text-sky-400 uppercase font-mono block">{cat.categoryName}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="text-[11px] bg-zinc-900 border border-zinc-700 px-2.5 py-0.5 rounded font-mono text-zinc-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {activeHud.id === "experience" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Work Experience</h4>
                  <div className="space-y-3">
                    {EXPERIENCE_PLACEHOLDERS.map((exp) => (
                      <div key={exp.id} className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h5 className="font-bold text-white text-base">{exp.rolePlaceholder}</h5>
                            <span className="text-xs font-mono text-sky-400 font-semibold">{exp.companyPlaceholder}</span>
                          </div>
                          <span className="font-mono text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700">
                            {exp.periodPlaceholder}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{exp.descriptionPlaceholder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {activeHud.id === "education" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Academic Qualifications</h4>
                  <div className="space-y-3">
                    {EDUCATION_PLACEHOLDERS.map((edu) => (
                      <div key={edu.id} className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-white text-base">{edu.degreePlaceholder}</h5>
                            <span className="text-xs font-mono text-sky-400 font-semibold">{edu.institutionPlaceholder}</span>
                          </div>
                          <span className="font-mono text-xs text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                            {edu.periodPlaceholder}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300">{edu.descriptionPlaceholder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LEADERSHIP */}
              {activeHud.id === "leadership" && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">Leadership Roles</h4>
                  <div className="space-y-3">
                    {LEADERSHIP_PLACEHOLDERS.map((lead) => (
                      <div key={lead.id} className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl space-y-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-white text-sm">{lead.rolePlaceholder}</h5>
                          <span className="font-mono text-xs text-zinc-400">{lead.periodPlaceholder}</span>
                        </div>
                        <span className="text-xs text-sky-400 font-semibold block">{lead.organizationPlaceholder}</span>
                        <p className="text-xs text-zinc-300 mt-1">{lead.descriptionPlaceholder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {activeHud.id === "contact" && (
                <div className="space-y-4 text-center py-4">
                  <h4 className="text-lg font-bold text-white">Get In Touch</h4>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto">
                    Open for game programming roles, C++ WebGL contracts, and full-stack systems engineering.
                  </p>
                  <div className="p-4 bg-zinc-800/80 border border-zinc-700 rounded-2xl max-w-md mx-auto flex justify-between items-center">
                    <span className="font-mono text-xs text-zinc-100">zainab.hina05@gmail.com</span>
                    <a
                      href="mailto:zainab.hina05@gmail.com"
                      className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow"
                    >
                      Send Message
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
