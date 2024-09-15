import { Scene, Camera } from "three/webgpu";
import { ColorSpace } from "three";

interface CanvasLike {
  width: number;
  height: number;
  style: Record<string, any>;
}

export interface RenderHandler {
  render: (scene: Scene, camera: Camera) => void;
  clear: () => void;
  clearDepth: () => void;
  present?: () => void;
}

export type TickCallback = (deltaTime: number, hrNow: number) => void;
export type RenderCallback = (renderHandler: RenderHandler) => void;

interface Renderer {
  setup(): Promise<void>;
  start(): void;
  stop(): void;
  resume(): void;
  pause(): void;
  getPixelRatio(): number;
}

export interface RendererConstructor {
  new (
    tickCallback: TickCallback,
    renderCallback: RenderCallback,
    config: RendererConfig
  ): Renderer;
}

export interface RendererConfig {
  width: number;
  height: number;
  canvas?: CanvasLike;
  outputColorSpace?: ColorSpace;
  title?: string;
}
