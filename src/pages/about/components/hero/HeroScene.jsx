/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';

import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// The Nument "N" (same outline as the favicon / pinned-tab icon), as a bevelled glass solid.
function useMonogram() {
  const geometry = useMemo(() => {
    const pts = [
      [14, 10],
      [33, 10],
      [67, 62],
      [67, 10],
      [86, 10],
      [86, 90],
      [67, 90],
      [33, 38],
      [33, 90],
      [14, 90],
    ];
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2((x - 50) / 26, (50 - y) / 26)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.09, bevelSegments: 10, curveSegments: 1 });
    g.center();
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

// Slow-moving light in the five project colours, for the glass to refract.
const backdropShader = {
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv;
    vec3 blob(vec2 uv, vec2 c, float r, vec3 col) { float d = length(uv - c); return col * smoothstep(r, 0.0, d); }
    void main() {
      vec2 uv = vUv; float t = uTime * 0.12;
      vec3 col = vec3(0.035, 0.035, 0.045);
      col += blob(uv, vec2(0.30 + 0.12 * sin(t * 1.3), 0.55 + 0.10 * cos(t * 1.1)), 0.42, vec3(0.0, 0.16, 1.0)) * 0.9;
      col += blob(uv, vec2(0.68 + 0.10 * cos(t * 0.9), 0.62 + 0.12 * sin(t * 1.4)), 0.38, vec3(0.36, 0.34, 0.92)) * 0.8;
      col += blob(uv, vec2(0.55 + 0.14 * sin(t * 0.7 + 2.0), 0.30 + 0.08 * cos(t)), 0.30, vec3(1.0, 0.34, 0.24)) * 0.55;
      col += blob(uv, vec2(0.20 + 0.10 * cos(t * 1.7), 0.25 + 0.10 * sin(t * 0.8)), 0.25, vec3(0.91, 1.0, 0.78)) * 0.35;
      col += blob(uv, vec2(0.85 + 0.06 * sin(t * 1.2), 0.25 + 0.06 * cos(t * 1.6)), 0.22, vec3(0.0, 0.66, 0.76)) * 0.4;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

function Backdrop() {
  const material = useRef();
  useFrame((_, delta) => {
    material.current.uniforms.uTime.value += delta;
  });
  return (
    <mesh position={[0, 0, -4]} scale={[22, 12, 1]}>
      <planeGeometry />
      <shaderMaterial ref={material} args={[backdropShader]} toneMapped={false} />
    </mesh>
  );
}

// Thin glowing bars behind the glass, like studio strip lights: the glass bends them into
// crisp highlights, which is what makes it read as crystal.
function LightBars() {
  const group = useRef();
  // Soft-edged strip: bright core fading out sideways, so the bars read as light, not lines.
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 4;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 64, 0);
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 4);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((state) => {
    group.current.position.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.6;
  });
  const bars = [
    { x: -2.4, w: 0.5, c: '#ffffff', o: 0.55 },
    { x: -0.9, w: 0.8, c: '#9fb4ff', o: 0.45 },
    { x: 0.7, w: 0.4, c: '#ffffff', o: 0.5 },
    { x: 2.1, w: 0.9, c: '#ffb3a6', o: 0.35 },
    { x: 3.4, w: 0.5, c: '#e8ffc8', o: 0.4 },
  ];
  return (
    <group ref={group} position={[0, 0, -2.2]}>
      {bars.map((b) => (
        <mesh key={b.x} position={[b.x, 0, 0]} rotation-z={0.18}>
          <planeGeometry args={[b.w, 9]} />
          <meshBasicMaterial map={texture} color={b.c} transparent opacity={b.o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Monogram() {
  const group = useRef();
  const geometry = useMonogram();
  const { viewport } = useThree();
  // Keep the whole letter in frame with room around it, on any window shape.
  const scale = Math.min((viewport.height * 0.6) / 3.2, (viewport.width * 0.55) / 2.9);

  // Follows the pointer gently and breathes when idle.
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.55 + Math.sin(t * 0.35) * 0.18, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.35 + Math.cos(t * 0.3) * 0.06, 3, delta);
    g.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={group} scale={scale}>
      <mesh geometry={geometry}>
        <MeshTransmissionMaterial
          samples={10}
          resolution={1024}
          thickness={0.55}
          roughness={0.02}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropicBlur={0}
          distortion={0.04}
          distortionScale={0.3}
          temporalDistortion={0.04}
          backside
          backsideThickness={0.6}
          color="#ffffff"
          clearcoat={1}
          clearcoatRoughness={0.05}
          iridescence={0.35}
          iridescenceIOR={1.3}
          attenuationColor="#f2f4ff"
          attenuationDistance={6}
        />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <>
      <color attach="background" args={['#09090c']} />
      <Backdrop />
      <LightBars />
      <Monogram />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 3]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={2} color="#cfd8ff" position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[0, 0, 6]} scale={2.5} />
      </Environment>
    </>
  );
}
