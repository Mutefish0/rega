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

import { NodeValueType, WGSLValueType } from "./types";

export const UNIFORM_INIT_VALUES: Record<NodeValueType, any> = {
  literal: 0,
  float: 0,
  int: 0,
  uint: 0,
  vec2: new Vector2(0, 0),
  ivec2: new Vector2(0, 0),
  uvec2: new Vector2(0, 0),
  vec3: new Vector3(0, 0, 0),
  ivec3: new Vector3(0, 0, 0),
  uvec3: new Vector3(0, 0, 0),
  vec4: new Vector4(0, 0, 0, 0),
  ivec4: new Vector4(0, 0, 0, 0),
  uvec4: new Vector4(0, 0, 0, 0),
  mat2: new Matrix2(),
  mat3: new Matrix3(),
  mat4: new Matrix4(),
};

function uniform<T extends WGSLValueType>(type: T, label?: string) {
  const node = u(UNIFORM_INIT_VALUES[type], type);
  if (label) {
    node.label(label);
  }
  return node as Node<T>;
}

export default uniform;
