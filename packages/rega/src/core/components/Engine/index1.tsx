import { ReactElement } from "react";
import type { ColorSpace } from "three";
import reconciler from "./reconciler";
import Physics from "../../primitives/Physics";
import InputSystem from "../InputSystem";
import GameStateContext from "../../primitives/GameStateContext";
import ThreeContext, {
  createContextValues,
} from "../../primitives/ThreeContext";
import RenderContext, {
  createRenderContext,
} from "../../primitives/RenderContext";
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
}

export default function CoreEngine(app: ReactElement, config: EngineConfig) {
  const { width, height } = config;

  //const scene = new Scene();
  //const guiScene = new Scene();
  // const guiCamera = new OrthographicCamera(0, width, 0, -height, -1000, 1000);

  const gameState = { paused: false };

  //scene.background = new Color().fromArray(c.array);

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

  const root = reconciler.createContainer(
    {},
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
      reconciler.updateContainer(
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

  // (deltaTime, now) => {
  //   ctx.removedCallbacks.forEach((cb) => {
  //     ctx.frameCallbacks.delete(cb);
  //   });
  //   ctx.removedCallbacks.clear();
  //   ctx.frameCallbacks.forEach((cb) => cb(deltaTime, now));
  // },

  let lastTime = performance.now();

  function loop() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    ctx.removedCallbacks.forEach((cb) => {
      ctx.frameCallbacks.delete(cb);
    });
    ctx.removedCallbacks.clear();
    ctx.frameCallbacks.forEach((cb) => cb(deltaTime, now));

    setTimeout(loop, 0);
  }

  loop();

  function pause() {
    gameState.paused = true;
  }

  function resume() {
    gameState.paused = false;
  }

  function stop() {
    gameState.paused = true;
  }

  return {
    pause,
    resume,
    stop,
  };
}
