import * as THREE from "three";
import { AsphaltTheme, createAsphaltTexture, createRoadStripTexture, createCrosswalkTexture } from "./asphaltGenerator";
import { LandmarkInfo } from "../components/ThreeTownScene";
import { createCelMaterial, createSilhouetteOutline } from "./celShading";

export interface RoadNetworkResult {
  roadGroup: THREE.Group;
  updateRoadTheme: (theme: AsphaltTheme) => void;
}

/**
 * Builds an expansive Studio Ghibli cel-shaded 3D road network with vast distances between towns,
 * long driving highways, scenic ring loops, stone curbs, hand-drawn ink outlines, and road markings.
 */
export function buildRoadNetwork(
  scene: THREE.Scene,
  landmarks: LandmarkInfo[],
  initialTheme: AsphaltTheme = "fresh"
): RoadNetworkResult {
  const roadGroup = new THREE.Group();
  roadGroup.name = "GhibliCelShadedRoadNetwork";

  // Dynamic material references for theme updates
  let currentTheme = initialTheme;
  const materialsToUpdate: Array<{ mat: THREE.MeshToonMaterial; type: "ground" | "road" | "plaza" }> = [];

  // Generate base textures
  const { diffuse, bumpMap } = createAsphaltTexture(initialTheme);
  const roadStripTex = createRoadStripTexture(initialTheme, true, false);
  const roadStripDoubleTex = createRoadStripTexture(initialTheme, false, true);
  const crosswalkTex = createCrosswalkTexture();

  // 1. EXPANSIVE SURROUNDING GROUND TERRAIN (Vibrant Ghibli Meadow Canvas)
  const terrainGeo = new THREE.PlaneGeometry(360, 360);
  const terrainMat = createCelMaterial({
    color: "#22c55e",
    steps: 3,
  });
  materialsToUpdate.push({ mat: terrainMat, type: "ground" });
  const terrain = new THREE.Mesh(terrainGeo, terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.02;
  terrain.receiveShadow = true;
  roadGroup.add(terrain);

  // 2. CENTRAL GRAND CEL-SHADED ROUNDABOUT / PLAZA
  const roundaboutRadius = 8.5;
  const plazaGeo = new THREE.CylinderGeometry(roundaboutRadius, roundaboutRadius, 0.1, 48);
  const plazaMat = createCelMaterial({
    color: initialTheme === "wet" ? "#1e293b" : "#334155",
    map: diffuse,
    bumpMap: bumpMap,
    bumpScale: 0.04,
    steps: 3,
  });
  materialsToUpdate.push({ mat: plazaMat, type: "plaza" });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.05, 0);
  plaza.receiveShadow = true;
  roadGroup.add(plaza);

  const plazaOutline = createSilhouetteOutline(plazaGeo, "#1c1917", 1.02);
  plazaOutline.position.set(0, 0.05, 0);
  roadGroup.add(plazaOutline);

  // Roundabout Center Island (Lush Ghibli Garden / Park fountain base)
  const islandGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.28, 32);
  const islandMat = createCelMaterial({
    color: "#16a34a",
    steps: 3,
  });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.set(0, 0.18, 0);
  island.receiveShadow = true;
  island.castShadow = true;
  roadGroup.add(island);

  const islandOutline = createSilhouetteOutline(islandGeo, "#14532d", 1.03);
  islandOutline.position.set(0, 0.18, 0);
  roadGroup.add(islandOutline);

  // Island Beveled Riverstone Curb Ring
  const islandCurbGeo = new THREE.TorusGeometry(3.8, 0.1, 12, 48);
  const curbMat = createCelMaterial({
    color: "#fed7aa", // Warm sandstone
    steps: 3,
  });
  const islandCurb = new THREE.Mesh(islandCurbGeo, curbMat);
  islandCurb.rotation.x = Math.PI / 2;
  islandCurb.position.set(0, 0.24, 0);
  roadGroup.add(islandCurb);

  // Roundabout Guideline Ring (Dashed warm golden track)
  const roundRingGeo = new THREE.RingGeometry(5.6, 5.8, 48);
  const roundRingMat = createCelMaterial({
    color: "#fde047",
    emissive: "#f59e0b",
    emissiveIntensity: 0.35,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    steps: 2,
  });
  const roundRing = new THREE.Mesh(roundRingGeo, roundRingMat);
  roundRing.rotation.x = Math.PI / 2;
  roundRing.position.set(0, 0.105, 0);
  roadGroup.add(roundRing);

  // 3. LONG ARTERIAL ARTERIES (North-South Boulevard & East-West Avenue)
  const mainRoadWidth = 4.4;
  const mainRoadLength = 175; // Vast long highway stretch

  const createMainAvenue = (isEastWest: boolean) => {
    const roadGeo = new THREE.PlaneGeometry(mainRoadWidth, mainRoadLength);
    const roadMat = createCelMaterial({
      color: "#ffffff",
      map: roadStripDoubleTex,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      steps: 3,
    });
    materialsToUpdate.push({ mat: roadMat, type: "road" });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    if (isEastWest) {
      roadMesh.rotation.z = Math.PI / 2;
    }
    roadMesh.position.set(0, 0.06, 0);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Warm Sandstone Sidewalk Curbs with Ink Outlines
    [-mainRoadWidth / 2 - 0.1, mainRoadWidth / 2 + 0.1].forEach((offset) => {
      const curbGeo = new THREE.BoxGeometry(0.25, 0.14, mainRoadLength);
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      if (isEastWest) {
        curbMesh.rotation.y = Math.PI / 2;
        curbMesh.position.set(0, 0.08, offset);
      } else {
        curbMesh.position.set(offset, 0.08, 0);
      }
      curbMesh.castShadow = true;
      curbMesh.receiveShadow = true;
      roadGroup.add(curbMesh);

      const curbOutline = createSilhouetteOutline(curbGeo, "#292524", 1.03);
      if (isEastWest) {
        curbOutline.rotation.y = Math.PI / 2;
        curbOutline.position.set(0, 0.08, offset);
      } else {
        curbOutline.position.set(offset, 0.08, 0);
      }
      roadGroup.add(curbOutline);
    });
  };

  createMainAvenue(false); // North-South
  createMainAvenue(true);  // East-West

  // 4. INNER SCENIC RING HIGHWAY LOOP (Connecting intermediate provinces)
  const innerRingCoords: [number, number, number, number][] = [
    [-38, 0, 3.6, 76], // West inner highway
    [38, 0, 3.6, 76],  // East inner highway
    [0, -38, 76, 3.6], // North inner highway
    [0, 38, 76, 3.6],  // South inner highway
  ];

  innerRingCoords.forEach(([x, z, w, l]) => {
    const ringRoadGeo = new THREE.BoxGeometry(w, 0.08, l);
    const ringRoadMat = createCelMaterial({
      color: "#ffffff",
      map: diffuse,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      steps: 3,
    });
    materialsToUpdate.push({ mat: ringRoadMat, type: "road" });
    const ringMesh = new THREE.Mesh(ringRoadGeo, ringRoadMat);
    ringMesh.position.set(x, 0.045, z);
    ringMesh.receiveShadow = true;
    roadGroup.add(ringMesh);

    const ringOutline = createSilhouetteOutline(ringRoadGeo, "#1c1917", 1.015);
    ringOutline.position.set(x, 0.045, z);
    roadGroup.add(ringOutline);
  });

  // 5. OUTER GRAND COASTAL HIGHWAY LOOP (Vast perimeter cruising road)
  const outerRingCoords: [number, number, number, number][] = [
    [-74, 0, 4.0, 148], // Far West outer highway
    [74, 0, 4.0, 148],  // Far East outer highway
    [0, -74, 148, 4.0], // Far North outer highway
    [0, 74, 148, 4.0],  // Far South outer highway
  ];

  outerRingCoords.forEach(([x, z, w, l]) => {
    const ringRoadGeo = new THREE.BoxGeometry(w, 0.08, l);
    const ringRoadMat = createCelMaterial({
      color: "#ffffff",
      map: diffuse,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      steps: 3,
    });
    materialsToUpdate.push({ mat: ringRoadMat, type: "road" });
    const ringMesh = new THREE.Mesh(ringRoadGeo, ringRoadMat);
    ringMesh.position.set(x, 0.045, z);
    ringMesh.receiveShadow = true;
    roadGroup.add(ringMesh);

    const ringOutline = createSilhouetteOutline(ringRoadGeo, "#1c1917", 1.015);
    ringOutline.position.set(x, 0.045, z);
    roadGroup.add(ringOutline);
  });

  // 6. RADIAL FEEDER HIGHWAYS TO ALL DISTANT LANDMARKS
  const roadMatLandmark = createCelMaterial({
    color: "#ffffff",
    map: roadStripTex,
    bumpMap: bumpMap,
    bumpScale: 0.04,
    steps: 3,
  });
  materialsToUpdate.push({ mat: roadMatLandmark, type: "road" });

  landmarks.forEach((lm) => {
    const dx = lm.position[0];
    const dz = lm.position[2];
    const distance = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    // Connecting asphalt road strip
    const feederWidth = 3.6;
    const feederGeo = new THREE.PlaneGeometry(feederWidth, distance);
    const feederMesh = new THREE.Mesh(feederGeo, roadMatLandmark);
    feederMesh.rotation.x = -Math.PI / 2;
    feederMesh.rotation.z = -angle;
    feederMesh.position.set(dx / 2, 0.07, dz / 2);
    feederMesh.receiveShadow = true;
    roadGroup.add(feederMesh);

    // Crosswalk zebra stripes before entering building pedestal
    const crosswalkGeo = new THREE.PlaneGeometry(3.6, 1.6);
    const crosswalkMat = createCelMaterial({
      color: "#ffffff",
      map: crosswalkTex,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      steps: 2,
    });
    const crosswalkMesh = new THREE.Mesh(crosswalkGeo, crosswalkMat);
    crosswalkMesh.rotation.x = -Math.PI / 2;
    crosswalkMesh.rotation.z = -angle + Math.PI / 2;
    // Position 3.5 units before landmark center
    const ratio = Math.max(0.1, (distance - 3.5) / distance);
    crosswalkMesh.position.set(dx * ratio, 0.08, dz * ratio);
    roadGroup.add(crosswalkMesh);

    // Reflective Cat's Eye Road Studs along feeder centerline
    const numStuds = Math.floor(distance / 4.0);
    for (let i = 1; i <= numStuds; i++) {
      const studFraction = i / (numStuds + 1);
      const sx = dx * studFraction;
      const sz = dz * studFraction;

      const studGeo = new THREE.BoxGeometry(0.16, 0.04, 0.16);
      const studMat = createCelMaterial({
        color: "#fde047",
        emissive: "#f59e0b",
        emissiveIntensity: 0.6,
        steps: 2,
      });
      const stud = new THREE.Mesh(studGeo, studMat);
      stud.position.set(sx, 0.09, sz);
      roadGroup.add(stud);
    }
  });

  // 7. INTER-TOWN SCENIC HIGHWAY BYWAYS (Connecting adjacent towns into open loops)
  const townPairs: [number, number, number, number][] = [
    [-54, -46, 0, -68],   // About -> Education
    [0, -68, 54, -46],    // Education -> Experience
    [54, -46, 65, 16],    // Experience -> Projects
    [65, 16, 44, 58],     // Projects -> Contact
    [44, 58, -44, 58],    // Contact -> Leadership
    [-44, 58, -65, 16],   // Leadership -> Skills
    [-65, 16, -54, -46],  // Skills -> About
  ];

  townPairs.forEach(([x1, z1, x2, z2]) => {
    const dist = Math.hypot(x2 - x1, z2 - z1);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const angle = Math.atan2(x2 - x1, z2 - z1);

    const bywayGeo = new THREE.PlaneGeometry(3.4, dist);
    const bywayMesh = new THREE.Mesh(bywayGeo, roadMatLandmark);
    bywayMesh.rotation.x = -Math.PI / 2;
    bywayMesh.rotation.z = -angle;
    bywayMesh.position.set(midX, 0.065, midZ);
    bywayMesh.receiveShadow = true;
    roadGroup.add(bywayMesh);
  });

  // 8. SCENIC HIGHWAY SIGNPOSTS & MILESTONES
  const streetSignPositions = [
    { pos: [-4.2, 0, 8.5], label: "ROUTE 1: SUNSTONE WAY", color: "#f59e0b" },
    { pos: [4.2, 0, -8.5], label: "ROUTE 10: OBSERVATORY HIGHWAY", color: "#8b5cf6" },
    { pos: [-8.5, 0, -4.2], label: "ROUTE 4: BOTANICAL BYWAY", color: "#ec4899" },
    { pos: [8.5, 0, 4.2], label: "ROUTE 8: AIRSHIP FREEWAY", color: "#f97316" },
    { pos: [0, 0, -38], label: "NORTH MEADOW LOOP (38m)", color: "#10b981" },
    { pos: [0, 0, 38], label: "SOUTH COAST LOOP (38m)", color: "#06b6d4" },
    { pos: [-38, 0, 0], label: "WEST HIGHLANDS (38m)", color: "#3b82f6" },
    { pos: [38, 0, 0], label: "EAST VALLEY WAY (38m)", color: "#eab308" },
  ];

  const signPoleMat = createCelMaterial({ color: "#475569", steps: 2 });
  const signBoardMat = createCelMaterial({ color: "#1e293b", steps: 2 });

  streetSignPositions.forEach(({ pos, label, color }) => {
    const signGroup = new THREE.Group();
    signGroup.position.set(pos[0], pos[1], pos[2]);

    // Timber / Wrought-Iron Pole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8);
    const pole = new THREE.Mesh(poleGeo, signPoleMat);
    pole.position.y = 1.6;
    pole.castShadow = true;
    signGroup.add(pole);

    const poleOutline = createSilhouetteOutline(poleGeo, "#0f172a", 1.15);
    poleOutline.position.y = 1.6;
    signGroup.add(poleOutline);

    // Overhead Sign board
    const signGeo = new THREE.BoxGeometry(2.4, 0.6, 0.08);
    const signMesh = new THREE.Mesh(signGeo, signBoardMat);
    signMesh.position.y = 2.8;
    signGroup.add(signMesh);

    const signOutline = createSilhouetteOutline(signGeo, "#0f172a", 1.05);
    signOutline.position.y = 2.8;
    signGroup.add(signOutline);

    // Glowing label strip
    const labelGeo = new THREE.BoxGeometry(2.2, 0.45, 0.09);
    const labelMat = createCelMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.65,
      steps: 2,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.y = 2.8;
    signGroup.add(labelMesh);

    // Traffic indicator light
    const signalGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const signalMat = createCelMaterial({
      color: "#22c55e",
      emissive: "#16a34a",
      emissiveIntensity: 0.8,
      steps: 2,
    });
    const signal = new THREE.Mesh(signalGeo, signalMat);
    signal.position.set(0, 3.3, 0);
    signGroup.add(signal);

    roadGroup.add(signGroup);
  });

  // 9. DRAINAGE & MANHOLE ROAD DETAILS
  const manholePositions: [number, number][] = [
    [-2.2, 12], [2.2, -12], [-12, -2.2], [12, 2.2],
    [-2.2, 38], [2.2, -38], [-38, -2.2], [38, 2.2],
    [-2.2, 70], [2.2, -70], [-70, -2.2], [70, 2.2],
  ];

  const manholeMat = createCelMaterial({
    color: "#475569",
    steps: 2,
  });

  manholePositions.forEach(([x, z]) => {
    const manholeGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.025, 16);
    const manhole = new THREE.Mesh(manholeGeo, manholeMat);
    manhole.position.set(x, 0.075, z);
    manhole.receiveShadow = true;
    roadGroup.add(manhole);
  });

  // Dynamic road material switcher
  const updateRoadTheme = (theme: AsphaltTheme) => {
    currentTheme = theme;
    const newTex = createAsphaltTexture(theme);
    const newStrip = createRoadStripTexture(theme, true, false);
    const newDoubleStrip = createRoadStripTexture(theme, false, true);

    materialsToUpdate.forEach(({ mat, type }) => {
      if (type === "plaza") {
        mat.map = newTex.diffuse;
        mat.bumpMap = newTex.bumpMap;
        mat.color.set(theme === "wet" ? "#1e293b" : theme === "cyber" ? "#0f172a" : "#334155");
      } else if (type === "road") {
        mat.map = mat.map === roadStripDoubleTex ? newDoubleStrip : newStrip;
        mat.bumpMap = newTex.bumpMap;
      } else if (type === "ground") {
        mat.color.set(theme === "cyber" ? "#064e3b" : theme === "wet" ? "#166534" : "#22c55e");
      }
      mat.needsUpdate = true;
    });
  };

  scene.add(roadGroup);

  return { roadGroup, updateRoadTheme };
}
