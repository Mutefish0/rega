import {
  float as _float,
  vec2 as _vec2,
  vec3 as _vec3,
  vec4 as _vec4,
  ivec2,
  ivec3,
  ivec4,
  uvec2,
  uvec3,
  uvec4,
} from "three/src/nodes/TSL.js";

import { Node } from "./types";

type FloatLitOrNode = Node<"float" | "lit_float">;

type FloatCon = (a: FloatLitOrNode) => Node<"float">;

export const float = _float as FloatCon;

export function vec2(a: FloatLitOrNode, b: FloatLitOrNode): Node<"vec2">;
export function vec2(a: Node<"vec2">): Node<"vec2">;
export function vec2(...args: any[]) {
  return _vec2(...args);
}

export function vec3(
  a: FloatLitOrNode,
  b: FloatLitOrNode,
  c: FloatLitOrNode
): Node<"vec3">;
export function vec3(a: Node<"vec2">, c: FloatLitOrNode): Node<"vec3">;
export function vec3(a: FloatLitOrNode, b: Node<"vec2">): Node<"vec3">;
export function vec3(a: Node<"vec3">): Node<"vec3">;
export function vec3(...args: any[]): Node<"vec3"> {
  return _vec3(...args);
}

export function vec4(
  a: FloatLitOrNode,
  b: FloatLitOrNode,
  c: FloatLitOrNode,
  d: FloatLitOrNode
): Node<"vec4">;
export function vec4(a: Node<"vec2">, b: Node<"vec2">): Node<"vec4">;
export function vec4(
  a: Node<"vec2">,
  b: FloatLitOrNode,
  c: FloatLitOrNode
): Node<"vec4">;
export function vec4(
  a: FloatLitOrNode,
  b: FloatLitOrNode,
  c: Node<"vec2">
): Node<"vec4">;
export function vec4(
  a: FloatLitOrNode,
  b: Node<"vec2">,
  c: FloatLitOrNode
): Node<"vec4">;
export function vec4(a: Node<"vec3">, d: FloatLitOrNode): Node<"vec4">;
export function vec4(a: FloatLitOrNode, b: Node<"vec3">): Node<"vec4">;
export function vec4(a: Node<"vec4">): Node<"vec4">;
export function vec4(...args: any[]): Node<"vec4"> {
  return _vec4(...args);
}

export { ivec2, ivec3, ivec4, uvec2, uvec3, uvec4 };
