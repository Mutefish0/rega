import { createContext } from "react";
import { ArrayCamera, Vector4Like, Scene } from "three/webgpu";

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  }
}

type FrameCallback = (deltaTime: number, time: number) => void;

const ThreeContext = createContext<ReturnType<typeof createContextValues>>(
  {} as any
);

export function createContextValues({
  scene,
  guiScene,
  camera,
  size,
  assetsPixelRatio,
  fixedTimestep = 20,
}: {
  scene: Scene;
  guiScene: Scene;
  camera: ArrayCamera;
  size?: [number, number];
  assetsPixelRatio: number;
  fixedTimestep?: number;
}) {
  return {
    id: Math.random().toString(36).slice(2),
    camera,
    scene,
    guiScene,
    viewportMap: new Map<string, Vector4Like>(),
    size: size || [0, 0],
    frameCallbacks: new Set<FrameCallback>(),
    removedCallbacks: new Set<FrameCallback>(),
    assetsPixelRatio,
    fixedTimestep,
    reactDevtools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    dev: !!(import.meta as any).env.DEV,
    now: performance.now(),
    pixelRatio: 1,
  };
}

export default ThreeContext;
