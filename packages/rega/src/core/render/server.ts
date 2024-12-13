import { TransferObject, TransferPipeline } from "./types";
// @ts-ignore
import RenderWorker from "./worker?worker";

class RenderServer {
  private worker: Worker;

  constructor() {
    const worker = new RenderWorker();
    this.worker = worker;
  }

  async init(canvas: HTMLCanvasElement, backgroundColor: string) {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    return new Promise<void>((resolve) => {
      this.worker.addEventListener("message", (event) => {
        if (event.data.type === "ready") {
          resolve();
        }
      });
      this.worker.postMessage(
        {
          type: "initCanvas",
          canvas: offscreenCanvas,
          backgroundColor,
        },
        [offscreenCanvas]
      );
    });
  }

  createObject(object: TransferObject) {
    this.worker.postMessage({
      type: "createObject",
      object,
    });
  }

  removeObject(id: string) {
    this.worker.postMessage({
      type: "removeObject",
      id,
    });
  }

  createRenderGroup(id: string) {
    this.worker.postMessage({
      type: "createRenderGroup",
      id,
    });
  }

  removeRenderGroup(id: string) {
    this.worker.postMessage({
      type: "removeRenderGroup",
      id,
    });
  }

  initPipeline(pipeline: TransferPipeline) {
    this.worker.postMessage({
      type: "initPipeline",
      pipeline,
    });
  }

  destroy() {
    this.worker.terminate();
  }
}

export default RenderServer;
