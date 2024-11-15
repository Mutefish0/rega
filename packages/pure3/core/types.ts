export type WGSLValueType =
  | "float"
  | "int"
  | "uint"
  | "vec2"
  | "vec3"
  | "vec4"
  | "ivec2"
  | "ivec3"
  | "ivec4"
  | "uvec2"
  | "uvec3"
  | "uvec4"
  | "mat2"
  | "mat3"
  | "mat4";

export type NodeValueType = "literal" | WGSLValueType;

import { Mul, Add, Div } from "./ops";
import { Props } from "./props";

type RemoveVoid<T> = {
  [K in keyof T as T[K] extends void ? never : K]: T[K];
};

export type Node<A extends WGSLValueType> = RemoveVoid<{
  mul<B extends WGSLValueType>(
    node: Node<B>
  ): Mul<A, B> extends WGSLValueType ? Node<Mul<A, B>> : void;
  mul(node: number): Node<Mul<A, "literal">>;

  add<B extends WGSLValueType>(
    node: Node<B>
  ): Add<A, B> extends WGSLValueType ? Node<Add<A, B>> : void;
  add(node: number): Node<Add<A, "literal">>;

  sub<B extends WGSLValueType>(
    node: Node<B>
  ): Add<A, B> extends WGSLValueType ? Node<Add<A, B>> : void;
  sub(node: number): Node<Add<A, "literal">>;

  div<B extends WGSLValueType>(
    node: Node<B>
  ): Div<A, B> extends WGSLValueType ? Node<Div<A, B>> : void;
  div(node: number): Node<Div<A, "literal">>;

  toVar(): Node<A>;

  assign(...params: any[]): Node<A>;

  nodeType: A;
  uuid: string;
}> &
  Props<A>;

// export type Node<T extends WGSLValueType> = RemoveVoid<_BoxNode<T>>;
