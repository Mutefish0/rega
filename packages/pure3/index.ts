import texture, { dataTexture } from "./accessors/texture/index";
import modelWorldMatrix from "./accessors/modelWorldMatrix";
import uniform from "./core/uniform";

export { texture, dataTexture, uniform, modelWorldMatrix };

import type { Node, WGSLValueType } from "./core/types";
export type { Node, WGSLValueType };

export * from "three/src/nodes/TSL.js";

export { float, vec2, vec3, vec4 } from "./core/conv";

import {
  uv as _uv,
  positionGeometry as _positionGeometry,
  cameraProjectionMatrix as _cameraProjectionMatrix,
  cameraViewMatrix as _cameraViewMatrix,
} from "three/src/nodes/TSL.js";
import { vec4 } from "./core/conv";

export {
  Vector2,
  Vector3,
  Vector4,
  Matrix2,
  Matrix3,
  Matrix4,
} from "three/src/Three.WebGPU.Nodes.js";

const positionGeometry = _positionGeometry as Node<"vec3">;
const cameraProjectionMatrix = _cameraProjectionMatrix as Node<"mat4">;
const cameraViewMatrix = _cameraViewMatrix as Node<"mat4">;

export { positionGeometry, cameraProjectionMatrix, cameraViewMatrix };

const uv = _uv as () => Node<"vec2">;

export { uv };

const zIndex = uniform("float", "zIndex");
const normZIndex = zIndex.div(zIndex.add(1));
const zIndexBias = vec4(0, 0, 0, normZIndex.div(1_000_000));

export { zIndexBias };
