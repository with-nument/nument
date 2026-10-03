import { PerspectiveCamera, useTexture } from '@react-three/drei';
import { useCallback, useEffect, useState } from 'react';

import { Physics } from '@react-three/rapier';
import Sticker from '@src/components/dom/prefooter/Sticker';
import useIsMobile from '@src/hooks/useIsMobile';
import { useThree } from '@react-three/fiber';

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, 5]} intensity={1} />
      <directionalLight position={[0, 5, -5]} intensity={1} />
    </>
  );
}

// The AI stack we build with (Simple Icons, CC0). Each has a matching "sliced" texture.
const LOGOS = ['python', 'pytorch', 'tensorflow', 'huggingface', 'langchain', 'googlegemini', 'claude', 'docker', 'kubernetes', 'nvidia'];
const LOGO_URLS = LOGOS.map((logo) => `/logos/${logo}.webp`);
const SLICED_LOGO_URLS = LOGOS.map((logo) => `/logos/sliced/${logo}Sliced.webp`);

const MAX_FRUITS = 30;

let fruitId = 0;

// Spawns a few logos at a time while the game is on screen; each one removes itself after
// falling back out of view, so the scene never accumulates physics bodies.
function useFruitSpawner(viewport, isMobile, logoCount, isVisible) {
  const [fruits, setFruits] = useState([]);

  const removeFruit = useCallback((id) => setFruits((prev) => prev.filter((fruit) => fruit.id !== id)), []);

  useEffect(() => {
    if (!isVisible) return undefined;

    const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const intervalTimer = setInterval(
      () => {
        const width = viewport.width / 2 - 1;
        setFruits((prevFruits) => {
          const newFruits = Array.from({ length: getRandomNumber(1, 6) }, () => {
            fruitId += 1;
            return { id: fruitId, x: getRandomNumber(width * -1, width), logo: getRandomNumber(0, logoCount - 1) };
          });
          return [...prevFruits, ...newFruits].slice(-MAX_FRUITS);
        });
      },
      (isMobile ? 5 : 3) * 1000,
    );

    return () => clearInterval(intervalTimer);
  }, [isMobile, isVisible, logoCount, viewport.width]);

  return [fruits, removeFruit];
}

// Pauses spawning while the canvas is scrolled out of view.
function useCanvasVisible() {
  const canvas = useThree((state) => state.gl.domElement);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvas]);

  return isVisible;
}

function FruitNinja() {
  const { viewport } = useThree();
  const isMobile = useIsMobile();
  const textures = useTexture(LOGO_URLS);
  const slicedTextures = useTexture(SLICED_LOGO_URLS);
  const isVisible = useCanvasVisible();
  const [fruits, removeFruit] = useFruitSpawner(viewport, isMobile, textures.length, isVisible);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Lighting />
      <Physics interpolate timeStep={1 / 60} gravity={[0, -15, 0]} colliders={false}>
        {fruits.map((fruit) => (
          <Sticker key={fruit.id} id={fruit.id} positionX={fruit.x} image={textures[fruit.logo]} imageSliced={slicedTextures[fruit.logo]} onRemove={removeFruit} />
        ))}
      </Physics>
    </>
  );
}

export default FruitNinja;
