/* eslint-disable react/jsx-props-no-spreading */
import * as THREE from 'three';

import { Environment, Float, Lightformer, MeshReflectorMaterial, useTexture } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { RoundedBoxGeometry } from 'three-stdlib';
import { useFrame, useThree } from '@react-three/fiber';

const SCREEN_ASPECT = 190 / 101; // desktop screenshots are cropped to the gallery's 190:101 tiles
const PHONE_ASPECT = 243 / 491;

const MATERIALS = {
  aluminium: { color: '#e3e6ea', metalness: 0.92, roughness: 0.3 },
  aluminiumDark: { color: '#c9cdd3', metalness: 0.9, roughness: 0.36 },
  titanium: { color: '#5a5d65', metalness: 1, roughness: 0.22 },
  glass: { color: '#060608', metalness: 0.1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 },
  key: { color: '#1b1c20', metalness: 0.15, roughness: 0.62 },
  well: { color: '#2a2c31', metalness: 0.4, roughness: 0.55 },
};

function roundedRect(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - radius);
  shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(x + radius, y + height);
  shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + radius);
  shape.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
  return shape;
}

// A smooth, bevelled slab (laptop body, lid, phone) centred on its own origin, thickness along Z.
function useSlab(width, height, radius, depth, bevel) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(width - bevel * 2, height - bevel * 2, Math.max(0.001, radius - bevel)), {
      depth: Math.max(0.001, depth - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: 24,
    });
    g.center();
    g.computeVertexNormals();
    return g;
  }, [width, height, radius, depth, bevel]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

// Flat rounded rectangle with 0..1 UVs (screens, bezels).
function usePlate(width, height, radius) {
  const geometry = useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRect(width, height, radius), 24);
    const { uv, position } = g.attributes;
    for (let i = 0; i < uv.count; i += 1) uv.setXY(i, position.getX(i) / width + 0.5, position.getY(i) / height + 0.5);
    return g;
  }, [width, height, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function Display({ texture, width, aspect, radius, z }) {
  const geometry = usePlate(width, width / aspect, radius);
  return (
    <mesh geometry={geometry} position-z={z}>
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// Faint glossy layer over a display so it reads as glass.
function Glare({ width, height, radius, z }) {
  const geometry = usePlate(width, height, radius);
  return (
    <mesh geometry={geometry} position-z={z}>
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.07} roughness={0.05} metalness={0} clearcoat={1} envMapIntensity={2.2} depthWrite={false} />
    </mesh>
  );
}

// ~80 individual keys in a recessed well, laid out like a laptop keyboard.
function Keyboard({ y }) {
  const mesh = useRef();
  const keys = useMemo(() => {
    const unit = 0.205;
    const gap = 0.028;
    const rows = [
      { h: 0.6, widths: Array(14).fill(1) },
      { h: 1, widths: [...Array(13).fill(1), 1.5] },
      { h: 1, widths: [1.5, ...Array(13).fill(1)] },
      { h: 1, widths: [1.8, ...Array(11).fill(1), 1.7] },
      { h: 1, widths: [2.3, ...Array(10).fill(1), 2.2] },
      { h: 1, widths: [1, 1, 1, 1.25, 5.4, 1.25, 1, 1, 1] },
    ];
    const list = [];
    let z = -1.06;
    rows.forEach((row) => {
      const total = row.widths.reduce((a, b) => a + b, 0);
      const rowWidth = 14.5 * unit;
      const scale = rowWidth / total;
      let x = -rowWidth / 2;
      const depth = row.h * unit - gap;
      row.widths.forEach((w) => {
        list.push({ x: x + (w * scale) / 2, z: z + depth / 2, width: w * scale - gap, depth });
        x += w * scale;
      });
      z += row.h * unit;
    });
    return list;
  }, []);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 0.03, 1, 2, 0.012), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, y + 0.012, k.z), new THREE.Quaternion(), new THREE.Vector3(k.width, 1, k.depth));
      mesh.current.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [keys, y]);

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, y - 0.004, -0.38]}>
        <planeGeometry args={[3.08, 1.38]} />
        <meshStandardMaterial {...MATERIALS.well} />
      </mesh>
      <instancedMesh ref={mesh} args={[geometry, undefined, keys.length]}>
        <meshStandardMaterial {...MATERIALS.key} />
      </instancedMesh>
    </>
  );
}

function Laptop({ texture, isOpen }) {
  const lid = useRef();
  const base = useSlab(3.5, 2.42, 0.14, 0.11, 0.035);
  const lidShell = useSlab(3.5, 2.0, 0.14, 0.055, 0.02);
  const trackpad = usePlate(1.3, 0.8, 0.06);
  const bezel = usePlate(3.44, 1.94, 0.11);
  const displayWidth = 3.3;
  const displayHeight = displayWidth / SCREEN_ASPECT;

  useFrame((_, delta) => {
    if (!lid.current) return;
    // The lid opens when the window scrolls into view.
    lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, isOpen.current ? -0.24 : 1.52, 2.4, delta);
  });

  return (
    <group>
      <mesh geometry={base} rotation-x={-Math.PI / 2} position-y={0.055}>
        <meshPhysicalMaterial {...MATERIALS.aluminium} />
      </mesh>
      <Keyboard y={0.112} />
      <mesh geometry={trackpad} rotation-x={-Math.PI / 2} position={[0, 0.112, 0.72]}>
        <meshPhysicalMaterial {...MATERIALS.aluminiumDark} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      <mesh rotation-z={Math.PI / 2} position={[0, 0.115, -1.17]}>
        <cylinderGeometry args={[0.035, 0.035, 2.9, 24]} />
        <meshPhysicalMaterial {...MATERIALS.titanium} />
      </mesh>
      <group ref={lid} position={[0, 0.14, -1.17]} rotation-x={1.52}>
        <group position={[0, 1.0, 0]}>
          <mesh geometry={lidShell}>
            <meshPhysicalMaterial {...MATERIALS.aluminium} />
          </mesh>
          <mesh geometry={bezel} position-z={0.0285}>
            <meshPhysicalMaterial {...MATERIALS.glass} />
          </mesh>
          <Display texture={texture} width={displayWidth} aspect={SCREEN_ASPECT} radius={0.025} z={0.029} />
          <mesh position={[0, displayHeight / 2 + 0.045, 0.0295]}>
            <circleGeometry args={[0.014, 16]} />
            <meshBasicMaterial color="#1b1d24" />
          </mesh>
          <Glare width={3.44} height={1.94} radius={0.11} z={0.0305} />
        </group>
      </group>
    </group>
  );
}

function Phone({ texture, position, rotation }) {
  const body = useSlab(1.0, 2.04, 0.17, 0.085, 0.03);
  const front = usePlate(0.965, 2.005, 0.15);
  const island = usePlate(0.24, 0.07, 0.035);
  const screenWidth = 0.9;
  const screenHeight = screenWidth / PHONE_ASPECT;

  return (
    <Float speed={1.3} rotationIntensity={0.22} floatIntensity={0.5}>
      <group position={position} rotation={rotation}>
        <mesh geometry={body}>
          <meshPhysicalMaterial {...MATERIALS.titanium} />
        </mesh>
        <mesh geometry={front} position-z={0.0435}>
          <meshPhysicalMaterial {...MATERIALS.glass} />
        </mesh>
        <Display texture={texture} width={screenWidth} aspect={PHONE_ASPECT} radius={0.12} z={0.044} />
        <mesh geometry={island} position={[0, screenHeight / 2 - 0.065, 0.0445]}>
          <meshBasicMaterial color="#050507" />
        </mesh>
        <Glare width={0.965} height={2.005} radius={0.15} z={0.045} />
        {[0.42, 0.22, 0.05].map((y, i) => (
          <mesh key={y} position={[-0.505, y, 0]}>
            <capsuleGeometry args={[0.012, i === 0 ? 0.06 : 0.12, 4, 12]} />
            <meshPhysicalMaterial {...MATERIALS.titanium} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Tablet({ texture, position, rotation, aspect }) {
  const width = 2.5;
  const displayWidth = 2.36;
  const height = displayWidth / aspect + 0.16;
  const body = useSlab(width, height, 0.12, 0.05, 0.018);
  const front = usePlate(width - 0.03, height - 0.03, 0.11);

  return (
    <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.45}>
      <group position={position} rotation={rotation}>
        <mesh geometry={body}>
          <meshPhysicalMaterial {...MATERIALS.aluminium} />
        </mesh>
        <mesh geometry={front} position-z={0.026}>
          <meshPhysicalMaterial {...MATERIALS.glass} />
        </mesh>
        <Display texture={texture} width={displayWidth} aspect={aspect} radius={0.03} z={0.0265} />
        <Glare width={width - 0.03} height={height - 0.03} radius={0.11} z={0.0275} />
      </group>
    </Float>
  );
}

// Soft brand-coloured light behind the devices.
function Glow({ color }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 1.0, -3]}>
      <planeGeometry args={[13, 8]} />
      <meshBasicMaterial map={texture} color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// Dark glass floor that reflects the devices and fades out towards the edges.
function Floor() {
  const alpha = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.45, '#9a9a9a');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => alpha.dispose(), [alpha]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.3, 0]}>
      <planeGeometry args={[16, 16]} />
      <MeshReflectorMaterial
        alphaMap={alpha}
        transparent
        blur={[220, 70]}
        resolution={1024}
        mixBlur={1}
        mixStrength={5}
        mixContrast={1.1}
        roughness={0.55}
        metalness={0.5}
        mirror={0.85}
        depthScale={0.9}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.3}
        color="#16161d"
      />
    </mesh>
  );
}

// Studio reflections: soft boxes around the scene, rendered once into the environment map.
function Studio() {
  return (
    <Environment files="/other/studio_small_09_1k.hdr" resolution={512} frames={1} environmentIntensity={1.15}>
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#dfe6ff" position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 2, 8]} scale={3} />
      <Lightformer form="rect" intensity={0.6} color="#ffffff" position={[0, -3, -6]} scale={[12, 2, 1]} />
    </Environment>
  );
}

// The project's laptop + phone (or floating tablet). `track` is the window element (for scroll
// position), `drag` holds the user's drag offset, `isOpen` opens the laptop lid.
export default function DeviceScene({ project, track, drag, isOpen, mirrored = false }) {
  const group = useRef();
  const urls = useMemo(() => [project.device.screen, project.device.phone || project.device.panel], [project]);
  const [screen, second] = useTexture(urls);

  useMemo(() => {
    [screen, second].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.needsUpdate = true;
    });
  }, [screen, second]);

  // Narrow (mobile) windows show less width, so pull the camera back to keep both devices in frame.
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);
  useEffect(() => {
    camera.position.set(0, 1.9, aspect < 1.15 ? 11.2 : 8.9);
    camera.lookAt(0, 1.0, 0);
  }, [camera, aspect]);

  const side = mirrored ? -1 : 1;
  const secondAspect = second.image ? second.image.width / second.image.height : SCREEN_ASPECT;
  const hasPhone = Boolean(project.device.phone);

  useFrame((_, delta) => {
    if (!group.current || !track.current) return;
    // Turn slightly as the window travels through the viewport, plus whatever the user dragged.
    const rect = track.current.getBoundingClientRect();
    const progress = THREE.MathUtils.clamp((rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight, -1, 1);
    const targetY = side * -0.36 + progress * 0.3 * side + drag.current;
    const targetX = 0.05 + progress * 0.05;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
  });

  return (
    <>
      <Studio />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 7, 5]} intensity={1.2} />
      {/* Cool rim light from behind outlines the aluminium edges against the dark. */}
      <spotLight position={[-4, 5, -6]} angle={0.7} penumbra={1} intensity={60} color="#a9bcff" />
      <Floor />
      <Glow color={project.accent} />
      <group ref={group} position={[side * (hasPhone ? -0.55 : -0.8), -0.3, 0]}>
        <Laptop texture={screen} isOpen={isOpen} />
        {hasPhone ? (
          <Phone texture={second} position={[side * 2.2, 1.1, 1.15]} rotation={[0, side * -0.4, side * -0.04]} />
        ) : (
          <Tablet texture={second} aspect={secondAspect} position={[side * 2.15, 1.8, -2.0]} rotation={[0, side * -0.24, 0]} />
        )}
      </group>
    </>
  );
}
