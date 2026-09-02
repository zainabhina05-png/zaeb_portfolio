import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COLORS = ["#b2d4dd", "#476b7b", "#806d94", "#6b2126", "#d9d7c9", "#e8e8e3"];

function Cubie({ position, colorIndex }: { position: [number, number, number]; colorIndex: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      <meshStandardMaterial color={COLORS[colorIndex % COLORS.length]} roughness={0.25} metalness={0.14} />
    </mesh>
  );
}

function RubikAssembly({ solveProgress, tearProgress }: { solveProgress: number; tearProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const tearRef = useRef<THREE.Mesh>(null);
  const spacing = 1;

  const cubies = useMemo(() => {
    const items: { pos: [number, number, number]; color: number }[] = [];
    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          if (x === 1 && y === 1 && z === 1) continue;
          items.push({ pos: [x * spacing, y * spacing, z * spacing], color: (x + y + z + 3) % COLORS.length });
        }
      }
    }
    return items;
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    const tear = tearRef.current;
    if (!group) return;

    const solve = THREE.MathUtils.clamp(solveProgress, 0, 1);
    group.rotation.set(
      THREE.MathUtils.lerp(-0.42, -0.16, solve),
      THREE.MathUtils.lerp(0.72, 0.08, solve),
      THREE.MathUtils.lerp(0.18, 0, solve),
    );

    if (tear) {
      const t = THREE.MathUtils.clamp(tearProgress, 0, 1);
      tear.position.set(
        spacing + t * -4.5,
        spacing + t * 1.2 + Math.sin(t * Math.PI) * 0.5,
        spacing + t * 1.8,
      );
      tear.rotation.set(t * 0.9, t * -1.6, t * 0.4);
    }
  });

  return (
    <>
      <group ref={groupRef}>
        {cubies.map((cubie, index) => (
          <Cubie key={index} position={cubie.pos} colorIndex={cubie.color} />
        ))}
      </group>
      <mesh ref={tearRef} position={[spacing, spacing, spacing]}>
        <boxGeometry args={[0.92, 0.92, 0.92]} />
        <meshStandardMaterial color="#c6dce2" roughness={0.2} metalness={0.2} emissive="#587384" emissiveIntensity={0.15} />
      </mesh>
    </>
  );
}

export default function RubiksCubeScene({ progress, className = "" }: { progress: number; className?: string }) {
  const solveProgress = Math.min(1, progress / 0.4);
  const tearProgress = progress <= 0.4 ? 0 : Math.min(1, (progress - 0.4) / 0.15);

  return (
    <div className={className} aria-hidden="true">
      <Canvas camera={{ position: [4.2, 3.4, 5], fov: 36 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.42} />
        <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#b8d0db" />
        <RubikAssembly solveProgress={solveProgress} tearProgress={tearProgress} />
        <ContactShadows position={[0, -1.55, 0]} opacity={0.45} scale={8} blur={2.4} far={4} />
      </Canvas>
    </div>
  );
}
