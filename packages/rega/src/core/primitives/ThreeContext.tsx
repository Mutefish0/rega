import { createContext } from "react";

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
  size,
  assetsPixelRatio,
  fixedTimestep = 20,
  pixelRatio = 1,
}: {
  size?: [number, number];
  assetsPixelRatio: number;
  fixedTimestep?: number;
  pixelRatio?: number;
}) {
  return {
    id: Math.random().toString(36).slice(2),
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
