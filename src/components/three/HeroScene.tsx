import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const PROVIDER_COLORS = [
  '#00D4FF', '#9D4EDD', '#10A37F', '#FF6B9D', '#F59E0B',
  '#4285F4', '#0668E1', '#FF7000', '#76B900', '#FFD21E',
  '#D4A574', '#8B5CF6', '#06B6D4', '#EF4444', '#10B981',
];

interface SphereData {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  distort: number;
}

function AnimatedSphere({ data }: { data: SphereData }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * 0.3;
    meshRef.current.position.y =
      data.position[1] + Math.sin(t * data.speed) * 0.5;
  });

  return (
    <Float speed={data.speed} rotationIntensity={0.8} floatIntensity={1.5}>
      <mesh ref={meshRef} position={data.position} scale={data.scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={data.color}
          distort={data.distort}
          speed={2.5}
          roughness={0.15}
          metalness={0.85}
          emissive={data.color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function FloatingSpheres() {
  const spheres = useMemo<SphereData[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 2,
        ] as [number, number, number],
        color: PROVIDER_COLORS[i % PROVIDER_COLORS.length],
        scale: 0.2 + Math.random() * 0.6,
        speed: 0.5 + Math.random() * 2,
        distort: 0.2 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <>
      {spheres.map((s, i) => (
        <AnimatedSphere key={i} data={s} />
      ))}
    </>
  );
}

function NeuralLinks() {
  const linesRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 30; i++) {
      pts.push([
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8 - 3,
      ]);
    }
    return pts;
  }, []);

  const lineGeometries = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = Math.sqrt(
          (points[i][0] - points[j][0]) ** 2 +
          (points[i][1] - points[j][1]) ** 2 +
          (points[i][2] - points[j][2]) ** 2
        );
        if (dist < 5) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...points[i]),
            new THREE.Vector3(...points[j]),
          ]);
          geos.push(geo);
        }
      }
    }
    return geos;
  }, [points]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={linesRef}>
      {lineGeometries.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#00D4FF" transparent opacity={0.06} />
        </line>
      ))}
      {points.map((p, i) => (
        <mesh key={`node-${i}`} position={p}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function CentralGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial color="#9D4EDD" transparent opacity={0.03} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#00D4FF" />
          <pointLight position={[-10, -5, 5]} intensity={0.5} color="#9D4EDD" />
          <Stars
            radius={80}
            depth={60}
            count={3000}
            factor={3}
            saturation={0}
            fade
            speed={0.5}
          />
          <FloatingSpheres />
          <NeuralLinks />
          <CentralGlow />
        </Suspense>
      </Canvas>
    </div>
  );
}