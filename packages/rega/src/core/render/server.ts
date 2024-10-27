import { TransferObject } from "./types";

class RenderServer {
  private worker: Worker;

  constructor() {
    const worker = new Worker(import.meta.resolve("./worker.ts"), {
      type: "module",
    });
    this.worker = worker;
  }

  async init(canvas: HTMLCanvasElement) {
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
        },
        [offscreenCanvas]
      );
    });
  }

  addObject(object: TransferObject) {
    this.worker.postMessage({
      type: "addObject",
      object,
    });
  }

  removeObject(id: string) {
    this.worker.postMessage({
      type: "removeObject",
      objectID: id,
    });
  }
}

export default RenderServer;
