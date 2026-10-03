import { Suspense, useEffect, useRef, useState } from 'react';

import { EffectComposer, N8AO, Vignette } from '@react-three/postprocessing';

import { Canvas } from '@react-three/fiber';
import DeviceScene from '@src/components/projects/DeviceScene';
import { useIntersection } from 'react-use';

// A "window" cut into the page through which the project's 3D devices render. Each window has its
// own renderer (sRGB, filmic tone mapping, up to 2x resolution) and only draws while on screen.
// Drag sideways to turn the devices; they settle back when released.
export default function DeviceWindow({ project, className, mirrored = false }) {
  const ref = useRef();
  const drag = useRef(0);
  const isOpen = useRef(false);
  const [onScreen, setOnScreen] = useState(false);
  const intersection = useIntersection(ref, { threshold: 0, rootMargin: '200px' });
  const lidTrigger = useIntersection(ref, { threshold: 0.35 });

  useEffect(() => setOnScreen(Boolean(intersection?.isIntersecting)), [intersection]);
  useEffect(() => {
    if (lidTrigger?.isIntersecting) isOpen.current = true;
  }, [lidTrigger]);

  const onPointerDown = (e) => {
    const startX = e.clientX;
    const { width } = ref.current.getBoundingClientRect();
    const onMove = (ev) => {
      drag.current = ((ev.clientX - startX) / width) * 1.8;
    };
    const onUp = () => {
      drag.current = 0;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={ref}
      className={className}
      onPointerDown={onPointerDown}
      data-sound="hover"
      data-header="dark"
      role="img"
      aria-label={`${project.title} on a laptop and ${project.device.phone ? 'phone' : 'tablet'}`}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={onScreen ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMappingExposure: 1.1 }}
        camera={{ position: [0, 1.9, 8.9], fov: 30 }}
        onCreated={({ camera }) => camera.lookAt(0, 1.0, 0)}
        style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
      >
        <Suspense fallback={null}>
          <DeviceScene project={project} track={ref} drag={drag} isOpen={isOpen} mirrored={mirrored} />
          {/* Contact shadows in creases and a gentle vignette (no bloom: it hazes the UI text). */}
          <EffectComposer multisampling={4}>
            <N8AO halfRes aoRadius={0.5} intensity={2.2} distanceFalloff={0.8} />
            <Vignette offset={0.32} darkness={0.55} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
