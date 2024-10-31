import { ReactElement } from "react";
import { ArrayCamera, Color, Scene, OrthographicCamera } from "three/webgpu";
import type { ColorSpace } from "three";
import reconciler from "./reconciler";
import Physics from "../../primitives/Physics";
import InputSystem from "../InputSystem";
import GameStateContext from "../../primitives/GameStateContext";
import SceneContext from "../../primitives/SceneContext";
import ThreeContext, {
  createContextValues,
} from "../../primitives/ThreeContext";
import { parseColor } from "../../tools/color";
import RenderServer from "../../render/server";
import { RendererConstructor, RenderHandler } from "./renderer";

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
  assetsPixelRatio?: number;
  fixedTimestep?: number;
  canvas?: CanvasLike;
  backgroundColor?: string;
}

export default function CoreEngine(
  app: ReactElement,
  config: EngineConfig,
  rendererConstructor: RendererConstructor
) {
  const { width, height } = config;
  const camera = new ArrayCamera();
  const scene = new Scene();
  const guiScene = new Scene();
  const guiCamera = new OrthographicCamera(0, width, 0, -height, -1000, 1000);

  const gameState = { paused: false };

  const c = parseColor(config.backgroundColor ?? "rgb(255,255,255)");

  scene.background = new Color().fromArray(c.array);

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

  const ctx = createContextValues({
    renderServer,
    scene,
    guiScene,
    camera,
    assetsPixelRatio: config?.assetsPixelRatio ?? 1,
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

  renderServer.init(canvas as HTMLCanvasElement).then(() => {
    reconciler.updateContainer(
      <ThreeContext.Provider value={ctx}>
        <GameStateContext.Provider value={gameState}>
          <InputSystem />
          <Physics>
            <SceneContext.Provider value="world">{app}</SceneContext.Provider>
          </Physics>
        </GameStateContext.Provider>
      </ThreeContext.Provider>,
      root
    );
  });

  // const renderer = new rendererConstructor(
  //   (deltaTime, now) => {
  //     ctx.removedCallbacks.forEach((cb) => {
  //       ctx.frameCallbacks.delete(cb);
  //     });
  //     ctx.removedCallbacks.clear();
  //     ctx.frameCallbacks.forEach((cb) => cb(deltaTime, now));
  //   },
  //   (renderHandler: RenderHandler) => {
  //     renderHandler.clear();

  //     for (const camera of ctx.camera.cameras) {
  //       // @ts-ignore
  //       const cid = camera.cid;
  //       const viewport = ctx.viewportMap.get(cid);
  //       if (viewport) {
  //         camera.viewport!.copy(viewport);
  //       }
  //     }

  //     // render world
  //     renderHandler.render(scene, ctx.camera);
  //     renderHandler.clearDepth();
  //     // render gui
  //     renderHandler.render(guiScene, guiCamera);
  //     renderHandler.present?.();
  //   },
  //   {
  //     width,
  //     height,
  //     canvas: canvas,
  //     outputColorSpace: config.outputColorSpace,
  //     title: config.title,
  //   }
  // );

  // renderer.setup().then(() => {
  //   const pixelRatio = renderer.getPixelRatio();
  //   ctx.size = [width * pixelRatio, height * pixelRatio];
  //   ctx.pixelRatio = pixelRatio;

  //   reconciler.updateContainer(
  //     <ThreeContext.Provider value={ctx}>
  //       <GameStateContext.Provider value={gameState}>
  //         <InputSystem />
  //         <Physics>
  //           <SceneContext.Provider value="world">{app}</SceneContext.Provider>
  //         </Physics>
  //       </GameStateContext.Provider>
  //     </ThreeContext.Provider>,
  //     root
  //   );

  //   renderer.start();
  // });

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
