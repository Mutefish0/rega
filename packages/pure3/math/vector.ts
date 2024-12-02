import {
  max as _max,
  min as _min,
  add as _add,
  sub as _sub,
  mul as _mul,
} from "three/src/nodes/TSL.js";

import { WGSLValueType, Node } from "../core/types";

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
