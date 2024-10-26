/// <reference types="@webgpu/types" />

import {
  vec4,
  cameraProjectionMatrix,
  attribute,
  modelViewMatrix,
  positionGeometry,
  uniform,
} from "three/src/nodes/TSL.js";

import { TransferObject } from "./types";

import createMaterial from "./createMaterial";
import createVertexBuffers from "./createVertexBuffers";

const canvasEl = document.createElement("canvas");
document.body.appendChild(canvasEl);

const offscreenCanvas = canvasEl.transferControlToOffscreen();

const worker = new Worker(import.meta.resolve("./worker.ts"), {
  type: "module",
});

worker.postMessage(
  {
    type: "initCanvas",
    canvas: offscreenCanvas,
  },
  [offscreenCanvas]
);

const opacity = uniform(0.1, "float");
const material = createMaterial(
  vec4(positionGeometry, 1.0),
  vec4(1, 0, 0, opacity)
);

const opacityHandle = material.bindMap.get(opacity.uuid)!;

const vertexBuffers = createVertexBuffers(material.material, 3);

const vs = new Float32Array(vertexBuffers[0]);

vs.set([0.0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]);

worker.postMessage({
  type: "addObject",
  object: {
    id: crypto.randomUUID(),

    material: material.material,

    bindings: material.transferBindings,

    input: {
      key: crypto.randomUUID(),
      vertexBuffers,
      vertexCount: 3,
    },
  } as TransferObject,
});

setInterval(() => {
  opacity.value = Math.random();
  opacityHandle.update();
}, 1000);
