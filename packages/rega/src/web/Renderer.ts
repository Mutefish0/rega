import {
  RendererConfig,
  TickCallback,
  RenderCallback,
} from "../core/components/Engine/renderer";
import { Scene } from "three/webgpu";
import { WebGPURenderer } from "three/webgpu";

import WebGPUTextureUtils from "three/src/renderers/webgpu/utils/WebGPUTextureUtils.js";

export default class Renderer {
  private renderer: WebGPURenderer;
  private tickCallback: TickCallback;
  private renderCallback: RenderCallback;
  private paused = false;
  private lastTime = 0;
  private animationFrameId = 0;
  private pixelRatio = window.devicePixelRatio;

  constructor(
    tickCallback: TickCallback,
    renderCallback: RenderCallback,
    config: RendererConfig
  ) {
    this.tickCallback = tickCallback;
    this.renderCallback = renderCallback;
    const { width, height } = config;

    const renderer = new WebGPURenderer({
      canvas: config.canvas as HTMLCanvasElement,
    });

    renderer.setPixelRatio(this.pixelRatio);
    renderer.setSize(width, height);
    renderer.outputColorSpace = config.outputColorSpace || "srgb";
    renderer.autoClear = false;
    this.renderer = renderer;
  }

  getPixelRatio() {
    return this.pixelRatio;
  }

  renderHadler = {
    render: (scene: Scene, camera: any) => {
      this.renderer.render(scene, camera);
    },
    clear: () => {
      this.renderer.clear();
    },
    clearDepth: () => {
      this.renderer.clearDepth();
    },
  };

  async setup() {
    await this.renderer.init();

    const utils = new WebGPUTextureUtils(this.renderer.backend);

    const device = (this.renderer.backend as any).device;

    device.queue.copyExternalImageToTexture = (
      { source }: any,
      { texture, mipLevel, origin }: any,
      { width, height, depthOrArrayLayers }: any
    ) => {
      const bytesPerTexel = utils._getBytesPerTexel(texture.format)!;

      const bytesPerRow = source.width * bytesPerTexel;

      device.queue.writeTexture(
        {
          texture,
          mipLevel,
          origin,
        },
        source.data,
        {
          offset: 0,
          bytesPerRow,
        },
        {
          width,
          height,
          depthOrArrayLayers,
        }
      );
    };
  }

  start = () => {
    if (!this.paused) {
      const now = performance.now();
      const deltaTime = now - this.lastTime;

      this.tickCallback(deltaTime, now);
      this.renderCallback(this.renderHadler);

      this.lastTime = now;
      this.animationFrameId = requestAnimationFrame(this.start);
    }
  };

  stop() {
    this.paused = true;
    cancelAnimationFrame(this.animationFrameId);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}
