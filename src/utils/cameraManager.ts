import * as THREE from "three";

export type CameraViewMode = "first_person" | "chase" | "cinematic";

export interface CameraViewConfig {
  id: CameraViewMode;
  name: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export const CAMERA_VIEWS: CameraViewConfig[] = [
  {
    id: "cinematic",
    name: "Cinematic Orbit",
    shortLabel: "Cinematic",
    description: "Continuous revolving 360-degree camera capturing rainy reflections & spires.",
    icon: "Video",
  },
];

/**
 * Updates camera position and orientation based on current CameraViewMode and player position/heading.
 */
export function updateCameraView(
  camera: THREE.PerspectiveCamera,
  viewMode: CameraViewMode,
  playerGroup: THREE.Group,
  delta: number,
  time: number,
  isMoving: boolean
) {
  const px = playerGroup.position.x;
  const py = playerGroup.position.y;
  const pz = playerGroup.position.z;
  const heading = playerGroup.rotation.y;

  const targetCamPos = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();
  let targetFov = 45;

  if (viewMode === "first_person") {
    // 1st person cockpit / dashcam view directly over handlebars
    const eyeHeight = 1.45;
    const forwardOffset = 0.4;
    const posX = px + Math.sin(heading) * forwardOffset;
    const posZ = pz + Math.cos(heading) * forwardOffset;

    // Gentle head vibration when driving
    const shakeY = isMoving ? Math.sin(time * 24) * 0.025 : Math.sin(time * 3) * 0.008;

    targetCamPos.set(posX, py + eyeHeight + shakeY, posZ);
    targetLookAt.set(
      px + Math.sin(heading) * 12,
      py + 0.8, // Looking down at the rainy road
      pz + Math.cos(heading) * 12
    );
    targetFov = 65; // Wide cockpit FOV
  } else if (viewMode === "chase") {
    // 3rd person follow behind scooter
    const dist = 6.5;
    const height = 3.2;
    // Calculate position behind the scooter based on its rotation
    const behindX = px - Math.sin(heading) * dist;
    const behindZ = pz - Math.cos(heading) * dist;

    targetCamPos.set(behindX, py + height, behindZ);
    targetLookAt.set(px + Math.sin(heading) * 2, py + 1.2, pz + Math.cos(heading) * 2);
    targetFov = isMoving ? 50 : 45;
  } else if (viewMode === "cinematic") {
    // Orbit around character
    const orbitRadius = 14;
    const orbitSpeed = 0.35;
    const orbitAngle = time * orbitSpeed;

    targetCamPos.set(
      px + Math.cos(orbitAngle) * orbitRadius,
      py + 7 + Math.sin(time * 0.5) * 2,
      pz + Math.sin(orbitAngle) * orbitRadius
    );
    targetLookAt.set(px, 1.5, pz);
    targetFov = 45;
  }

  // Smooth lerp camera position
  const lerpFactor = viewMode === "first_person" ? 0.4 : 1 - Math.exp(-8 * delta);
  camera.position.lerp(targetCamPos, lerpFactor);

  // Smooth lookAt interpolation
  const currentTarget = new THREE.Vector3();
  camera.getWorldDirection(currentTarget);
  currentTarget.add(camera.position);

  const finalLook = currentTarget.clone().lerp(targetLookAt, 1 - Math.exp(-10 * delta));
  camera.lookAt(finalLook);

  // Smooth FOV transition
  if (Math.abs(camera.fov - targetFov) > 0.1) {
    camera.fov += (targetFov - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
  }
}
