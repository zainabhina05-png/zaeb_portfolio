import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { buildSpikyCapitalZShards, ShardData } from "./GeometryZ";

interface MetallicRedZBackgroundProps {
  scrollProgress: number | MotionValue<number>; // 0.0 (intact) to 1.0 (exploded) or reverse
  opacity?: number;
  className?: string;
}

type ZTimelineState = {
  y: number;
  explosion: number;
  rotationY: number;
  rotationX: number;
};

const Z_TIMELINE = [
  // TITLE / SETTLE: the complete Z is visible before it begins changing.
  { at: 0.00, y: 0, explosion: 0.00, rotationY: 0.00, rotationX: 0.00 },
  { at: 0.14, y: 0, explosion: 0.00, rotationY: 0.08, rotationX: -0.01 },
  // ASSEMBLY: fragments begin separating slowly and remain readable.
  { at: 0.28, y: 0, explosion: 0.12, rotationY: 0.18, rotationX: -0.03 },
  { at: 0.42, y: 0, explosion: 0.24, rotationY: 0.3, rotationX: -0.08 },
  // OPEN / TENSION: a visible midpoint hold keeps the model present in this chapter.
  { at: 0.56, y: 0, explosion: 0.48, rotationY: 0.46, rotationX: -0.13 },
  // EXPLOSION: the complete spread is reached late in the section.
  { at: 0.70, y: 0, explosion: 0.78, rotationY: 0.64, rotationX: -0.19 },
  { at: 0.84, y: 0, explosion: 1.00, rotationY: 0.78, rotationX: -0.25 },
  // REASSEMBLY: keep a visible, partially coherent Z through the final chapter.
  { at: 1.00, y: 0, explosion: 0.78, rotationY: 0.94, rotationX: -0.31 },
] as const;

function sampleZTimeline(progress: number): ZTimelineState {
  const clamped = Math.max(0, Math.min(1, progress));
  for (let index = 1; index < Z_TIMELINE.length; index += 1) {
    const previous = Z_TIMELINE[index - 1];
    const next = Z_TIMELINE[index];
    if (clamped <= next.at) {
      const span = next.at - previous.at;
      const local = span === 0 ? 1 : (clamped - previous.at) / span;
      const eased = local * local * (3 - 2 * local);
      return {
        y: THREE.MathUtils.lerp(previous.y, next.y, eased),
        explosion: THREE.MathUtils.lerp(previous.explosion, next.explosion, eased),
        rotationY: THREE.MathUtils.lerp(previous.rotationY, next.rotationY, eased),
        rotationX: THREE.MathUtils.lerp(previous.rotationX, next.rotationX, eased),
      };
    }
  }
  const last = Z_TIMELINE[Z_TIMELINE.length - 1];
  return { y: last.y, explosion: last.explosion, rotationY: last.rotationY, rotationX: last.rotationX };
}

export default function MetallicRedZBackground({
  scrollProgress,
  opacity = 0.45,
  className = "",
}: MetallicRedZBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const shardsRef = useRef<ShardData[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const progressRef = useRef(typeof scrollProgress === "number" ? scrollProgress : scrollProgress.get());

  useEffect(() => {
    progressRef.current = typeof scrollProgress === "number" ? scrollProgress : scrollProgress.get();
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    cameraRef.current = camera;

    // 3. RENDERER
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      console.warn("[ZAEB] WebGL Z background unavailable; preserving DOM Experience content.", error);
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. MATERIALS (Deep marine / electric cyan / warm apricot)
    const navyMetallicMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0F3440"),
      roughness: 0.24,
      metalness: 0.9,
    });

    const chromeSpikeMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#19B7B2"),
      roughness: 0.1,
      metalness: 0.96,
      emissive: new THREE.Color("#0B5F68"),
      emissiveIntensity: 0.6,
      clearcoat: 0.85,
      clearcoatRoughness: 0.16,
    });

    const thinSpineMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#F7B15F"),
      roughness: 0.13,
      metalness: 0.92,
      emissive: new THREE.Color("#6B3A18"),
      emissiveIntensity: 0.16,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
    });

    const edgeGlowMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color("#62D6D2"),
      transparent: true,
      opacity: 0.72,
    });

    // 5. BUILD GEOMETRY
    const { group, shards } = buildSpikyCapitalZShards(
      navyMetallicMaterial,
      chromeSpikeMaterial,
      thinSpineMaterial,
      edgeGlowMaterial
    );
    group.scale.set(1.15, 1.15, 1.15);
    scene.add(group);
    groupRef.current = group;
    shardsRef.current = shards;

    // 6. Lightweight ambient particle field: one points draw call, no per-particle meshes.
    const particleCount = 96;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const offset = index * 3;
      const angle = index * 2.399963;
      const radius = 3.6 + (index % 7) * 0.34;
      particlePositions[offset] = Math.cos(angle) * radius;
      particlePositions[offset + 1] = Math.sin(angle * 1.17) * (2.7 + (index % 5) * 0.22);
      particlePositions[offset + 2] = -1.2 + ((index % 9) - 4) * 0.32;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color("#62D6D2"),
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.position.z = -0.9;
    scene.add(particles);
    particlesRef.current = particles;

    // 7. LIGHTING
    const ambientLight = new THREE.AmbientLight(new THREE.Color("#0B2933"), 2.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(new THREE.Color("#F7B15F"), 4.2);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(new THREE.Color("#62D6D2"), 3.1);
    rimLight.position.set(-6, -4, 5);
    scene.add(rimLight);

    const pointGlow = new THREE.PointLight(new THREE.Color("#19B7B2"), 5.5, 16);
    pointGlow.position.set(0, 0, 3);
    scene.add(pointGlow);

    // 8. ANIMATION LOOP
    let animId: number;
    let currentProgress = progressRef.current;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Read the shared MotionValue each frame, then ease the Three.js scene toward it.
      progressRef.current = typeof scrollProgress === "number" ? scrollProgress : scrollProgress.get();
      currentProgress += (progressRef.current - currentProgress) * 0.16;

      const rawP = Math.max(0, Math.min(1, currentProgress));
      const timeline = sampleZTimeline(rawP);
      const time = performance.now();

      if (groupRef.current) {
        // Ambient rotation rides on top of the explicit scroll timestamp rotation.
        groupRef.current.rotation.y = Math.sin(Date.now() * 0.0006) * 0.18 + timeline.rotationY;
        groupRef.current.rotation.x = Math.cos(Date.now() * 0.0005) * 0.08 + timeline.rotationX;
        // Keep the Z locked to the center of the sticky viewport; scroll changes only its form and rotation.
        groupRef.current.position.set(0, 0, 0);
      }
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.000035 + rawP * 0.35;
        particlesRef.current.rotation.x = Math.sin(time * 0.00018) * 0.08;
        particlesRef.current.position.y = Math.sin(time * 0.00022) * 0.08;
        (particlesRef.current.material as THREE.PointsMaterial).opacity = 0.28 + timeline.explosion * 0.22;
      }

      // Update shards explosion positions using the same timestamped sequence.
      const p = timeline.explosion;
      shardsRef.current.forEach((shard) => {
        const localP = Math.max(0, Math.min(1, (p - shard.delayOffset * 0.3) / 0.7));
        const easeOut = 1 - Math.pow(1 - localP, 3);

        // Position: lerp between basePosition and exploded target
        const targetPos = shard.basePosition.clone().add(
          shard.explodeDirection.clone().multiplyScalar(shard.explodeDistance * 0.55 * easeOut)
        );
        shard.mesh.position.copy(targetPos);

        // Rotation: tumble outwards
        shard.mesh.rotation.set(
          shard.baseRotation.x + shard.explodeRotation.x * easeOut,
          shard.baseRotation.y + shard.explodeRotation.y * easeOut,
          shard.baseRotation.z + shard.explodeRotation.z * easeOut
        );

        // Scale down slightly on full explosion
        const s = 1 - easeOut * 0.25;
        shard.mesh.scale.set(shard.baseScale.x * s, shard.baseScale.y * s, shard.baseScale.z * s);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      particlesRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
