/// <reference types="@webgpu/types" />

import texture, { dataTexture } from "./accessors/texture/index";

import type { NodeTexture } from "./accessors/texture/index";

import uniform from "./core/uniform";

export { texture, dataTexture, uniform };
export type { NodeTexture };

import type { Node, WGSLValueType } from "./core/types";
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

export {
  max,
  min,
  sub,
  add,
  mul,
  div,
  normalize,
  dot,
  cross,
  sqrt,
  inverseSqrt,
  dpdxFine,
  dpdyFine,
} from "./math/vector";
export type { Vector3Like, Vector2Like, Vector4Like } from "./math/vector";

export { PI, PI2 } from "./math/const";

export {
  positionGeometry,
  cameraProjectionMatrix,
  cameraViewMatrix,
  modelWorldMatrix,
  modelWorldMatrixInverse,
  modelViewMatrix,
  uv,
  legacyUv,
  attribute,
} from "./misc/nodes";

import { Fn as _Fn } from "three/src/Three.WebGPU.Nodes.js";

export const Fn = _Fn as <T extends any, Args extends any[]>(
  fn: (...args: Args) => T
) => (...args: Args) => T;

export * from "./misc/zIndex";
