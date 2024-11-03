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
    : // 矩阵规则：矩阵可以左乘标量或同维度矩阵
    A extends "mat2"
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
    : // 标量乘法仅限标量类型本身
    A extends "float"
    ? B extends "float" | "lit_float"
      ? "float"
      : unknown
    : unknown;

export interface BoxNode<T extends WGSLValueType> {
  mul<B extends NodeValueType>(
    node: Node<B>
  ): Mul<T, B> extends NodeValueType ? Node<Mul<T, B>> : unknown;
  nodeType: T;
  uuid: string;
}

export type Node<T extends NodeValueType> = T extends "lit_float"
  ? number
  : T extends WGSLValueType
  ? BoxNode<T>
  : unknown;
