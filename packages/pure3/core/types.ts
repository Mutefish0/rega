export type NodeValueType =
  | "float"
  | "vec2"
  | "vec3"
  | "vec4"
  | "mat2"
  | "mat3"
  | "mat4";

type Mul<A, B> = A;

export interface Node<T extends NodeValueType> {
  mul<T extends Node<any>>(node: T): Mul<this, T>;
  nodeType: T;
}
