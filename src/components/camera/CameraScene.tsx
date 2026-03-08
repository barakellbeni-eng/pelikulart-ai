import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Line } from "@react-three/drei";
import * as THREE from "three";

interface CameraSceneProps {
  imageUrl: string | null;
  rotate: number;
  vertical: number;
  zoom: number;
}

function OrbitRing({ rotate, vertical, zoom }: { rotate: number; vertical: number; zoom: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const camDotRef = useRef<THREE.Mesh>(null);
  const camDot2Ref = useRef<THREE.Mesh>(null);

  const radius = 2 + zoom * 0.3;

  useFrame(() => {
    if (!camDotRef.current || !camDot2Ref.current) return;
    const rotRad = (rotate * Math.PI) / 180;
    const vertRad = (vertical * Math.PI) / 180;

    camDotRef.current.position.set(
      Math.cos(rotRad) * radius,
      Math.sin(vertRad) * 1.5,
      Math.sin(rotRad) * radius
    );

    camDot2Ref.current.position.set(
      Math.cos(rotRad + Math.PI) * radius,
      Math.sin(-vertRad) * 1.5,
      Math.sin(rotRad + Math.PI) * radius
    );

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + vertRad * 0.3;
    }
  });

  const ringPoints = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
    const pts = curve.getPoints(64);
    return pts.map((p) => new THREE.Vector3(p.x, 0, p.y));
  }, [radius]);

  return (
    <group>
      {/* Orbit ring */}
      <group ref={ringRef as any} rotation={[0, 0, 0]}>
        <Line points={ringPoints} color="#4466ff" lineWidth={2} transparent opacity={0.8} />
      </group>

      {/* Camera dot 1 - purple */}
      <mesh ref={camDotRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>

      {/* Camera dot 2 - blue */}
      <mesh ref={camDot2Ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function ImagePlane({ imageUrl }: { imageUrl: string | null }) {
  const texture = useMemo(() => {
    if (!imageUrl) return null;
    const loader = new THREE.TextureLoader();
    return loader.load(imageUrl);
  }, [imageUrl]);

  if (!texture) {
    return (
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.6, 0]}>
      <planeGeometry args={[1.6, 1.2]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}

const CameraScene = ({ imageUrl, rotate, vertical, zoom }: CameraSceneProps) => {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 45 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Environment preset="night" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#4466ff" />

      {/* Grid floor */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1a1a3e"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#2a2a5e"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0, 0]}
      />

      {/* Image in center */}
      <ImagePlane imageUrl={imageUrl} />

      {/* Orbit ring + camera dots */}
      <OrbitRing rotate={rotate} vertical={vertical} zoom={zoom} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
};

export default CameraScene;
