import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type PartSpec = {
  name: string;
  geometry: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  explode: [number, number, number];
};

const PARTS: PartSpec[] = [
  { name: "deck", geometry: [1.8, 0.35, 3.6], position: [0, 0.55, 0], color: "#6b2126", explode: [0, 0.8, 0] },
  { name: "front-fender", geometry: [0.15, 0.7, 1.1], position: [0, 0.45, 1.85], color: "#581e14", explode: [0, 0.3, 1.2] },
  { name: "rear-fender", geometry: [0.15, 0.55, 1.2], position: [0, 0.5, -1.75], color: "#581e14", explode: [0, 0.25, -1.1] },
  { name: "seat", geometry: [0.9, 0.18, 1.4], position: [0, 0.95, -0.15], color: "#1a1412", explode: [0, 1.1, -0.2] },
  { name: "handlebar-stem", geometry: [0.12, 0.9, 0.12], position: [0, 1.35, 0.95], color: "#c9d1d9", explode: [0, 1.6, 0.5] },
  { name: "handlebar", geometry: [1.5, 0.08, 0.08], position: [0, 1.75, 0.95], color: "#c9d1d9", explode: [0, 2.1, 0.8] },
  { name: "headlight", geometry: [0.35, 0.35, 0.2], position: [0, 0.72, 2.05], color: "#e8e8e3", explode: [0, 0.5, 1.8] },
  { name: "front-wheel", geometry: [0.12, 0.85, 0.85], position: [0, 0.42, 1.55], rotation: [Math.PI / 2, 0, 0], color: "#111", explode: [0, -0.9, 1.4] },
  { name: "rear-wheel", geometry: [0.12, 0.95, 0.95], position: [0, 0.42, -1.45], rotation: [Math.PI / 2, 0, 0], color: "#111", explode: [0, -0.9, -1.3] },
  { name: "engine-block", geometry: [0.9, 0.55, 0.9], position: [0, 0.35, 0.2], color: "#36474c", explode: [0, -0.5, 0.3] },
  { name: "mirror-left", geometry: [0.08, 0.08, 0.25], position: [-0.55, 1.72, 0.85], color: "#888", explode: [-0.8, 1.9, 0.6] },
  { name: "mirror-right", geometry: [0.08, 0.08, 0.25], position: [0.55, 1.72, 0.85], color: "#888", explode: [0.8, 1.9, 0.6] },
];

function ScooterPart({ part, explodeAmount }: { part: PartSpec; explodeAmount: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useMemo(() => new THREE.Vector3(...part.position), [part.position]);
  const explode = useMemo(() => new THREE.Vector3(...part.explode), [part.explode]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = THREE.MathUtils.clamp(explodeAmount, 0, 1);
    mesh.position.copy(base).add(explode.clone().multiplyScalar(t));
    mesh.rotation.x = (part.rotation?.[0] ?? 0) + t * 0.15;
    mesh.rotation.y = (part.rotation?.[1] ?? 0) + t * 0.08;
    mesh.rotation.z = (part.rotation?.[2] ?? 0);
    if (explodeAmount < 0.05) {
      mesh.rotation.y += delta * 0.25;
    }
  });

  return (
    <mesh ref={ref} position={part.position} rotation={part.rotation}>
      <boxGeometry args={part.geometry} />
      <meshStandardMaterial color={part.color} roughness={0.35} metalness={0.18} />
    </mesh>
  );
}

function ScooterModel({ explodeAmount }: { explodeAmount: number }) {
  return (
    <group rotation={[0, -0.45, 0]} scale={0.85}>
      {PARTS.map((part) => (
        <ScooterPart key={part.name} part={part} explodeAmount={explodeAmount} />
      ))}
    </group>
  );
}

export default function ScooterExplodeScene({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [3.5, 2.2, 4.8], fov: 32 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#b8925a" />
        <ScooterModel explodeAmount={progress} />
        <ContactShadows position={[0, -0.05, 0]} opacity={0.38} scale={7} blur={2.2} far={3.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}

export const SCOOTER_PART_LABELS = [
  { label: "Frame / Deck", part: "deck" },
  { label: "Sensor Array", part: "headlight" },
  { label: "Power Core", part: "engine-block" },
  { label: "Drive Wheel", part: "rear-wheel" },
];
