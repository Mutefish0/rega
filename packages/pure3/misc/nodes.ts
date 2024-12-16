import { Node, WGSLValueType } from "../core/types";

import {
  uv as _uv,
  normalGeometry as _normalGeometry,
  positionGeometry as _positionGeometry,
  cameraProjectionMatrix as _cameraProjectionMatrix,
  cameraViewMatrix as _cameraViewMatrix,
  attribute as _attribute,
} from "three/src/nodes/TSL.js";

import uniform from "../core/uniform";

export const normalGeometry = _normalGeometry as Node<"vec3">;
export const positionGeometry = _positionGeometry as Node<"vec3">;
export const cameraProjectionMatrix = _cameraProjectionMatrix as Node<"mat4">;
export const cameraViewMatrix = _cameraViewMatrix as Node<"mat4">;
export const modelWorldMatrix = uniform("mat4", "modelWorldMatrix");
export const modelWorldMatrixInverse = uniform(
  "mat4",
  "modelWorldMatrixInverse"
);
export const modelViewMatrix = cameraViewMatrix.mul(modelWorldMatrix);

export const uv = _uv as () => Node<"vec2">;

export function attribute<T extends WGSLValueType>(type: T, name: string) {
  return _attribute(name, type) as Node<T>;
}
