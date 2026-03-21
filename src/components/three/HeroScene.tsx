import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  const orbs = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 2.5 + Math.sin(i * 1.5) * 1;
    const y = Math.sin(i * 0.8) * 1.5;
    return {
      position: [
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      color: i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#9D4EDD' : '#F472B6',
      scale: 0.15 + Math.random() * 0.25,
      speed: 1 + Math.random() * 2,
      distort: 0.2 + Math.random() * 0.3,
    };
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float
          key={i}
          speed={orb.speed}
          rotationIntensity={0.3}
          floatIntensity={0.5}
        >
          <Sphere args={[orb.scale, 32, 32]} position={orb.position}>
            <MeshDistortMaterial
              color={orb.color}
              transparent
              opacity={0.5}
              distort={orb.distort}
              speed={2}
              roughness={0.2}
              metalness={0.8}
            />
          </Sphere>
        </Float>
      ))}

      {/* Center orb — main focal point */}
      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0.3}>
        <Sphere args={[0.7, 64, 64]}>
          <MeshDistortMaterial
            color="#00D4FF"
            transparent
            opacity={0.25}
            distort={0.4}
            speed={3}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </Float>

      {/* Inner ring */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#9D4EDD"
            transparent
            opacity={0.08}
            distort={0.2}
            speed={1.5}
            roughness={0.3}
            metalness={0.7}
            wireframe
          />
        </Sphere>
      </Float>

      {/* Outer shell */}
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <Sphere args={[3.5, 48, 48]}>
          <MeshDistortMaterial
            color="#00D4FF"
            transparent
            opacity={0.03}
            distort={0.1}
            speed={1}
            wireframe
          />
        </Sphere>
      </Float>
    </group>
  );
}

function Particles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 4 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Cyan or purple tint
    if (Math.random() > 0.5) {
      colors[i3] = 0;
      colors[i3 + 1] = 0.83;
      colors[i3 + 2] = 1;
    } else {
      colors[i3] = 0.616;
      colors[i3 + 1] = 0.306;
      colors[i3 + 2] = 0.867;
    }
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00D4FF" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#9D4EDD" />
      <pointLight position={[5, -10, 5]} intensity={0.2} color="#F472B6" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.3}
        color="#00D4FF"
      />
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 opacity-80">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Lights />
        <FloatingOrbs />
        <Particles />
      </Canvas>
    </div>
  );
}