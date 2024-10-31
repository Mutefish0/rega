import { createContext } from "react";
import { Scene } from "three/webgpu";
import RenderServer from "../render/server";
import { Matrix4 } from "pure3";

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
  size,
  assetsPixelRatio,
  fixedTimestep = 20,
  renderServer,
  pixelRatio = 1,
}: {
  scene: Scene;
  guiScene: Scene;
  renderServer: RenderServer;
  size?: [number, number];
  assetsPixelRatio: number;
  fixedTimestep?: number;
  pixelRatio?: number;
}) {
  return {
    id: Math.random().toString(36).slice(2),
    renderServer,
    scene,
    guiScene,

    cameras: new Map<
      string,
      {
        matrix: Matrix4;
        projectionMatrix: Matrix4;
      }
    >(),

    subScreens: Array<{
      viewport: [number, number, number, number];
      cameraId: string;
    }>,

    size: size || [0, 0],
    frameCallbacks: new Set<FrameCallback>(),
    removedCallbacks: new Set<FrameCallback>(),
    assetsPixelRatio,
    fixedTimestep,
    reactDevtools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
    dev: !!(import.meta as any).env.DEV,
    now: performance.now(),
    pixelRatio,
  };
}

export default ThreeContext;
