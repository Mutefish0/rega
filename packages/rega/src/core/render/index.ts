/// <reference types="@webgpu/types" />

export type * from "./types";

// import {
//   vec4,
//   cameraProjectionMatrix,
//   attribute,
//   modelViewMatrix,
//   positionGeometry,
//   uniform,
// } from "three/src/nodes/TSL.js";

// import { createPlaneGeometry } from "../objects/plane/utils";

// import RenderServer from "./server";

// import createMaterial from "./createMaterial";
// import createIndexBuffer from "./createIndexBuffer";
// import createVertexBuffers from "./createVertexBuffers";

// const server = new RenderServer();

// const opacity = uniform(0.1, "float");

// const material = createMaterial(
//   vec4(positionGeometry, 1.0),
//   vec4(1, 0, 0, opacity)
// );

// const opacityHandle = material.bindMap.get(opacity.uuid)!;

// const geometry = createPlaneGeometry();

// const vertexBuffers = createVertexBuffers(
//   material.material,
//   geometry.vertexCount
// );

// const vs = new Float32Array(vertexBuffers.bufferMap.get("position")!);
// vs.set(geometry.vertices);

// const indexBuffer = createIndexBuffer(geometry.indices.length);
// new Uint16Array(indexBuffer).set(geometry.indices);

// server.init().then(() => {
//   server.addObject({
//     id: crypto.randomUUID(),
//     material: material.material,
//     bindings: material.transferBindings,
//     input: {
//       key: crypto.randomUUID(),
//       vertexBuffers: vertexBuffers.buffers,
//       vertexCount: geometry.vertexCount,
//       index: {
//         key: "rega_internal_plane",
//         indexBuffer,
//         indexFormat: "uint16",
//         indexCount: geometry.indices.length,
//       },
//     },
//   });
// });

// setInterval(() => {
//   opacity.value = Math.random();
//   opacityHandle.update();
// }, 1000);
