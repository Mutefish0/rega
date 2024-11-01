import texture from "./accessors/texture/index";
import modelWorldMatrix from "./accessors/modelWorldMatrix";
import uniform from "./core/uniform";

import type { Node } from "./core/types";
export type { Node };

import { positionGeometry as _positionGeometry } from "three/src/nodes/TSL.js";
const positionGeometry = _positionGeometry as Node<"vec3">;
export { positionGeometry };

export { float, vec2, vec3, vec4 } from "./core/conv";

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
