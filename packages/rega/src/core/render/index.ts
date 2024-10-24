/// <reference types="@webgpu/types" />

import {
  vec4,
  cameraProjectionMatrix,
  attribute,
  modelViewMatrix,
  positionGeometry,
  uniform,
} from "three/src/nodes/TSL.js";

import createMaterial from "./createMaterial";

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

const bindOpacity = material.bindHandleMap.get(opacity.uuid)!;

worker.postMessage({
  type: "addObject",
  object: {
    material: material.material,
    bindings: Array.from(material.bindMap.values()),
  },
});

setInterval(() => {
  opacity.value = Math.random();
  bindOpacity.update();
}, 1000);
