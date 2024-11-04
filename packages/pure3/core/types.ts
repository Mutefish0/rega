export type WGSLValueType =
  | "float"
  | "vec2"
  | "vec3"
  | "vec4"
  | "mat2"
  | "mat3"
  | "mat4";

export type NodeValueType = "lit_float" | WGSLValueType;

type Mul<A extends WGSLValueType, B extends NodeValueType> =
  // 矢量和矩阵只能左乘标量，反之无效
  A extends "vec2"
    ? B extends "float" | "lit_float"
      ? "vec2"
      : B extends "vec2"
      ? "vec2"
      : unknown
    : A extends "vec3"
    ? B extends "float" | "lit_float"
      ? "vec3"
      : B extends "vec3"
      ? "vec3"
      : unknown
    : A extends "vec4"
    ? B extends "float" | "lit_float"
      ? "vec4"
      : B extends "vec4"
      ? "vec4"
      : unknown
    : A extends "mat2"
    ? B extends "float" | "lit_float"
      ? "mat2"
      : B extends "vec2"
      ? "vec2"
      : B extends "mat2"
      ? "mat2"
      : unknown
    : A extends "mat3"
    ? B extends "float" | "lit_float"
      ? "mat3"
      : B extends "vec3"
      ? "vec3"
      : B extends "mat3"
      ? "mat3"
      : unknown
    : A extends "mat4"
    ? B extends "float" | "lit_float"
      ? "mat4"
      : B extends "vec4"
      ? "vec4"
      : B extends "mat4"
      ? "mat4"
      : unknown
    : A extends "float"
    ? B extends "float" | "lit_float"
      ? "float"
      : unknown
    : unknown;

type RemoveVoid<T> = {
  [K in keyof T as T[K] extends void ? never : K]: T[K];
};

export interface _BoxNode<T extends WGSLValueType> {
  mul<
    N extends Node<NodeValueType> | number,
    P = N extends Node<infer U> ? Mul<T, U> : void
  >(
    node: N
  ): N extends number
    ? Node<Mul<T, "lit_float">>
    : P extends NodeValueType
    ? Node<P>
    : void;

  nodeType: T;
  uuid: string;

  x: T extends "vec2" | "vec3" | "vec4" ? Node<"float"> : void;
  y: T extends "vec2" | "vec3" | "vec4" ? Node<"float"> : void;
  z: T extends "vec3" | "vec4" ? Node<"float"> : void;
  w: T extends "vec4" ? Node<"float"> : void;

  xy: T extends "vec3" | "vec4" ? Node<"vec2"> : void;
  xyz: T extends "vec4" ? Node<"vec3"> : void;
}

export type BoxNode<T extends WGSLValueType> = RemoveVoid<_BoxNode<T>>;

export type Node<T extends NodeValueType> = T extends "lit_float"
  ? number
  : T extends WGSLValueType
  ? BoxNode<T>
  : unknown;
