import {
  max as _max,
  min as _min,
  add as _add,
  sub as _sub,
  mul as _mul,
  div as _div,
  normalize as _normalize,
  dot as _dot,
  cross as _cross,
  PI as _PI,
  PI2 as _PI2,
  dpdxFine as _dpdxFine,
  dpdyFine as _dpdyFine,
  sqrt as _sqrt,
  inverseSqrt as _inverseSqrt,
} from "three/src/nodes/TSL.js";

import { WGSLValueType, Node } from "../core/types";

export const PI = _PI as Node<"float">;
export const PI2 = _PI2 as Node<"float">;

export const dot = _dot as <T extends "vec2" | "vec3" | "vec4">(
  a: Node<T> | number,
  b: Node<T> | number
) => Node<"float">;

export const cross = _cross as <T extends "vec2" | "vec3" | "vec4">(
  a: Node<T>,
  b: Node<T>
) => Node<T>;

export const sqrt = _sqrt as (a: Node<"float">) => Node<"float">;

export const inverseSqrt = _inverseSqrt as (a: Node<"float">) => Node<"float">;

export const dpdxFine = _dpdxFine as <T extends WGSLValueType>(
  a: Node<T>
) => Node<T>;

export const dpdyFine = _dpdyFine as <T extends WGSLValueType>(
  a: Node<T>
) => Node<T>;

export const normalize = _normalize as <T extends "vec2" | "vec3" | "vec4">(
  a: Node<T> | number
) => Node<T>;

export const max = _max as <T extends WGSLValueType>(
  a: Node<T> | number,
  b: Node<T> | number
) => Node<T>;

export const min = _min as <T extends WGSLValueType>(
  a: Node<T> | number,
  b: Node<T> | number
) => Node<T>;

export const add = _add as <T extends WGSLValueType>(
  ...values: (Node<T> | number)[]
) => Node<T>;

export const sub = _sub as <T extends WGSLValueType>(
  ...values: (Node<T> | number)[]
) => Node<T>;

export const mul = _mul as <T extends WGSLValueType>(
  ...values: (Node<T> | number)[]
) => Node<T>;

export const div = _div as <T extends WGSLValueType>(
  ...values: (Node<T> | number)[]
) => Node<T>;

export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface Vector2Like {
  x: number;
  y: number;
}

export interface Vector4Like {
  x: number;
  y: number;
  z: number;
  w: number;
}
