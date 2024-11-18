/// <reference types="@webgpu/types" />

import texture, { dataTexture } from "./accessors/texture/index";

import uniform from "./core/uniform";

export { texture, dataTexture, uniform };

export type { Node, WGSLValueType } from "./core/types";

export * from "three/src/nodes/TSL.js";

export {
  float,
  int,
  uint,
  vec2,
  ivec2,
  uvec2,
  vec3,
  ivec3,
  uvec3,
  vec4,
  ivec4,
  uvec4,
} from "./core/conv";

import { Matrix4 } from "three/src/Three.WebGPU.Nodes.js";

export {
  Vector2,
  Vector3,
  Vector4,
  Matrix2,
  Matrix3,
  Matrix4,
  Quaternion,
  Euler,
} from "three/src/Three.WebGPU.Nodes.js";

export const emptyMatrix4 = new Matrix4();

export * from "./math/vector";

export {
  positionGeometry,
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  modelViewMatrix,
  uv,
  attribute,
} from "./misc/nodes";

export * from "./misc/zIndex";
