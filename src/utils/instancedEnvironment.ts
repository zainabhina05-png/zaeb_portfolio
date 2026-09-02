import * as THREE from "three";
import { LandmarkInfo } from "../components/ThreeTownScene";

export interface InstancedEnvironmentResult {
  cottageGroup: THREE.Group;
  grassMesh: THREE.InstancedMesh;
  updateWind: (time: number, isReducedMotion?: boolean) => void;
  dispose: () => void;
  stats: {
    cottageCount: number;
    grassTuftCount: number;
    drawCalls: number;
  };
}

/**
 * Creates instanced village cottages and grass tufts using Three.js InstancedMesh
 * Drastically reduces draw calls from hundreds down to ~6 draw calls total,
 * optimizing memory and GPU performance for mid-tier and mobile devices.
 */
export function createInstancedEnvironment(
  scene: THREE.Scene,
  landmarks: LandmarkInfo[]
): InstancedEnvironmentResult {
  // ---------------------------------------------------------------------------
  // 1. CALCULATE COTTAGE POSITIONS (avoiding roads, intersections, and landmarks)
  // ---------------------------------------------------------------------------
  const landmarkPositions = landmarks.map((l) => new THREE.Vector3(...l.position));
  const roadAxes = [0, -9, 9]; // Road centerlines

  const isNearRoadOrLandmark = (x: number, z: number): boolean => {
    // Keep out of boundaries
    if (Math.abs(x) > 15.5 || Math.abs(z) > 15.5) return true;
    if (Math.abs(x) < 2.0 && Math.abs(z) < 2.0) return true; // Central monument

    // Keep clear of main roads (width ~ 2.4)
    for (const axis of roadAxes) {
      if (Math.abs(x - axis) < 1.8 || Math.abs(z - axis) < 1.8) return true;
    }

    // Keep clear of landmark citadels (radius ~ 3.2)
    for (const lm of landmarkPositions) {
      const distSq = (x - lm.x) ** 2 + (z - lm.z) ** 2;
      if (distSq < 3.4 * 3.4) return true;
    }

    return false;
  };

  const cottagePositions: Array<{
    pos: THREE.Vector3;
    rotY: number;
    scale: THREE.Vector3;
    colorWall: THREE.Color;
    colorRoof: THREE.Color;
  }> = [];

  // Generate suburban cottage clusters in the open meadow sectors
  const sectorOffsets = [
    { minX: -15, maxX: -10.5, minZ: -15, maxZ: -10.5 },
    { minX: -7.5, maxX: -1.5, minZ: -15, maxZ: -10.5 },
    { minX: 1.5, maxX: 7.5, minZ: -15, maxZ: -10.5 },
    { minX: 10.5, maxX: 15, minZ: -15, maxZ: -10.5 },

    { minX: -15, maxX: -10.5, minZ: -7.5, maxZ: -1.5 },
    { minX: 10.5, maxX: 15, minZ: -7.5, maxZ: -1.5 },

    { minX: -15, maxX: -10.5, minZ: 1.5, maxZ: 7.5 },
    { minX: 10.5, maxX: 15, minZ: 1.5, maxZ: 7.5 },

    { minX: -15, maxX: -10.5, minZ: 10.5, maxZ: 15 },
    { minX: -7.5, maxX: -1.5, minZ: 10.5, maxZ: 15 },
    { minX: 1.5, maxX: 7.5, minZ: 10.5, maxZ: 15 },
    { minX: 10.5, maxX: 15, minZ: 10.5, maxZ: 15 },
  ];

  // Palette sets for organic village diversity
  const wallHues = [
    new THREE.Color("#473228"), // Timber brown
    new THREE.Color("#334155"), // Slate blue
    new THREE.Color("#52473b"), // Cedar timber
    new THREE.Color("#3a3a44"), // Cobblestone grey
    new THREE.Color("#5c3d2e"), // Mahogany timber
  ];

  const roofHues = [
    new THREE.Color("#991b1b"), // Crimson terracotta
    new THREE.Color("#b45309"), // Warm clay
    new THREE.Color("#1e293b"), // Dark slate
    new THREE.Color("#78350f"), // Cedar shake
    new THREE.Color("#047857"), // Mossy emerald slate
  ];

  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  sectorOffsets.forEach((sec) => {
    // 3 to 5 candidate spots per sector
    const spots = 4;
    for (let i = 0; i < spots; i++) {
      const px = sec.minX + pseudoRandom() * (sec.maxX - sec.minX);
      const pz = sec.minZ + pseudoRandom() * (sec.maxZ - sec.minZ);

      if (!isNearRoadOrLandmark(px, pz)) {
        // Ensure distance to existing cottages
        const tooClose = cottagePositions.some(
          (c) => c.pos.distanceTo(new THREE.Vector3(px, 0, pz)) < 2.3
        );
        if (!tooClose) {
          const s = 0.85 + pseudoRandom() * 0.3; // Scale 0.85 to 1.15
          const rotY = Math.floor(pseudoRandom() * 4) * (Math.PI / 2) + (pseudoRandom() - 0.5) * 0.2;
          const wallColor = wallHues[Math.floor(pseudoRandom() * wallHues.length)].clone();
          const roofColor = roofHues[Math.floor(pseudoRandom() * roofHues.length)].clone();

          cottagePositions.push({
            pos: new THREE.Vector3(px, 0, pz),
            rotY,
            scale: new THREE.Vector3(s, s * (0.9 + pseudoRandom() * 0.2), s),
            colorWall: wallColor,
            colorRoof: roofColor,
          });
        }
      }
    }
  });

  const cottageCount = cottagePositions.length;

  // ---------------------------------------------------------------------------
  // 2. CREATE INSTANCED MESHES FOR VILLAGE COTTAGES (5 Draw Calls total)
  // ---------------------------------------------------------------------------
  const cottageGroup = new THREE.Group();
  cottageGroup.name = "InstancedVillageCottages";

  // A. Walls & Stone Base Geometry
  const wallGeo = new THREE.BoxGeometry(1.5, 1.1, 1.3);
  wallGeo.translate(0, 0.55, 0);
  const wallMat = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0.15,
  });
  const wallMesh = new THREE.InstancedMesh(wallGeo, wallMat, cottageCount);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;

  // B. Gabled/Hipped Roof Spire Geometry (4-sided pyramid)
  const roofGeo = new THREE.ConeGeometry(1.25, 0.85, 4);
  roofGeo.rotateY(Math.PI / 4);
  roofGeo.translate(0, 1.1 + 0.425, 0);
  const roofMat = new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.1,
  });
  const roofMesh = new THREE.InstancedMesh(roofGeo, roofMat, cottageCount);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;

  // C. Warm Glowing Window Panes
  const winGeo = new THREE.BoxGeometry(0.32, 0.35, 0.08);
  winGeo.translate(0, 0.65, 0.66); // Front facade window offset
  const winMat = new THREE.MeshStandardMaterial({
    color: "#fde047",
    emissive: "#eab308",
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });
  const winMesh = new THREE.InstancedMesh(winGeo, winMat, cottageCount);

  // D. Brick Chimney Stacks
  const chimGeo = new THREE.BoxGeometry(0.24, 0.7, 0.24);
  chimGeo.translate(0.38, 1.45, -0.2);
  const chimMat = new THREE.MeshStandardMaterial({
    color: "#78350f",
    roughness: 0.9,
  });
  const chimMesh = new THREE.InstancedMesh(chimGeo, chimMat, cottageCount);
  chimMesh.castShadow = true;

  // E. Wooden Plank Door
  const doorGeo = new THREE.BoxGeometry(0.35, 0.65, 0.06);
  doorGeo.translate(-0.3, 0.325, 0.66);
  const doorMat = new THREE.MeshStandardMaterial({
    color: "#291b15",
    roughness: 0.9,
  });
  const doorMesh = new THREE.InstancedMesh(doorGeo, doorMat, cottageCount);

  // Populate transformation matrices and colors
  const dummy = new THREE.Object3D();

  cottagePositions.forEach((c, idx) => {
    dummy.position.copy(c.pos);
    dummy.rotation.set(0, c.rotY, 0);
    dummy.scale.copy(c.scale);
    dummy.updateMatrix();

    wallMesh.setMatrixAt(idx, dummy.matrix);
    wallMesh.setColorAt(idx, c.colorWall);

    roofMesh.setMatrixAt(idx, dummy.matrix);
    roofMesh.setColorAt(idx, c.colorRoof);

    winMesh.setMatrixAt(idx, dummy.matrix);
    chimMesh.setMatrixAt(idx, dummy.matrix);
    doorMesh.setMatrixAt(idx, dummy.matrix);
  });

  wallMesh.instanceMatrix.needsUpdate = true;
  if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true;
  roofMesh.instanceMatrix.needsUpdate = true;
  if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
  winMesh.instanceMatrix.needsUpdate = true;
  chimMesh.instanceMatrix.needsUpdate = true;
  doorMesh.instanceMatrix.needsUpdate = true;

  cottageGroup.add(wallMesh);
  cottageGroup.add(roofMesh);
  cottageGroup.add(winMesh);
  cottageGroup.add(chimMesh);
  cottageGroup.add(doorMesh);
  scene.add(cottageGroup);

  // ---------------------------------------------------------------------------
  // 3. CREATE INSTANCED GRASS TUFTS (1 Draw Call for 1000+ grass clusters)
  // ---------------------------------------------------------------------------
  const grassTuftCount = 1050;

  // Multi-blade stylized grass geometry (2 crossed tapered planes)
  const plane1 = new THREE.PlaneGeometry(0.4, 0.5, 1, 2);
  plane1.translate(0, 0.25, 0);

  const plane2 = plane1.clone();
  plane2.rotateY(Math.PI / 2);

  // Merge into single tuft geometry
  const grassGeo = new THREE.BufferGeometry();
  const posArr: number[] = [];
  const normArr: number[] = [];
  const uvArr: number[] = [];

  const p1Pos = plane1.attributes.position.array;
  const p1Norm = plane1.attributes.normal.array;
  const p1Uv = plane1.attributes.uv.array;
  const p2Pos = plane2.attributes.position.array;
  const p2Norm = plane2.attributes.normal.array;
  const p2Uv = plane2.attributes.uv.array;

  for (let i = 0; i < p1Pos.length; i++) posArr.push(p1Pos[i]);
  for (let i = 0; i < p2Pos.length; i++) posArr.push(p2Pos[i]);
  for (let i = 0; i < p1Norm.length; i++) normArr.push(p1Norm[i]);
  for (let i = 0; i < p2Norm.length; i++) normArr.push(p2Norm[i]);
  for (let i = 0; i < p1Uv.length; i++) uvArr.push(p1Uv[i]);
  for (let i = 0; i < p2Uv.length; i++) uvArr.push(p2Uv[i]);

  grassGeo.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
  grassGeo.setAttribute("normal", new THREE.Float32BufferAttribute(normArr, 3));
  grassGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2));

  // Taper blade tips
  const gPositions = grassGeo.attributes.position;
  for (let i = 0; i < gPositions.count; i++) {
    const y = gPositions.getY(i);
    if (y > 0.4) {
      gPositions.setX(i, gPositions.getX(i) * 0.3);
      gPositions.setZ(i, gPositions.getZ(i) * 0.3);
    }
  }
  grassGeo.computeVertexNormals();

  const grassMat = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassTuftCount);
  grassMesh.castShadow = false; // Disabled on mobile to save fragment passes
  grassMesh.receiveShadow = true;

  // Distribute grass across meadows and curbsides
  const grassDummy = new THREE.Object3D();
  const grassHues = [
    new THREE.Color("#15803d"), // Forest emerald
    new THREE.Color("#16a34a"), // Vibrant grass
    new THREE.Color("#22c55e"), // Spring green
    new THREE.Color("#14532d"), // Deep meadow green
    new THREE.Color("#4ade80"), // Bright neon tip green
    new THREE.Color("#365314"), // Earthy moss green
  ];

  let placedCount = 0;
  let attempts = 0;

  while (placedCount < grassTuftCount && attempts < grassTuftCount * 4) {
    attempts++;
    const gx = (pseudoRandom() - 0.5) * 32;
    const gz = (pseudoRandom() - 0.5) * 32;

    // Check if on road center or inside main buildings
    let onRoad = false;
    for (const axis of roadAxes) {
      if (Math.abs(gx - axis) < 1.3 || Math.abs(gz - axis) < 1.3) {
        onRoad = true;
        break;
      }
    }

    if (!onRoad) {
      grassDummy.position.set(gx, 0.02, gz);
      grassDummy.rotation.set(0, pseudoRandom() * Math.PI * 2, 0);
      const s = 0.7 + pseudoRandom() * 0.6;
      grassDummy.scale.set(s, s * (0.8 + pseudoRandom() * 0.4), s);
      grassDummy.updateMatrix();

      grassMesh.setMatrixAt(placedCount, grassDummy.matrix);
      const color = grassHues[Math.floor(pseudoRandom() * grassHues.length)].clone();
      grassMesh.setColorAt(placedCount, color);
      placedCount++;
    }
  }

  grassMesh.instanceMatrix.needsUpdate = true;
  if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;
  scene.add(grassMesh);

  // ---------------------------------------------------------------------------
  // 4. EFFICIENT INSTANCED WIND SIMULATION & REDUCED MOTION SUPPORT
  // ---------------------------------------------------------------------------
  const updateWind = (time: number, isReducedMotion?: boolean) => {
    if (isReducedMotion) {
      grassMesh.rotation.z = 0;
      return;
    }
    // High performance global wind oscillation without recomputing 1,000 instance matrices per frame
    const windSway = Math.sin(time * 2.2) * 0.04;
    grassMesh.rotation.z = windSway;
  };

  // ---------------------------------------------------------------------------
  // 5. DISPOSAL & MEMORY CLEANUP
  // ---------------------------------------------------------------------------
  const dispose = () => {
    scene.remove(cottageGroup);
    scene.remove(grassMesh);

    wallGeo.dispose();
    wallMat.dispose();
    roofGeo.dispose();
    roofMat.dispose();
    winGeo.dispose();
    winMat.dispose();
    chimGeo.dispose();
    chimMat.dispose();
    doorGeo.dispose();
    doorMat.dispose();

    grassGeo.dispose();
    grassMat.dispose();
    plane1.dispose();
    plane2.dispose();
  };

  return {
    cottageGroup,
    grassMesh,
    updateWind,
    dispose,
    stats: {
      cottageCount,
      grassTuftCount: placedCount,
      drawCalls: 6, // 5 for cottage sub-meshes + 1 for grass mesh
    },
  };
}
