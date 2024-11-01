import { uniform as u } from "three/src/nodes/TSL.js";
import {
  Vector2,
  Vector3,
  Vector4,
  Matrix2,
  Matrix3,
  Matrix4,
} from "three/src/Three.WebGPU.Nodes.js";

import type { Node } from "./types";

import { NodeValueType } from "./types";

export const UNIFORM_INIT_VALUES: Record<NodeValueType, any> = {
  float: 1,
  vec2: new Vector2(0, 0),
  vec3: new Vector3(0, 0, 0),
  vec4: new Vector4(0, 0, 0, 0),
  mat2: new Matrix2(),
  mat3: new Matrix3(),
  mat4: new Matrix4(),
};

function uniform<T extends NodeValueType>(type: T, label?: string) {
  const node = u(UNIFORM_INIT_VALUES[type], type);
  if (label) {
    node.label(label);
  }
  return node as Node<T>;
}

export default uniform;
