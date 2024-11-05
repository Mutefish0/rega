import texture from "./accessors/texture/index";
import modelWorldMatrix from "./accessors/modelWorldMatrix";
import uniform from "./core/uniform";

import type { Node, WGSLValueType } from "./core/types";
export type { Node, WGSLValueType };

import {
  luminance,
  varying,
  uv as _uv,
  positionGeometry as _positionGeometry,
  cameraProjectionMatrix as _cameraProjectionMatrix,
  cameraViewMatrix as _cameraViewMatrix,
} from "three/src/nodes/TSL.js";
const positionGeometry = _positionGeometry as Node<"vec3">;

const cameraProjectionMatrix = _cameraProjectionMatrix as Node<"mat4">;
const cameraViewMatrix = _cameraViewMatrix as Node<"mat4">;

export { positionGeometry, cameraProjectionMatrix, cameraViewMatrix };

export { float, vec2, vec3, vec4 } from "./core/conv";

const uv = _uv as () => Node<"vec2">;

export { uv, varying, luminance };

export {
  Vector2,
  Vector3,
  Vector4,
  Matrix2,
  Matrix3,
  Matrix4,
} from "three/src/Three.WebGPU.Nodes.js";

export {
  texture,
  uniform,
  modelWorldMatrix,
  // math
};
