import { Node, WGSLValueType } from "./types";

import {
  bool as _bool,
  int as _int,
  uint as _uint,
  float as _float,
  vec2 as _vec2,
  ivec2 as _ivec2,
  uvec2 as _uvec2,
  vec3 as _vec3,
  ivec3 as _ivec3,
  uvec3 as _uvec3,
  vec4 as _vec4,
  ivec4 as _ivec4,
  uvec4 as _uvec4,
} from "three/src/nodes/TSL.js";

export const bool = _bool as Conv<"bool">;
export const float = _float as Conv<"float">;
export const int = _int as Conv<"int">;
export const uint = _uint as Conv<"uint">;
export const vec2 = _vec2 as Conv<"vec2">;
export const ivec2 = _ivec2 as Conv<"ivec2">;
export const uvec2 = _uvec2 as Conv<"uvec2">;
export const vec3 = _vec3 as Conv<"vec3">;
export const ivec3 = _ivec3 as Conv<"ivec3">;
export const uvec3 = _uvec3 as Conv<"uvec3">;
export const vec4 = _vec4 as Conv<"vec4">;
export const ivec4 = _ivec4 as Conv<"ivec4">;
export const uvec4 = _uvec4 as Conv<"uvec4">;

type TS = {
  bool: ["literal"] | ["bool"];
  vec2:
    | ["literal", "literal"]
    | ["literal", "float"]
    | ["float", "literal"]
    | ["float", "float"]
    | ["vec2"];
  ivec2:
    | ["literal", "literal"]
    | ["literal", "int"]
    | ["int", "literal"]
    | ["int", "int"]
    | ["ivec2"];
  uvec2:
    | ["literal", "literal"]
    | ["literal", "uint"]
    | ["uint", "literal"]
    | ["uint", "uint"]
    | ["uvec2"];
  vec3:
    | ["literal", "literal", "literal"]
    | ["float", "literal", "literal"]
    | ["literal", "literal", "float"]
    | ["literal", "float", "float"]
    | ["float", "literal", "float"]
    | ["float", "float", "literal"]
    | ["float", "float", "float"]
    | ["vec2", "float"]
    | ["float", "vec2"]
    | ["vec2", "literal"]
    | ["literal", "vec2"]
    | ["vec3"];
  ivec3:
    | ["literal", "literal", "literal"]
    | ["int", "literal", "literal"]
    | ["literal", "literal", "int"]
    | ["literal", "int", "int"]
    | ["int", "literal", "int"]
    | ["int", "int", "literal"]
    | ["int", "int", "int"]
    | ["ivec2", "int"]
    | ["int", "ivec2"]
    | ["ivec2", "literal"]
    | ["literal", "ivec2"]
    | ["ivec3"];
  uvec3:
    | ["literal", "literal", "literal"]
    | ["uint", "literal", "literal"]
    | ["literal", "literal", "uint"]
    | ["literal", "uint", "uint"]
    | ["uint", "literal", "uint"]
    | ["uint", "uint", "literal"]
    | ["uint", "uint", "uint"]
    | ["uvec2", "uint"]
    | ["uint", "uvec2"]
    | ["uvec2", "literal"]
    | ["literal", "uvec2"]
    | ["uvec3"];
  vec4:
    | ["literal", "literal", "literal", "literal"]
    | ["float", "literal", "literal", "literal"]
    | ["literal", "literal", "float", "literal"]
    | ["literal", "literal", "literal", "float"]
    | ["literal", "float", "float", "literal"]
    | ["float", "literal", "float", "literal"]
    | ["float", "float", "literal", "literal"]
    | ["float", "float", "float", "literal"]
    | ["vec2", "float", "float"]
    | ["float", "vec2", "float"]
    | ["vec2", "literal", "literal"]
    | ["literal", "vec2", "literal"]
    | ["vec3", "float"]
    | ["vec3", "literal"]
    | ["float", "vec3"]
    | ["literal", "vec3"]
    | ["vec4"];
  uvec4:
    | ["literal", "literal", "literal", "literal"]
    | ["uint", "literal", "literal", "literal"]
    | ["literal", "literal", "uint", "literal"]
    | ["literal", "literal", "literal", "uint"]
    | ["literal", "uint", "uint", "literal"]
    | ["uint", "literal", "uint", "literal"]
    | ["uint", "uint", "literal", "literal"]
    | ["uint", "uint", "uint", "literal"]
    | ["uvec2", "uint", "uint"]
    | ["uvec2", "literal", "literal"]
    | ["uvec2", "uvec2"]
    | ["uint", "uvec2", "uint"]
    | ["literal", "uvec2", "literal"]
    | ["uvec2", "literal", "literal"]
    | ["literal", "uvec2", "literal"]
    | ["uvec3", "uint"]
    | ["uvec3", "literal"]
    | ["uint", "uvec3"]
    | ["literal", "uvec3"]
    | ["uvec4"];
  ivec4:
    | ["literal", "literal", "literal", "literal"]
    | ["int", "literal", "literal", "literal"]
    | ["literal", "literal", "int", "literal"]
    | ["literal", "literal", "literal", "int"]
    | ["literal", "int", "int", "literal"]
    | ["int", "literal", "int", "literal"]
    | ["int", "int", "literal", "literal"]
    | ["int", "int", "int", "literal"]
    | ["ivec2", "int", "int"]
    | ["ivec2", "literal", "literal"]
    | ["ivec2", "ivec2"]
    | ["int", "ivec2", "int"]
    | ["literal", "ivec2", "literal"]
    | ["ivec2", "literal", "literal"]
    | ["literal", "ivec2", "literal"]
    | ["ivec3", "int"]
    | ["ivec3", "literal"]
    | ["int", "ivec3"]
    | ["literal", "ivec3"]
    | ["ivec4"];
  float: ["float"] | ["literal"] | ["int"] | ["uint"];
  int: ["literal"] | ["int"];
  uint: ["literal"] | ["uint"];
};

export type Conv<T extends keyof TS, A extends TS[T] = TS[T]> = (
  ...args: {
    [I in keyof A]: A[I] extends "literal"
      ? number
      : A[I] extends WGSLValueType
      ? Node<A[I]>
      : void;
  }
) => T extends WGSLValueType ? Node<T> : void;
