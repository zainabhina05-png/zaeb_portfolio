import * as THREE from "three";
import { LandmarkInfo } from "../components/ThreeTownScene";
import { RoadCollisionEngine } from "./roadCollision";
import { createCelMaterial, createSilhouetteOutline } from "./celShading";

export type GhibliAtmosphere = "sunny" | "sunset" | "rainy" | "night";

export interface VillageHouseInfo {
  x: number;
  z: number;
  rot: number;
  roof: string;
  wall: string;
  scale: number;
  name: string;
  emoji: string;
  category: string;
  themeColor: string;
}

export const VILLAGE_HOUSES: VillageHouseInfo[] = [
  // NW Quad (Meadow of the Herbalist)
  { x: -11.5, z: -11.5, rot: 0.3, roof: "#c2410c", wall: "#fef3c7", scale: 1.1, name: "Herbalist Atelier", emoji: "🌿", category: "Botanicals & Teas", themeColor: "#16a34a" },
  { x: -6.5, z: -12.5, rot: -0.2, roof: "#ea580c", wall: "#fffbeb", scale: 0.95, name: "Brioche Bakery", emoji: "🥖", category: "Fresh Pastries", themeColor: "#d97706" },
  { x: -12.2, z: -6.8, rot: 1.4, roof: "#15803d", wall: "#dcfce7", scale: 1.05, name: "Jasmine Tea House", emoji: "🍵", category: "Artisan Brews", themeColor: "#059669" },
  // NE Quad (Clocktower Vale)
  { x: 11.5, z: -11.5, rot: -0.4, roof: "#b45309", wall: "#fed7aa", scale: 1.15, name: "Chrono Workshop", emoji: "🕰️", category: "Precision Gears", themeColor: "#b45309" },
  { x: 6.8, z: -12.2, rot: 0.2, roof: "#dc2626", wall: "#fef3c7", scale: 0.9, name: "Folio Archive", emoji: "📖", category: "Manuscripts", themeColor: "#9333ea" },
  { x: 12.5, z: -6.5, rot: -1.2, roof: "#78350f", wall: "#fffbeb", scale: 1.0, name: "Stargazer Observatory", emoji: "🔭", category: "Astronomy", themeColor: "#2563eb" },
  // SW Quad (Sunstone Glade)
  { x: -11.5, z: 11.5, rot: -0.3, roof: "#78350f", wall: "#fed7aa", scale: 1.05, name: "Silk Weaver Cabin", emoji: "🧵", category: "Textile Craft", themeColor: "#db2777" },
  { x: -6.8, z: 12.5, rot: 0.5, roof: "#15803d", wall: "#fffbeb", scale: 0.95, name: "Greenhouse Flora", emoji: "🌱", category: "Exotic Spores", themeColor: "#10b981" },
  { x: -12.5, z: 6.8, rot: 1.1, roof: "#ea580c", wall: "#fef3c7", scale: 1.1, name: "Carpenter Lodge", emoji: "🪵", category: "Woodcraft", themeColor: "#78350f" },
  // SE Quad (Aviary Garden)
  { x: 11.5, z: 11.5, rot: 0.4, roof: "#c2410c", wall: "#fffbeb", scale: 1.2, name: "Iron & Ember Forge", emoji: "⚒️", category: "Blacksmithing", themeColor: "#ea580c" },
  { x: 6.8, z: 12.2, rot: -0.3, roof: "#b45309", wall: "#fed7aa", scale: 0.95, name: "Cartographer Study", emoji: "🗺️", category: "World Maps", themeColor: "#0284c7" },
  { x: 12.2, z: 6.8, rot: -1.3, roof: "#dc2626", wall: "#dcfce7", scale: 1.05, name: "Aviary Pigeon Roost", emoji: "🕊️", category: "Letter Couriers", themeColor: "#06b6d4" },
  // Intermediate Meadows
  { x: -9.5, z: -4.5, rot: 0.8, roof: "#ea580c", wall: "#fef3c7", scale: 0.9, name: "Terracotta Pottery", emoji: "🏺", category: "Ceramics", themeColor: "#c2410c" },
  { x: 9.5, z: -4.5, rot: -0.7, roof: "#15803d", wall: "#fffbeb", scale: 0.9, name: "Honey Apiary Hut", emoji: "🍯", category: "Wild Clover Honey", themeColor: "#eab308" },
  { x: -9.5, z: 4.5, rot: -0.6, roof: "#dc2626", wall: "#fed7aa", scale: 0.95, name: "Melody Violin Studio", emoji: "🎻", category: "Stringed Acoustic", themeColor: "#8b5cf6" },
  { x: 9.5, z: 4.5, rot: 0.9, roof: "#78350f", wall: "#e2e8f0", scale: 0.95, name: "Lantern Candlemaker", emoji: "🕯️", category: "Illumination", themeColor: "#f59e0b" },
];

export interface GhibliAtmosphereConfig {
  name: string;
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  sunIntensity: number;
  sunPosition: [number, number, number];
  ambientColor: string;
  ambientIntensity: number;
  fogColor: string;
  fogDensity: number;
  groundColor: string;
  windowEmissiveIntensity: number;
  lanternIntensity: number;
  asphaltRoughness: number;
  asphaltMetalness: number;
}

export const GHIBLI_ATMOSPHERES: Record<GhibliAtmosphere, GhibliAtmosphereConfig> = {
  rainy: {
    name: "Garden Summer Drizzle",
    skyTop: "#334155",
    skyBottom: "#64748b",
    sunColor: "#cbd5e1",
    sunIntensity: 1.3,
    sunPosition: [10, 30, 10],
    ambientColor: "#64748b",
    ambientIntensity: 1.5,
    fogColor: "#64748b",
    fogDensity: 0.022,
    groundColor: "#166534",
    windowEmissiveIntensity: 1.2,
    lanternIntensity: 2.4,
    asphaltRoughness: 0.12,
    asphaltMetalness: 0.55,
  },
  sunny: {
    name: "Kiki's Sunny Meadow",
    skyTop: "#38bdf8",
    skyBottom: "#bae6fd",
    sunColor: "#fffbeb",
    sunIntensity: 2.8,
    sunPosition: [25, 35, 20],
    ambientColor: "#bbf2f6",
    ambientIntensity: 1.6,
    fogColor: "#e0f2fe",
    fogDensity: 0.012,
    groundColor: "#22c55e",
    windowEmissiveIntensity: 0.35,
    lanternIntensity: 0.4,
    asphaltRoughness: 0.72,
    asphaltMetalness: 0.1,
  },
  sunset: {
    name: "Totoro's Golden Sunset",
    skyTop: "#ea580c",
    skyBottom: "#fef08a",
    sunColor: "#f97316",
    sunIntensity: 3.2,
    sunPosition: [35, 12, -25],
    ambientColor: "#fed7aa",
    ambientIntensity: 1.8,
    fogColor: "#ffedd5",
    fogDensity: 0.015,
    groundColor: "#15803d",
    windowEmissiveIntensity: 1.2,
    lanternIntensity: 2.2,
    asphaltRoughness: 0.65,
    asphaltMetalness: 0.2,
  },
  night: {
    name: "Spirited Starlit Night",
    skyTop: "#090d16",
    skyBottom: "#1e1b4b",
    sunColor: "#818cf8",
    sunIntensity: 0.9,
    sunPosition: [-20, 25, -20],
    ambientColor: "#1e293b",
    ambientIntensity: 1.1,
    fogColor: "#0f172a",
    fogDensity: 0.018,
    groundColor: "#064e3b",
    windowEmissiveIntensity: 2.0,
    lanternIntensity: 3.5,
    asphaltRoughness: 0.5,
    asphaltMetalness: 0.25,
  },
};

export interface GhibliEnvironmentResult {
  environmentGroup: THREE.Group;
  updateAnimation: (time: number, delta: number, isReducedMotion?: boolean) => void;
  setAtmosphere: (mode: GhibliAtmosphere) => void;
  currentAtmosphere: GhibliAtmosphere;
  validHouses: VillageHouseInfo[];
  dispose: () => void;
}

/**
 * Creates high-resolution storybook canvas billboard sprite for house labels
 */
function createStorybookLabelSprite(title: string, emoji: string, themeColor: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, 512, 140);

    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;

    const x = 16, y = 14, w = 480, h = 96, r = 24;

    // Parchment badge gradient
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, "rgba(254, 243, 199, 0.96)");
    grad.addColorStop(1, "rgba(253, 230, 138, 0.93)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Reset shadow for crisp borders & text
    ctx.shadowColor = "transparent";

    // Theme outer border
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = themeColor || "#b45309";
    ctx.stroke();

    // Inner storybook ink line
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(180, 83, 9, 0.35)";
    ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

    // Left Icon Badge Circle
    ctx.beginPath();
    ctx.arc(x + 48, y + h / 2, 28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = themeColor || "#b45309";
    ctx.stroke();

    // Draw Emoji
    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x + 48, y + h / 2 + 2);

    // Draw Title
    ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
    ctx.fillStyle = "#1c1917";
    ctx.textAlign = "left";
    ctx.fillText(title, x + 92, y + h / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(3.8, 1.05, 1);
  return sprite;
}

/**
 * Creates an authentic Studio Ghibli-styled whimsical world:
 * - Cel-shaded materials with discrete stepped tone maps
 * - Silhouette ink outlines around cottage walls, roofs, and gables
 * - Warm earthy palette (terracotta tiles, sunlit stucco, walnut timber, riverstone foundations)
 * - Beautiful floating Storybook labels for all village cottages
 * - Glistening rainy weather system with raindrops, splashes, and wet sheen
 * - Grass tufts and wildflowers strictly hugging houses (zero on roads)
 */
export function createGhibliEnvironment(
  scene: THREE.Scene,
  landmarks: LandmarkInfo[],
  collisionEngine: RoadCollisionEngine,
  initialAtmosphere: GhibliAtmosphere = "rainy"
): GhibliEnvironmentResult {
  const environmentGroup = new THREE.Group();
  environmentGroup.name = "StudioGhibliEnvironment";

  let currentAtmosphere = initialAtmosphere;
  const config = GHIBLI_ATMOSPHERES[initialAtmosphere];

  // ---------------------------------------------------------------------------
  // 1. GHIBLI SKY DOME & VOLUMETRIC CUMULUS CLOUDS
  // ---------------------------------------------------------------------------
  const skyGeo = new THREE.SphereGeometry(180, 32, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    color: config.skyTop,
    side: THREE.BackSide,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  environmentGroup.add(skyDome);

  // Stylized Fluffy Cel-Shaded Clouds
  const cloudGroup = new THREE.Group();
  const cloudCount = 14;
  const cloudMeshes: THREE.Group[] = [];
  const cloudPuffMat = createCelMaterial({
    color: "#ffffff",
    steps: 3,
  });

  for (let i = 0; i < cloudCount; i++) {
    const cloud = new THREE.Group();
    const puffCount = 5 + Math.floor(Math.random() * 4);
    const cloudRadius = 20 + Math.random() * 25;
    const angle = (i / cloudCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const height = 18 + Math.random() * 12;

    cloud.position.set(
      Math.cos(angle) * cloudRadius,
      height,
      Math.sin(angle) * cloudRadius
    );

    for (let p = 0; p < puffCount; p++) {
      const puffR = 1.6 + Math.random() * 1.8;
      const puffGeo = new THREE.DodecahedronGeometry(puffR, 1);
      const puff = new THREE.Mesh(puffGeo, cloudPuffMat);
      puff.position.set(
        (p - puffCount / 2) * 1.6 + (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 1.2
      );
      puff.castShadow = true;
      cloud.add(puff);
    }
    cloudMeshes.push(cloud);
    cloudGroup.add(cloud);
  }
  environmentGroup.add(cloudGroup);

  // ---------------------------------------------------------------------------
  // 2. THREE.JS INSTANCED MESH VILLAGE COTTAGES & STRUCTURES
  // ---------------------------------------------------------------------------
  const cottageGroup = new THREE.Group();
  cottageGroup.name = "GhibliVillageCottages";

  // Warm Earthy Palette for Ghibli village cottages
  const timberColor = "#451a03"; // Rich walnut timber
  const foundationColor = "#78716c"; // Riverstone cobblestone

  // Chimney Smoke Particles (Cel-shaded)
  const smokePuffs: Array<{ mesh: THREE.Mesh; initialY: number; speed: number; phase: number }> = [];
  const smokeMat = createCelMaterial({
    color: "#f8fafc",
    transparent: true,
    opacity: 0.65,
    steps: 2,
  });

  // House Locations in the 4 Quad Meadow Sectors (strictly off-road)
  const validHouses = VILLAGE_HOUSES.filter(
    (h) => !collisionEngine.isPositionOnRoad(h.x, h.z, 1.8)
  );
  const houseCount = validHouses.length;

  const houseFootprints: Array<{ x: number; z: number; radius: number }> = [];
  const houseLabels: THREE.Sprite[] = [];

  // Geometries for Instanced Cottages
  const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 2.0);
  const wallGeo = new THREE.BoxGeometry(2.2, 1.5, 1.8);
  const roofGeo = new THREE.ConeGeometry(1.8, 1.3, 4);
  roofGeo.rotateY(Math.PI / 4);
  const postGeo = new THREE.BoxGeometry(0.12, 1.52, 0.12);
  const fasciaGeo = new THREE.BoxGeometry(2.24, 0.1, 1.84);
  const dormerGeo = new THREE.BoxGeometry(0.5, 0.45, 0.45);
  const dormerRoofGeo = new THREE.ConeGeometry(0.42, 0.35, 4);
  dormerRoofGeo.rotateY(Math.PI / 4);
  const winFrameGeo = new THREE.BoxGeometry(0.56, 0.52, 0.09);
  const winGlassGeo = new THREE.BoxGeometry(0.48, 0.44, 0.08);
  const flowerBoxGeo = new THREE.BoxGeometry(0.6, 0.15, 0.2);
  const doorGeo = new THREE.BoxGeometry(0.45, 0.85, 0.08);
  const stepGeo = new THREE.BoxGeometry(0.65, 0.18, 0.35);
  const lanternGeo = new THREE.BoxGeometry(0.12, 0.18, 0.12);
  const chimGeo = new THREE.BoxGeometry(0.32, 0.95, 0.32);
  const fenceGeo = new THREE.BoxGeometry(0.06, 0.35, 0.06);
  const railGeo = new THREE.BoxGeometry(1.2, 0.04, 0.04);

  // Materials for Instanced Cottages
  const baseMat = createCelMaterial({ color: foundationColor, steps: 3 });
  const wallMat = createCelMaterial({ color: "#ffffff", steps: 3 });
  const roofMat = createCelMaterial({ color: "#ffffff", steps: 3 });
  const beamMat = createCelMaterial({ color: timberColor, steps: 2 });
  const chimMat = createCelMaterial({ color: "#7c2d12", steps: 3 });
  const winMat = createCelMaterial({
    color: "#fef08a",
    emissive: "#eab308",
    emissiveIntensity: config.windowEmissiveIntensity,
    steps: 2,
  });
  const lanternMat = createCelMaterial({
    color: "#fde047",
    emissive: "#f59e0b",
    emissiveIntensity: config.lanternIntensity,
    steps: 2,
  });

  // Cel-Shading Silhouette Ink Outline Material (Ghibli hand-drawn contour)
  const outlineMat = new THREE.MeshBasicMaterial({
    color: "#1c1917",
    side: THREE.BackSide,
    depthWrite: true,
  });

  const windowMaterials: THREE.MeshToonMaterial[] = [winMat];
  const lanternMaterials: THREE.MeshToonMaterial[] = [lanternMat];

  // Instanced Meshes for high-performance rendering
  const baseInstanced = new THREE.InstancedMesh(baseGeo, baseMat, houseCount);
  const wallInstanced = new THREE.InstancedMesh(wallGeo, wallMat, houseCount);
  const roofInstanced = new THREE.InstancedMesh(roofGeo, roofMat, houseCount);
  const postInstanced = new THREE.InstancedMesh(postGeo, beamMat, houseCount * 4);
  const fasciaInstanced = new THREE.InstancedMesh(fasciaGeo, beamMat, houseCount);
  const dormerInstanced = new THREE.InstancedMesh(dormerGeo, wallMat, houseCount);
  const dormerRoofInstanced = new THREE.InstancedMesh(dormerRoofGeo, roofMat, houseCount);
  const winFrameInstanced = new THREE.InstancedMesh(winFrameGeo, beamMat, houseCount);
  const winGlassInstanced = new THREE.InstancedMesh(winGlassGeo, winMat, houseCount);
  const flowerBoxInstanced = new THREE.InstancedMesh(flowerBoxGeo, beamMat, houseCount);
  const doorInstanced = new THREE.InstancedMesh(doorGeo, beamMat, houseCount);
  const stepInstanced = new THREE.InstancedMesh(stepGeo, baseMat, houseCount);
  const lanternInstanced = new THREE.InstancedMesh(lanternGeo, lanternMat, houseCount);
  const chimInstanced = new THREE.InstancedMesh(chimGeo, chimMat, houseCount);
  const fencePicketInstanced = new THREE.InstancedMesh(fenceGeo, beamMat, houseCount * 4);
  const fenceRailInstanced = new THREE.InstancedMesh(railGeo, beamMat, houseCount);

  // Instanced Cel-Shaded Silhouette Outlines
  const baseOutlineInstanced = new THREE.InstancedMesh(baseGeo, outlineMat, houseCount);
  const wallOutlineInstanced = new THREE.InstancedMesh(wallGeo, outlineMat, houseCount);
  const roofOutlineInstanced = new THREE.InstancedMesh(roofGeo, outlineMat, houseCount);
  const chimOutlineInstanced = new THREE.InstancedMesh(chimGeo, outlineMat, houseCount);
  const dormerOutlineInstanced = new THREE.InstancedMesh(dormerGeo, outlineMat, houseCount);
  const dormerRoofOutlineInstanced = new THREE.InstancedMesh(dormerRoofGeo, outlineMat, houseCount);

  baseInstanced.castShadow = true;
  baseInstanced.receiveShadow = true;
  wallInstanced.castShadow = true;
  wallInstanced.receiveShadow = true;
  roofInstanced.castShadow = true;
  roofInstanced.receiveShadow = true;
  chimInstanced.castShadow = true;

  const dummyMatrix = new THREE.Matrix4();
  const localMatrix = new THREE.Matrix4();
  const houseMatrix = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const rot = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();

  validHouses.forEach((houseData, hIdx) => {
    houseFootprints.push({ x: houseData.x, z: houseData.z, radius: 2.2 * houseData.scale });

    // Build House World Matrix
    pos.set(houseData.x, 0, houseData.z);
    rot.set(0, houseData.rot, 0);
    quat.setFromEuler(rot);
    scl.setScalar(houseData.scale);
    houseMatrix.compose(pos, quat, scl);

    // 1. Foundation Base & Silhouette Outline
    pos.set(0, 0.2, 0);
    quat.set(0, 0, 0, 1);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    baseInstanced.setMatrixAt(hIdx, dummyMatrix);

    scl.set(1.035, 1.035, 1.035);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    baseOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 2. Wall (with per-instance stucco color) & Silhouette Outline
    pos.set(0, 1.15, 0);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    wallInstanced.setMatrixAt(hIdx, dummyMatrix);
    wallInstanced.setColorAt(hIdx, new THREE.Color(houseData.wall));

    scl.set(1.035, 1.035, 1.035);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    wallOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 3. Roof (with per-instance tile color) & Silhouette Outline
    pos.set(0, 2.55, 0);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    roofInstanced.setMatrixAt(hIdx, dummyMatrix);
    roofInstanced.setColorAt(hIdx, new THREE.Color(houseData.roof));

    scl.set(1.045, 1.045, 1.045);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    roofOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 4. Timber Posts (4 per house)
    const postOffsets = [
      [-1.1, 1.15, -0.9],
      [1.1, 1.15, -0.9],
      [-1.1, 1.15, 0.9],
      [1.1, 1.15, 0.9],
    ];
    scl.set(1, 1, 1);
    postOffsets.forEach(([px, py, pz], pIdx) => {
      pos.set(px, py, pz);
      localMatrix.compose(pos, quat, scl);
      dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
      postInstanced.setMatrixAt(hIdx * 4 + pIdx, dummyMatrix);
    });

    // 5. Fascia
    pos.set(0, 1.88, 0);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    fasciaInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 6. Dormer Wall & Roof & Silhouette Outlines
    pos.set(0, 2.3, 0.85);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    dormerInstanced.setMatrixAt(hIdx, dummyMatrix);
    dormerInstanced.setColorAt(hIdx, new THREE.Color(houseData.wall));

    scl.set(1.04, 1.04, 1.04);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    dormerOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    pos.set(0, 2.65, 0.85);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    dormerRoofInstanced.setMatrixAt(hIdx, dummyMatrix);
    dormerRoofInstanced.setColorAt(hIdx, new THREE.Color(houseData.roof));

    scl.set(1.045, 1.045, 1.045);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    dormerRoofOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 7. Window Frame & Glass
    scl.set(1, 1, 1);
    pos.set(0.55, 1.25, 0.91);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    winFrameInstanced.setMatrixAt(hIdx, dummyMatrix);

    pos.set(0.55, 1.25, 0.93);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    winGlassInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 8. Flower Box
    pos.set(0.55, 0.95, 0.98);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    flowerBoxInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 9. Door & Step
    pos.set(-0.45, 0.82, 0.92);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    doorInstanced.setMatrixAt(hIdx, dummyMatrix);

    pos.set(-0.45, 0.09, 1.1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    stepInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 10. Lantern
    pos.set(-0.15, 1.3, 0.96);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    lanternInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 11. Chimney & Silhouette Outline
    pos.set(0.65, 2.7, -0.4);
    scl.set(1, 1, 1);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    chimInstanced.setMatrixAt(hIdx, dummyMatrix);

    scl.set(1.05, 1.05, 1.05);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    chimOutlineInstanced.setMatrixAt(hIdx, dummyMatrix);

    // 12. Fence Rail & Pickets
    scl.set(1, 1, 1);
    pos.set(1.4, 0.22, 1.2);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
    fenceRailInstanced.setMatrixAt(hIdx, dummyMatrix);

    for (let pick = 0; pick < 4; pick++) {
      pos.set(0.95 + pick * 0.3, 0.2, 1.2);
      localMatrix.compose(pos, quat, scl);
      dummyMatrix.multiplyMatrices(houseMatrix, localMatrix);
      fencePicketInstanced.setMatrixAt(hIdx * 4 + pick, dummyMatrix);
    }

    // 13. Floating Storybook Billboard Label Sprite above rooftop
    const labelSprite = createStorybookLabelSprite(
      houseData.name,
      houseData.emoji,
      houseData.themeColor
    );
    labelSprite.position.set(
      houseData.x,
      (3.6 + (hIdx % 2) * 0.4) * houseData.scale,
      houseData.z
    );
    labelSprite.userData = { initialY: labelSprite.position.y, phase: hIdx * 0.8 };
    environmentGroup.add(labelSprite);
    houseLabels.push(labelSprite);

    // 14. Cute Carved Shop Signpost by Path Entry
    const signpostGroup = new THREE.Group();
    signpostGroup.position.set(
      houseData.x + 1.35 * houseData.scale,
      0,
      houseData.z + 1.35 * houseData.scale
    );
    const postMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8),
      beamMat
    );
    postMesh.position.y = 0.65;
    signpostGroup.add(postMesh);

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.28, 0.05),
      createCelMaterial({ color: houseData.themeColor, steps: 2 })
    );
    signBoard.position.set(0, 1.15, 0);
    signpostGroup.add(signBoard);

    const postLantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      lanternMat
    );
    postLantern.position.set(0.2, 1.15, 0);
    signpostGroup.add(postLantern);

    environmentGroup.add(signpostGroup);

    // 3 animated smoke puffs per chimney
    for (let s = 0; s < 3; s++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15 + s * 0.08, 1), smokeMat);
      puff.position.set(
        houseData.x + 0.65 * houseData.scale,
        (3.3 + s * 0.5) * houseData.scale,
        houseData.z - 0.4 * houseData.scale
      );
      smokePuffs.push({
        mesh: puff,
        initialY: 3.3 * houseData.scale,
        speed: 0.6 + Math.random() * 0.4,
        phase: s * 1.2 + hIdx,
      });
      environmentGroup.add(puff);
    }
  });

  // Notify Three.js of instanced mesh updates
  [
    baseInstanced,
    baseOutlineInstanced,
    wallInstanced,
    wallOutlineInstanced,
    roofInstanced,
    roofOutlineInstanced,
    postInstanced,
    fasciaInstanced,
    dormerInstanced,
    dormerOutlineInstanced,
    dormerRoofInstanced,
    dormerRoofOutlineInstanced,
    winFrameInstanced,
    winGlassInstanced,
    flowerBoxInstanced,
    doorInstanced,
    stepInstanced,
    lanternInstanced,
    chimInstanced,
    chimOutlineInstanced,
    fencePicketInstanced,
    fenceRailInstanced,
  ].forEach((mesh) => {
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    cottageGroup.add(mesh);
  });

  environmentGroup.add(cottageGroup);

  // ---------------------------------------------------------------------------
  // 3. THREE.JS INSTANCED MESH GHIBLI TREES & CANOPIES
  // ---------------------------------------------------------------------------
  const treeGroup = new THREE.Group();
  treeGroup.name = "GhibliMeadowTrees";
  const trunkMat = createCelMaterial({ color: "#3f1d14", steps: 2 });
  const treeCrownMat = createCelMaterial({ color: "#ffffff", steps: 3 });

  // Candidate Tree Locations in Meadow Clearings
  const candidateTrees = [
    { x: -13.5, z: -13.5, s: 1.2, color: "#15803d" },
    { x: -14.2, z: -3.5, s: 1.0, color: "#16a34a" },
    { x: -4.5, z: -14.2, s: 1.1, color: "#22c55e" },
    { x: 13.5, z: -13.5, s: 1.25, color: "#15803d" },
    { x: 14.5, z: -4.2, s: 1.05, color: "#65a30d" },
    { x: 4.2, z: -14.5, s: 0.95, color: "#16a34a" },
    { x: -13.5, z: 13.5, s: 1.2, color: "#22c55e" },
    { x: -14.5, z: 4.2, s: 1.0, color: "#15803d" },
    { x: -4.2, z: 14.5, s: 1.1, color: "#65a30d" },
    { x: 13.5, z: 13.5, s: 1.3, color: "#16a34a" },
    { x: 14.5, z: 3.8, s: 1.05, color: "#22c55e" },
    { x: 3.8, z: 14.5, s: 1.0, color: "#15803d" },
  ];

  const validTrees = candidateTrees.filter(
    (t) => !collisionEngine.isPositionOnRoad(t.x, t.z, 1.2)
  );
  const treeCount = validTrees.length;

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.8, 8);
  const crownGeo1 = new THREE.DodecahedronGeometry(1.2, 1);
  const crownGeo2 = new THREE.DodecahedronGeometry(0.85, 1);

  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
  const crown1Instanced = new THREE.InstancedMesh(crownGeo1, treeCrownMat, treeCount);
  const crown2Instanced = new THREE.InstancedMesh(crownGeo2, treeCrownMat, treeCount);

  trunkInstanced.castShadow = true;
  crown1Instanced.castShadow = true;
  crown2Instanced.castShadow = true;

  const treeMatrix = new THREE.Matrix4();

  validTrees.forEach((tData, tIdx) => {
    pos.set(tData.x, 0, tData.z);
    rot.set(0, 0, 0);
    quat.setFromEuler(rot);
    scl.setScalar(tData.s);
    treeMatrix.compose(pos, quat, scl);

    // Trunk
    pos.set(0, 0.9, 0);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(treeMatrix, localMatrix);
    trunkInstanced.setMatrixAt(tIdx, dummyMatrix);

    // Crown 1
    pos.set(0, 2.4, 0);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(treeMatrix, localMatrix);
    crown1Instanced.setMatrixAt(tIdx, dummyMatrix);
    crown1Instanced.setColorAt(tIdx, new THREE.Color(tData.color));

    // Crown 2
    pos.set(0.35, 3.2, 0.2);
    localMatrix.compose(pos, quat, scl);
    dummyMatrix.multiplyMatrices(treeMatrix, localMatrix);
    crown2Instanced.setMatrixAt(tIdx, dummyMatrix);
    crown2Instanced.setColorAt(tIdx, new THREE.Color(tData.color));
  });

  [trunkInstanced, crown1Instanced, crown2Instanced].forEach((m) => {
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    treeGroup.add(m);
  });

  environmentGroup.add(treeGroup);

  // ---------------------------------------------------------------------------
  // 4. GHIBLI WINDMILL LANDMARK AT NORTH OBSERVATORY
  // ---------------------------------------------------------------------------
  const windmillGroup = new THREE.Group();
  windmillGroup.position.set(0, 0, -13.5);

  const millTowerGeo = new THREE.CylinderGeometry(1.2, 1.7, 5.2, 16);
  const millTowerMat = createCelMaterial({ color: "#fffbeb", steps: 3 });
  const millTower = new THREE.Mesh(millTowerGeo, millTowerMat);
  millTower.position.y = 2.6;
  millTower.castShadow = true;
  millTower.receiveShadow = true;
  windmillGroup.add(millTower);

  const millOutline = createSilhouetteOutline(millTowerGeo, "#292524", 1.03);
  millOutline.position.y = 2.6;
  windmillGroup.add(millOutline);

  const millCapGeo = new THREE.ConeGeometry(1.4, 1.2, 16);
  const millCapMat = createCelMaterial({ color: "#c2410c", steps: 3 });
  const millCap = new THREE.Mesh(millCapGeo, millCapMat);
  millCap.position.y = 5.8;
  millCap.castShadow = true;
  windmillGroup.add(millCap);

  const millCapOutline = createSilhouetteOutline(millCapGeo, "#1c1917", 1.04);
  millCapOutline.position.y = 5.8;
  windmillGroup.add(millCapOutline);

  // Rotating Windmill Sails
  const sailsGroup = new THREE.Group();
  sailsGroup.position.set(0, 5.0, 1.35);

  const hubGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12);
  const hubMat = createCelMaterial({ color: timberColor, steps: 2 });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.x = Math.PI / 2;
  sailsGroup.add(hub);

  const sailGeo = new THREE.BoxGeometry(0.35, 2.2, 0.04);
  sailGeo.translate(0, 1.1, 0);
  const sailMat = createCelMaterial({ color: "#f8fafc", steps: 2 });

  for (let s = 0; s < 4; s++) {
    const blade = new THREE.Mesh(sailGeo, sailMat);
    blade.rotation.z = (s * Math.PI) / 2;
    blade.castShadow = true;
    sailsGroup.add(blade);
  }
  windmillGroup.add(sailsGroup);
  environmentGroup.add(windmillGroup);

  // ---------------------------------------------------------------------------
  // 5. VIBRANT GRASS TUFTS & WILDFLOWERS (EXCLUSIVELY AROUND HOUSES & GARDENS)
  // ---------------------------------------------------------------------------
  const totalTufts = 950;
  const grassGeo = new THREE.ConeGeometry(0.18, 0.55, 3);
  grassGeo.translate(0, 0.275, 0);
  const grassMat = createCelMaterial({
    color: "#22c55e",
    steps: 3,
  });
  const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, totalTufts);
  grassInstanced.receiveShadow = true;

  // Wildflower Instanced Mesh (Daisies, Poppies, Buttercups, Lavender)
  const totalFlowers = 400;
  const flowerGeo = new THREE.DodecahedronGeometry(0.14, 1);
  flowerGeo.translate(0, 0.35, 0);
  const flowerMat = createCelMaterial({ color: "#ffffff", steps: 2 });
  const flowerInstanced = new THREE.InstancedMesh(flowerGeo, flowerMat, totalFlowers);

  // Vibrant Ghibli Green hues for grass
  const grassHues = [
    new THREE.Color("#22c55e"), // Vibrant emerald
    new THREE.Color("#4ade80"), // Spring clover
    new THREE.Color("#16a34a"), // Forest moss
    new THREE.Color("#86efac"), // Pale dew green
    new THREE.Color("#10b981"), // Mint meadow
    new THREE.Color("#a3e635"), // Warm sunlit chartreuse
    new THREE.Color("#84cc16"), // Lime clover
  ];

  // Warm Ghibli Blossom Palette
  const flowerHues = [
    new THREE.Color("#ef4444"), // Red Poppy
    new THREE.Color("#facc15"), // Yellow Buttercup
    new THREE.Color("#f8fafc"), // White Daisy
    new THREE.Color("#ec4899"), // Pink Blossom
    new THREE.Color("#a855f7"), // Purple Lavender
    new THREE.Color("#fb923c"), // Orange Marigold
  ];

  const dummy = new THREE.Object3D();
  let placedGrass = 0;
  let placedFlowers = 0;

  // Strategy: Distribute grass and flowers primarily HUGGING house foundations and garden circles
  houseFootprints.forEach((house) => {
    // Place 30-40 grass tufts in a ring surrounding each cottage
    const houseGrass = 38;
    for (let g = 0; g < houseGrass; g++) {
      if (placedGrass >= totalTufts) break;
      const angle = Math.random() * Math.PI * 2;
      const dist = house.radius * (0.85 + Math.random() * 0.9);
      const gx = house.x + Math.cos(angle) * dist;
      const gz = house.z + Math.sin(angle) * dist;

      // STRICT VALIDATION: Never place on road!
      if (!collisionEngine.isPositionOnRoad(gx, gz, 0.45)) {
        dummy.position.set(gx, 0.02, gz);
        dummy.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2);
        const s = 0.8 + Math.random() * 0.6;
        dummy.scale.set(s, s * (0.9 + Math.random() * 0.5), s);
        dummy.updateMatrix();

        grassInstanced.setMatrixAt(placedGrass, dummy.matrix);
        grassInstanced.setColorAt(placedGrass, grassHues[Math.floor(Math.random() * grassHues.length)]);
        placedGrass++;
      }
    }

    // Place 15-20 flowers around each cottage
    const houseFlowers = 18;
    for (let f = 0; f < houseFlowers; f++) {
      if (placedFlowers >= totalFlowers) break;
      const angle = Math.random() * Math.PI * 2;
      const dist = house.radius * (0.9 + Math.random() * 0.8);
      const fx = house.x + Math.cos(angle) * dist;
      const fz = house.z + Math.sin(angle) * dist;

      if (!collisionEngine.isPositionOnRoad(fx, fz, 0.45)) {
        dummy.position.set(fx, 0.02, fz);
        dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
        const s = 0.7 + Math.random() * 0.5;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        flowerInstanced.setMatrixAt(placedFlowers, dummy.matrix);
        flowerInstanced.setColorAt(placedFlowers, flowerHues[Math.floor(Math.random() * flowerHues.length)]);
        placedFlowers++;
      }
    }
  });

  // Fill remaining grass in meadow clearings (strictly checking off-road)
  let attempts = 0;
  while (placedGrass < totalTufts && attempts < 1500) {
    attempts++;
    const gx = (Math.random() - 0.5) * 32;
    const gz = (Math.random() - 0.5) * 32;

    if (!collisionEngine.isPositionOnRoad(gx, gz, 0.65)) {
      dummy.position.set(gx, 0.02, gz);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      const s = 0.7 + Math.random() * 0.6;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      grassInstanced.setMatrixAt(placedGrass, dummy.matrix);
      grassInstanced.setColorAt(placedGrass, grassHues[Math.floor(Math.random() * grassHues.length)]);
      placedGrass++;
    }
  }

  while (placedFlowers < totalFlowers && attempts < 2500) {
    attempts++;
    const fx = (Math.random() - 0.5) * 32;
    const fz = (Math.random() - 0.5) * 32;

    if (!collisionEngine.isPositionOnRoad(fx, fz, 0.65)) {
      dummy.position.set(fx, 0.02, fz);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      const s = 0.7 + Math.random() * 0.5;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      flowerInstanced.setMatrixAt(placedFlowers, dummy.matrix);
      flowerInstanced.setColorAt(placedFlowers, flowerHues[Math.floor(Math.random() * flowerHues.length)]);
      placedFlowers++;
    }
  }

  grassInstanced.instanceMatrix.needsUpdate = true;
  if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
  environmentGroup.add(grassInstanced);

  flowerInstanced.instanceMatrix.needsUpdate = true;
  if (flowerInstanced.instanceColor) flowerInstanced.instanceColor.needsUpdate = true;
  environmentGroup.add(flowerInstanced);

  // ---------------------------------------------------------------------------
  // 6. FLOATING DANDELION / FIREFLY SPORES & RAIN PARTICLES
  // ---------------------------------------------------------------------------
  const sporeCount = 60;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  for (let i = 0; i < sporeCount * 3; i += 3) {
    sporePos[i] = (Math.random() - 0.5) * 34;
    sporePos[i + 1] = Math.random() * 6 + 0.3;
    sporePos[i + 2] = (Math.random() - 0.5) * 34;
  }
  sporeGeo.setAttribute("position", new THREE.BufferAttribute(sporePos, 3));
  const sporeMat = new THREE.PointsMaterial({
    color: "#fef08a",
    size: 0.16,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });
  const sporeSystem = new THREE.Points(sporeGeo, sporeMat);
  environmentGroup.add(sporeSystem);

  // Dynamic Rainy Atmosphere Streaks & Splashes
  const rainCount = 1600;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  const rainVelocities = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 45;
    rainPositions[i * 3 + 1] = Math.random() * 22;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 45;
    rainVelocities[i] = 18 + Math.random() * 10;
  }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));

  const rainMat = new THREE.PointsMaterial({
    color: "#93c5fd",
    size: 0.18,
    transparent: true,
    opacity: initialAtmosphere === "rainy" ? 0.75 : 0.0,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const rainSystem = new THREE.Points(rainGeo, rainMat);
  environmentGroup.add(rainSystem);

  // Expanding Puddle Splash Rings
  const splashCount = 40;
  const splashGeo = new THREE.RingGeometry(0.05, 0.18, 16);
  splashGeo.rotateX(-Math.PI / 2);
  const splashMat = new THREE.MeshBasicMaterial({
    color: "#bfdbfe",
    transparent: true,
    opacity: initialAtmosphere === "rainy" ? 0.45 : 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const splashInstanced = new THREE.InstancedMesh(splashGeo, splashMat, splashCount);
  const splashData: Array<{ x: number; z: number; progress: number; speed: number }> = [];
  const splashDummy = new THREE.Object3D();

  for (let i = 0; i < splashCount; i++) {
    const sx = (Math.random() - 0.5) * 36;
    const sz = (Math.random() - 0.5) * 36;
    splashData.push({
      x: sx,
      z: sz,
      progress: Math.random(),
      speed: 0.8 + Math.random() * 0.8,
    });
  }
  environmentGroup.add(splashInstanced);

  scene.add(environmentGroup);

  // ---------------------------------------------------------------------------
  // 7. ATMOSPHERE SWITCHER
  // ---------------------------------------------------------------------------
  const setAtmosphere = (mode: GhibliAtmosphere) => {
    currentAtmosphere = mode;
    const cfg = GHIBLI_ATMOSPHERES[mode];

    skyMat.color.set(cfg.skyTop);
    if (scene.fog) {
      scene.fog.color.set(cfg.fogColor);
      (scene.fog as THREE.FogExp2).density = cfg.fogDensity;
    }
    scene.background = new THREE.Color(cfg.skyBottom);

    windowMaterials.forEach((mat) => {
      mat.emissiveIntensity = cfg.windowEmissiveIntensity;
      mat.needsUpdate = true;
    });

    lanternMaterials.forEach((mat) => {
      mat.emissiveIntensity = cfg.lanternIntensity;
      mat.needsUpdate = true;
    });

    sporeMat.color.set(mode === "night" ? "#4ade80" : mode === "sunset" ? "#fed7aa" : "#fef08a");
    sporeMat.size = mode === "night" ? 0.22 : 0.16;

    // Rain particles visibility & intensity
    const isRain = mode === "rainy";
    rainMat.opacity = isRain ? 0.75 : 0.0;
    splashMat.opacity = isRain ? 0.45 : 0.0;
  };

  // ---------------------------------------------------------------------------
  // 8. ANIMATION LOOP UPDATER
  // ---------------------------------------------------------------------------
  const updateAnimation = (time: number, delta: number, isReducedMotion = false) => {
    // Rotate windmill sails smoothly
    if (!isReducedMotion) {
      sailsGroup.rotation.z += delta * 0.8;
    }

    // Drift clouds across sky
    if (!isReducedMotion) {
      cloudGroup.rotation.y = time * 0.015;
    }

    // Gentle wind sway on grass and flowers
    if (!isReducedMotion) {
      const windSway = Math.sin(time * 2.4) * 0.035;
      grassInstanced.rotation.z = windSway;
      flowerInstanced.rotation.z = windSway * 0.8;
    }

    // Floating storybook billboard label gentle bobbing
    if (!isReducedMotion) {
      houseLabels.forEach((label) => {
        const initY = label.userData.initialY || label.position.y;
        const ph = label.userData.phase || 0;
        label.position.y = initY + Math.sin(time * 2.2 + ph) * 0.12;
      });
    }

    // Animate chimney smoke rising and puffing
    if (!isReducedMotion) {
      smokePuffs.forEach((puff) => {
        const elapsed = (time * puff.speed + puff.phase) % 3.0;
        puff.mesh.position.y = puff.initialY + elapsed * 0.7;
        const scale = 1.0 + elapsed * 0.8;
        puff.mesh.scale.set(scale, scale, scale);
        // Fade opacity as it ascends
        (puff.mesh.material as THREE.MeshToonMaterial).opacity = Math.max(
          0,
          0.7 - elapsed * 0.22
        );
      });
    }

    // Animate floating spores / fireflies
    if (!isReducedMotion) {
      const positions = sporeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sporeCount; i++) {
        const yIdx = i * 3 + 1;
        const xIdx = i * 3;
        positions[yIdx] += delta * 0.2;
        positions[xIdx] += Math.sin(time * 2 + i) * 0.01;
        if (positions[yIdx] > 6.5) {
          positions[yIdx] = 0.3;
        }
      }
      sporeGeo.attributes.position.needsUpdate = true;
    }

    // Animate falling rain streaks and puddle splash rings
    if (!isReducedMotion && currentAtmosphere === "rainy") {
      const rPos = rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        const yIdx = i * 3 + 1;
        const xIdx = i * 3;
        rPos[yIdx] -= rainVelocities[i] * delta;
        rPos[xIdx] -= delta * 1.5; // Wind tilt
        if (rPos[yIdx] <= 0.05) {
          rPos[yIdx] = 18 + Math.random() * 4;
          rPos[xIdx] = (Math.random() - 0.5) * 45;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Animate puddle splash rings
      splashData.forEach((sp, idx) => {
        sp.progress += delta * sp.speed;
        if (sp.progress >= 1.0) {
          sp.progress = 0.0;
          sp.x = (Math.random() - 0.5) * 36;
          sp.z = (Math.random() - 0.5) * 36;
        }
        const currentScale = 0.4 + sp.progress * 1.6;
        splashDummy.position.set(sp.x, 0.03, sp.z);
        splashDummy.scale.set(currentScale, currentScale, currentScale);
        splashDummy.updateMatrix();
        splashInstanced.setMatrixAt(idx, splashDummy.matrix);
      });
      splashInstanced.instanceMatrix.needsUpdate = true;
    }
  };

  // ---------------------------------------------------------------------------
  // 9. DISPOSAL
  // ---------------------------------------------------------------------------
  const dispose = () => {
    scene.remove(environmentGroup);
    skyGeo.dispose();
    skyMat.dispose();
    grassGeo.dispose();
    grassMat.dispose();
    flowerGeo.dispose();
    flowerMat.dispose();
    sporeGeo.dispose();
    sporeMat.dispose();
    rainGeo.dispose();
    rainMat.dispose();
    splashGeo.dispose();
    splashMat.dispose();
    millTowerGeo.dispose();
    millCapGeo.dispose();
    smokeMat.dispose();
  };

  return {
    environmentGroup,
    updateAnimation,
    setAtmosphere,
    currentAtmosphere,
    validHouses,
    dispose,
  };
}
