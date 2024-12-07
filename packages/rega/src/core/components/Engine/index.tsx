import { ReactElement } from "react";
import type { ColorSpace } from "three";
import renderer from "./reconciler";
import Physics from "../../primitives/Physics";
import InputSystem from "../InputSystem";
import GameStateContext from "../../primitives/GameStateContext";
import ThreeContext, {
  createContextValues,
} from "../../primitives/ThreeContext";
import RenderContext, {
  createRenderContext,
} from "../../primitives/RenderContext";

import { YogaSystem } from "../YogaFlex/system";
import RenderServer from "../../render/server";

// @ts-ignore
const isDeno = typeof Deno !== "undefined";

interface CanvasLike {
  width: number;
  height: number;
  style: Record<string, any>;
}

export interface EngineConfig {
  width: number;
  height: number;
  title?: string;
  outputColorSpace?: ColorSpace;
  assetsPixelToWorldRatio?: number;
  fixedTimestep?: number;
  canvas?: CanvasLike;
  backgroundColor?: string;
  performanceMode?: "high" | "normal";
}

export default function CoreEngine(app: ReactElement, config: EngineConfig) {
  const { width, height } = config;

  const gameState = { paused: false };

  let canvas = config.canvas;

  let pixelRatio = window.devicePixelRatio;
  let size = [width * pixelRatio, height * pixelRatio] as [number, number];

  if (!isDeno) {
    if (!canvas) {
      const _canvas = document.createElement("canvas");
      document.body.appendChild(_canvas as HTMLCanvasElement);
      canvas = _canvas;
    }
    canvas.width = size[0];
    canvas.height = size[1];
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  const renderServer = new RenderServer();

  const renderCtx = createRenderContext(renderServer);

  const ctx = createContextValues({
    assetsPixelToWorldRatio: config?.assetsPixelToWorldRatio ?? 1,
    fixedTimestep: config?.fixedTimestep,
    size,
    pixelRatio,
  });

  const container = { yogaRoots: [] };

  (window as any).con = container;

  const root = renderer.createContainer(
    container,
    1,
    null,
    false,
    null,
    "",
    () => {},
    null
  );

  renderServer
    .init(canvas as HTMLCanvasElement, config.backgroundColor || "#000")
    .then(() => {
      renderer.updateContainer(
        <ThreeContext.Provider value={ctx}>
          <GameStateContext.Provider value={gameState}>
            <InputSystem />
            <Physics>
              <RenderContext.Provider value={renderCtx}>
                {app}
              </RenderContext.Provider>
            </Physics>
          </GameStateContext.Provider>
        </ThreeContext.Provider>,
        root
      );
    });

  let lastTime = performance.now();

  function render() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    ctx.removedCallbacks.forEach((cb) => {
      ctx.frameCallbacks.delete(cb);
    });
    ctx.removedCallbacks.clear();
    ctx.frameCallbacks.forEach((cb) => cb(deltaTime, now));

    // check yoga layout
    for (const yogaRoot of container.yogaRoots) {
      YogaSystem.validateAndCalculateLayout(yogaRoot);
    }
  }

  function startHighPerformanceLoop() {
    let destroyed = false;
    const listener = (e: MessageEvent) => {
      if (e.data === "render") {
        render();
        if (!destroyed) {
          window.postMessage("render", "*");
        }
      }
    };
    window.addEventListener("message", listener);
    window.postMessage("render", "*");
    return () => {
      destroyed = true;
      window.removeEventListener("message", listener);
    };
  }

  function startLoop() {
    let timer: any = null;
    function loop() {
      render();
      timer = setTimeout(loop, 0);
    }
    loop();
    return () => clearTimeout(timer);
  }

  function pause() {
    gameState.paused = true;
  }

  function resume() {
    gameState.paused = false;
  }

  const stop =
    config.performanceMode === "high"
      ? startHighPerformanceLoop()
      : startLoop();

  function destroy() {
    stop();
    renderer.updateContainer(null, root);
    renderServer.destroy();
  }

  return {
    pause,
    resume,
    stop,
    destroy,
  };
}
