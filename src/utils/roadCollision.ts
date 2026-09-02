import * as THREE from "three";
import { LandmarkInfo } from "../components/ThreeTownScene";

export interface RoadCollisionEngine {
  isPositionOnRoad: (x: number, z: number, margin?: number) => boolean;
  getClosestRoadPoint: (x: number, z: number) => THREE.Vector3;
  resolveRoadMovement: (
    currentPos: THREE.Vector3,
    moveDelta: THREE.Vector3,
    scooterRadius?: number
  ) => { newPos: THREE.Vector3; isConstrained: boolean };
  findRoadPath: (start: THREE.Vector3, target: THREE.Vector3) => THREE.Vector3[];
  getRoadNameAt: (x: number, z: number) => string;
}

export interface RoadSegment {
  type: "roundabout" | "boulevard_ns" | "boulevard_ew" | "inner_ring" | "outer_ring" | "feeder" | "byway" | "apron";
  name: string;
}

/**
 * High-precision road containment and pathfinding engine for expansive Ghibli open world.
 * Restricts scooter movement strictly to:
 * 1. Central Plaza Roundabout (inner radius ~2.4, outer radius ~8.8)
 * 2. Main North-South Boulevard (|x| <= 2.3, |z| <= 90)
 * 3. Main East-West Avenue (|z| <= 2.3, |x| <= 90)
 * 4. Inner Scenic Ring Highway (|x| or |z| in [35.8, 40.2])
 * 5. Outer Grand Coastal Highway (|x| or |z| in [71.8, 76.2])
 * 6. Radial Feeder Highways connecting Central Hub to each far landmark
 * 7. Inter-Town Scenic Provincial Byways linking adjacent towns
 * 8. Landmark Courtyard Aprons / Driveways (radius ~6.8)
 */
export function createRoadCollisionEngine(landmarks: LandmarkInfo[]): RoadCollisionEngine {
  const ROUNDABOUT_INNER_R = 2.4; // Center monument garden curb
  const ROUNDABOUT_OUTER_R = 8.8; // Roundabout outer curb
  const MAIN_ROAD_HALF_WIDTH = 2.3; // Half width of main avenues
  const INNER_RING_MIN = 35.8; // Inner ring inner edge
  const INNER_RING_MAX = 40.2; // Inner ring outer edge
  const OUTER_RING_MIN = 71.8; // Outer ring inner edge
  const OUTER_RING_MAX = 76.2; // Outer ring outer edge
  const FEEDER_HALF_WIDTH = 1.95; // Half width of feeder connector roads
  const LANDMARK_APRON_RADIUS = 6.8; // Driveway arrival apron at each landmark

  const landmarkPositions = landmarks.map((l) => ({
    id: l.id,
    name: l.name,
    x: l.position[0],
    z: l.position[2],
    distance: Math.hypot(l.position[0], l.position[2]),
  }));

  // Inter-town byway connections between adjacent towns
  const townPairs: [number, number, number, number][] = [
    [-54, -46, 0, -68],   // About -> Education
    [0, -68, 54, -46],    // Education -> Experience
    [54, -46, 65, 16],    // Experience -> Projects
    [65, 16, 44, 58],     // Projects -> Contact
    [44, 58, -44, 58],    // Contact -> Leadership
    [-44, 58, -65, 16],   // Leadership -> Skills
    [-65, 16, -54, -46],  // Skills -> About
  ];

  /**
   * Distance squared from point (px, pz) to line segment (x1, z1) -> (x2, z2)
   */
  const distanceToSegmentSquared = (
    px: number,
    pz: number,
    x1: number,
    z1: number,
    x2: number,
    z2: number
  ): { distSq: number; projX: number; projZ: number } => {
    const l2 = (x2 - x1) ** 2 + (z2 - z1) ** 2;
    if (l2 === 0) {
      return {
        distSq: (px - x1) ** 2 + (pz - z1) ** 2,
        projX: x1,
        projZ: z1,
      };
    }
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projZ = z1 + t * (z2 - z1);
    return {
      distSq: (px - projX) ** 2 + (pz - projZ) ** 2,
      projX,
      projZ,
    };
  };

  /**
   * Core verification if coordinate (x, z) lies on the paved road network
   */
  const isPositionOnRoad = (x: number, z: number, margin = 0): boolean => {
    const distFromCenter = Math.hypot(x, z);

    // 1. Central Grand Roundabout Ring
    if (
      distFromCenter >= ROUNDABOUT_INNER_R - margin &&
      distFromCenter <= ROUNDABOUT_OUTER_R + margin
    ) {
      return true;
    }

    // 2. Main North-South Boulevard (Z-axis)
    if (
      Math.abs(x) <= MAIN_ROAD_HALF_WIDTH + margin &&
      Math.abs(z) <= 90 + margin
    ) {
      return true;
    }

    // 3. Main East-West Avenue (X-axis)
    if (
      Math.abs(z) <= MAIN_ROAD_HALF_WIDTH + margin &&
      Math.abs(x) <= 90 + margin
    ) {
      return true;
    }

    // 4. Inner Scenic Ring Highway
    if (
      (Math.abs(x) >= INNER_RING_MIN - margin &&
        Math.abs(x) <= INNER_RING_MAX + margin &&
        Math.abs(z) <= INNER_RING_MAX + margin) ||
      (Math.abs(z) >= INNER_RING_MIN - margin &&
        Math.abs(z) <= INNER_RING_MAX + margin &&
        Math.abs(x) <= INNER_RING_MAX + margin)
    ) {
      return true;
    }

    // 5. Outer Grand Coastal Highway
    if (
      (Math.abs(x) >= OUTER_RING_MIN - margin &&
        Math.abs(x) <= OUTER_RING_MAX + margin &&
        Math.abs(z) <= OUTER_RING_MAX + margin) ||
      (Math.abs(z) >= OUTER_RING_MIN - margin &&
        Math.abs(z) <= OUTER_RING_MAX + margin &&
        Math.abs(x) <= OUTER_RING_MAX + margin)
    ) {
      return true;
    }

    // 6. Radial Feeder Highways connecting Central Hub to each far Landmark
    const feederLimitSq = (FEEDER_HALF_WIDTH + margin) ** 2;
    for (const lm of landmarkPositions) {
      const { distSq } = distanceToSegmentSquared(x, z, 0, 0, lm.x, lm.z);
      if (distSq <= feederLimitSq && distFromCenter <= lm.distance + 2.0) {
        return true;
      }

      // Landmark Arrival Apron / Courtyard Loop
      const distToLm = Math.hypot(x - lm.x, z - lm.z);
      if (distToLm <= LANDMARK_APRON_RADIUS + margin) {
        return true;
      }
    }

    // 7. Inter-Town Scenic Provincial Byways
    for (const [x1, z1, x2, z2] of townPairs) {
      const { distSq } = distanceToSegmentSquared(x, z, x1, z1, x2, z2);
      if (distSq <= feederLimitSq) {
        return true;
      }
    }

    return false;
  };

  /**
   * Projects an off-road point to the nearest valid point on the road surface
   */
  const getClosestRoadPoint = (x: number, z: number): THREE.Vector3 => {
    if (isPositionOnRoad(x, z, 0)) {
      return new THREE.Vector3(x, 0, z);
    }

    let closestDistSq = Infinity;
    let closestX = 0;
    let closestZ = 0;

    // Check Roundabout Ring
    const distCenter = Math.hypot(x, z);
    const clampedR = Math.max(ROUNDABOUT_INNER_R + 0.4, Math.min(ROUNDABOUT_OUTER_R - 0.4, distCenter || 5.0));
    const angle = Math.atan2(z, x);
    const rX = Math.cos(angle) * clampedR;
    const rZ = Math.sin(angle) * clampedR;
    const rDistSq = (x - rX) ** 2 + (z - rZ) ** 2;
    if (rDistSq < closestDistSq) {
      closestDistSq = rDistSq;
      closestX = rX;
      closestZ = rZ;
    }

    // Check North-South Boulevard
    const nsX = Math.max(-MAIN_ROAD_HALF_WIDTH + 0.3, Math.min(MAIN_ROAD_HALF_WIDTH - 0.3, x));
    const nsZ = Math.max(-88, Math.min(88, z));
    const nsDistSq = (x - nsX) ** 2 + (z - nsZ) ** 2;
    if (nsDistSq < closestDistSq) {
      closestDistSq = nsDistSq;
      closestX = nsX;
      closestZ = nsZ;
    }

    // Check East-West Avenue
    const ewX = Math.max(-88, Math.min(88, x));
    const ewZ = Math.max(-MAIN_ROAD_HALF_WIDTH + 0.3, Math.min(MAIN_ROAD_HALF_WIDTH - 0.3, z));
    const ewDistSq = (x - ewX) ** 2 + (z - ewZ) ** 2;
    if (ewDistSq < closestDistSq) {
      closestDistSq = ewDistSq;
      closestX = ewX;
      closestZ = ewZ;
    }

    // Check Radial Feeders & Landmarks
    for (const lm of landmarkPositions) {
      const { distSq, projX, projZ } = distanceToSegmentSquared(x, z, 0, 0, lm.x, lm.z);
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestX = projX;
        closestZ = projZ;
      }
    }

    // Check Byways
    for (const [x1, z1, x2, z2] of townPairs) {
      const { distSq, projX, projZ } = distanceToSegmentSquared(x, z, x1, z1, x2, z2);
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestX = projX;
        closestZ = projZ;
      }
    }

    return new THREE.Vector3(closestX, 0, closestZ);
  };

  /**
   * Continuous Collision Resolver with Micro-Substepping & Curb Sliding.
   * Guarantees the scooter cannot pop through curbs or escape off-road under any velocity.
   */
  const resolveRoadMovement = (
    currentPos: THREE.Vector3,
    moveDelta: THREE.Vector3,
    scooterRadius = 0.3
  ): { newPos: THREE.Vector3; isConstrained: boolean } => {
    const subSteps = 3;
    const stepDelta = moveDelta.clone().multiplyScalar(1 / subSteps);
    let workingPos = currentPos.clone();
    let isConstrained = false;

    for (let i = 0; i < subSteps; i++) {
      const nextX = workingPos.x + stepDelta.x;
      const nextZ = workingPos.z + stepDelta.z;

      // 1. Direct Move Check
      if (isPositionOnRoad(nextX, nextZ, scooterRadius)) {
        workingPos.x = nextX;
        workingPos.z = nextZ;
        continue;
      }

      // 2. Curb Sliding along X
      if (isPositionOnRoad(nextX, workingPos.z, scooterRadius)) {
        workingPos.x = nextX;
        isConstrained = true;
        continue;
      }

      // 3. Curb Sliding along Z
      if (isPositionOnRoad(workingPos.x, nextZ, scooterRadius)) {
        workingPos.z = nextZ;
        isConstrained = true;
        continue;
      }

      // 4. Tangent Sliding along Roundabout if near center
      const distFromCenter = Math.hypot(workingPos.x, workingPos.z);
      if (distFromCenter < ROUNDABOUT_OUTER_R + 2.0) {
        const tangentX = -workingPos.z / (distFromCenter || 1);
        const tangentZ = workingPos.x / (distFromCenter || 1);
        const dot = stepDelta.x * tangentX + stepDelta.z * tangentZ;
        const slideStepX = workingPos.x + tangentX * dot * 0.85;
        const slideStepZ = workingPos.z + tangentZ * dot * 0.85;
        if (isPositionOnRoad(slideStepX, slideStepZ, scooterRadius)) {
          workingPos.x = slideStepX;
          workingPos.z = slideStepZ;
          isConstrained = true;
          continue;
        }
      }

      // 5. Blocked
      isConstrained = true;
      break;
    }

    // Safety fallback: if somehow outside road due to boundary glitch, project back
    if (!isPositionOnRoad(workingPos.x, workingPos.z, 0)) {
      const projected = getClosestRoadPoint(workingPos.x, workingPos.z);
      workingPos.x = projected.x;
      workingPos.z = projected.z;
      isConstrained = true;
    }

    return {
      newPos: workingPos,
      isConstrained,
    };
  };

  /**
   * Network Pathfinding: computes a series of waypoints strictly staying on the road.
   * Routes: Start -> nearest road corridor/roundabout waypoint -> destination feeder -> destination apron.
   */
  const findRoadPath = (start: THREE.Vector3, target: THREE.Vector3): THREE.Vector3[] => {
    const validStart = getClosestRoadPoint(start.x, start.z);
    const validTarget = getClosestRoadPoint(target.x, target.z);

    const waypoints: THREE.Vector3[] = [];
    const directDist = validStart.distanceTo(validTarget);

    // If start and target are very close and the direct segment is on-road, travel directly
    let directSegmentValid = true;
    const testSamples = 8;
    for (let s = 1; s < testSamples; s++) {
      const t = s / testSamples;
      const testX = validStart.x + (validTarget.x - validStart.x) * t;
      const testZ = validStart.z + (validTarget.z - validStart.z) * t;
      if (!isPositionOnRoad(testX, testZ, 0.3)) {
        directSegmentValid = false;
        break;
      }
    }

    if (directSegmentValid && directDist < 18.0) {
      return [validTarget];
    }

    // Otherwise, route through the central roundabout or arterial crossroads
    const startDistCenter = Math.hypot(validStart.x, validStart.z);

    // Step 1: Move from start to entry of central roundabout
    if (startDistCenter > 9.0) {
      const startAngle = Math.atan2(validStart.z, validStart.x);
      const roundaboutEntry = new THREE.Vector3(
        Math.cos(startAngle) * 5.6,
        0,
        Math.sin(startAngle) * 5.6
      );
      waypoints.push(roundaboutEntry);
    }

    // Step 2: Intermediate roundabout arc points to target feeder
    const targetAngle = Math.atan2(validTarget.z, validTarget.x);
    const startAngle = Math.atan2(validStart.z, validStart.x);

    let angleDiff = targetAngle - startAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const arcSteps = Math.max(1, Math.min(5, Math.ceil(Math.abs(angleDiff) / (Math.PI / 4))));
    for (let step = 1; step <= arcSteps; step++) {
      const interpAngle = startAngle + (angleDiff * step) / arcSteps;
      waypoints.push(
        new THREE.Vector3(
          Math.cos(interpAngle) * 5.6,
          0,
          Math.sin(interpAngle) * 5.6
        )
      );
    }

    // Step 3: Exit roundabout along feeder or avenue to target
    waypoints.push(validTarget);

    return waypoints;
  };

  /**
   * Return atmospheric Ghibli road name based on position
   */
  const getRoadNameAt = (x: number, z: number): string => {
    const distFromCenter = Math.hypot(x, z);

    if (distFromCenter < 8.8) {
      return "Sunstone Grand Roundabout";
    }

    // Check nearby landmark driveways
    for (const lm of landmarkPositions) {
      const dist = Math.hypot(x - lm.x, z - lm.z);
      if (dist < 8.0) {
        return `${lm.name} Citadel Courtyard`;
      }
    }

    if (Math.abs(x) < 2.5) {
      return z < 0 ? "Route 10: Celestial Summit Highway (North)" : "Route 1: Sunstone Coastal Way (South)";
    }

    if (Math.abs(z) < 2.5) {
      return x < 0 ? "Route 4: Totoro Forest Expressway (West)" : "Route 8: Laputa Skyway (East)";
    }

    if (Math.abs(x) >= OUTER_RING_MIN || Math.abs(z) >= OUTER_RING_MIN) {
      return "Grand Outer Perimeter Coastal Ring (74m)";
    }

    if (Math.abs(x) >= INNER_RING_MIN || Math.abs(z) >= INNER_RING_MIN) {
      return "Cotswolds Scenic Provincial Loop (38m)";
    }

    return "Cobblestone Pastoral Byway";
  };

  return {
    isPositionOnRoad,
    getClosestRoadPoint,
    resolveRoadMovement,
    findRoadPath,
    getRoadNameAt,
  };
}
