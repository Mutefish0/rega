import { TransferObject, TransferRenderTarget } from "./types";
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

  createRenderTarget(target: TransferRenderTarget) {
    this.worker.postMessage({
      type: "createRenderTarget",
      target,
    });
  }

  removeRenderTarget(id: string) {
    this.worker.postMessage({
      type: "removeRenderTarget",
      id,
    });
  }

  addObjectToTarget(targetId: string, objectId: string) {
    this.worker.postMessage({
      type: "addObjectToTarget",
      targetId,
      objectId,
    });
  }

  removeObjectFromTarget(targetId: string, objectId: string) {
    this.worker.postMessage({
      type: "removeObjectFromTarget",
      targetId,
      objectId,
    });
  }
}

export default RenderServer;
