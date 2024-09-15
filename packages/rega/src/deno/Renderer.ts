// prettier-ignore

import { RendererConfig, TickCallback, RenderCallback, RenderHandler } from "../core/components/Engine/renderer";
import { Scene } from "three/webgpu";
import type { ColorSpace } from "three";
import { WebGPURenderer } from "three/webgpu";

import WebGPUTextureUtils from "three/src/renderers/webgpu/utils/WebGPUTextureUtils.js";

import {
  createWindow,
  getPrimaryMonitor,
  mainloop,
  // @ts-ignore
} from "https://deno.land/x/dwm@0.3.6/mod.ts";

export default class Renderer {
  private tickCallback: TickCallback;
  private renderCallback: RenderCallback;
  private paused = false;
  private lastTime = 0;

  private width: number;
  private height: number;
  private pixelRatio = 1;
  private outputColorSpace: ColorSpace;

  private title: string;

  private renderHandler!: RenderHandler;

  constructor(
    tickCallback: TickCallback,
    renderCallback: RenderCallback,
    config: RendererConfig
  ) {
    this.tickCallback = tickCallback;
    this.renderCallback = renderCallback;
    const { width, height } = config;
    this.width = width;
    this.height = height;
    this.outputColorSpace = config.outputColorSpace || "srgb";
    this.title = config.title || "Deno";
  }

  async setup() {
    // @ts-ignore
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter!.requestDevice();

    let cs = 1;

    // @ts-ignore
    if (Deno.build.os === "windows") {
      const monitor = getPrimaryMonitor();
      cs = monitor.contentScale.x;
    }

    const window = createWindow({
      title: this.title,
      width: this.width * cs,
      height: this.height * cs,
      resizable: false,
    });

    const surface = window.windowSurface();
    const context = surface.getContext("webgpu");

    const scale = window.contentScale.x;

    this.pixelRatio = scale;

    // https://github.com/denoland/deno/issues/23508
    const oConfigure = context.configure;
    context.configure = (config: any) =>
      oConfigure.call(context, {
        ...config,
        width: this.width * this.pixelRatio,
        height: this.height * this.pixelRatio,
        presentMode: "autoNoVsync",
      });

    const renderer = new WebGPURenderer({
      // @ts-ignore
      context,
      adapter,
      device,
      canvas: {
        width: this.width * this.pixelRatio,
        height: this.height * this.pixelRatio,
        style: {} as any,
      } as HTMLCanvasElement,
      alpha: false,
    });

    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(this.pixelRatio);
    renderer.autoClear = false;
    renderer.outputColorSpace = this.outputColorSpace;

    const utils = new WebGPUTextureUtils(renderer.backend);

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

    await renderer.init();

    this.renderHandler = {
      render: (scene: Scene, camera: any) => {
        renderer.render(scene, camera);
      },

      clear: () => {
        renderer.clear();
      },

      clearDepth: () => {
        renderer.clearDepth();
      },

      present: () => {
        surface.present();
      },
    };
  }

  getPixelRatio() {
    return this.pixelRatio;
  }

  start = () => {
    mainloop((now: number) => {
      if (!this.paused) {
        const deltaTime = now - this.lastTime;
        this.tickCallback(deltaTime, now);
        this.renderCallback(this.renderHandler);
        this.lastTime = now;
      }
    }, false);
  };

  stop() {
    this.paused = true;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }
}
