import { WGSLValueType, NodeValueType } from "./types";

type MatchMul =
  | ["vec2", "float", "vec2"]
  | ["vec2", "vec2", "vec2"]
  | ["vec2", "literal", "vec2"]
  | ["ivec2", "int", "ivec2"]
  | ["ivec2", "literal", "ivec2"]
  | ["ivec2", "ivec2", "ivec2"]
  | ["uvec2", "uint", "uvec2"]
  | ["uvec2", "literal", "uvec2"]
  | ["uvec2", "uvec2", "uvec2"]
  | ["vec3", "float", "vec3"]
  | ["vec3", "vec3", "vec3"]
  | ["vec3", "literal", "vec3"]
  | ["ivec3", "int", "ivec3"]
  | ["ivec3", "literal", "ivec3"]
  | ["ivec3", "ivec3", "ivec3"]
  | ["uvec3", "uint", "uvec3"]
  | ["uvec3", "literal", "uvec3"]
  | ["uvec3", "uvec3", "uvec3"]
  | ["vec4", "float", "vec4"]
  | ["vec4", "vec4", "vec4"]
  | ["vec4", "literal", "vec4"]
  | ["ivec4", "int", "ivec4"]
  | ["ivec4", "literal", "ivec4"]
  | ["ivec4", "ivec4", "ivec4"]
  | ["uvec4", "uint", "uvec4"]
  | ["uvec4", "literal", "uvec4"]
  | ["uvec4", "uvec4", "uvec4"]
  | ["mat2", "float", "mat2"]
  | ["mat2", "literal", "mat2"]
  | ["mat2", "vec2", "vec2"]
  | ["mat2", "mat2", "mat2"]
  | ["mat3", "float", "mat3"]
  | ["mat3", "literal", "mat3"]
  | ["mat3", "vec3", "vec3"]
  | ["mat3", "mat3", "mat3"]
  | ["mat4", "float", "mat4"]
  | ["mat4", "literal", "mat4"]
  | ["mat4", "vec4", "vec4"]
  | ["mat4", "mat4", "mat4"]
  | ["float", "float", "float"]
  | ["float", "literal", "float"]
  | ["int", "int", "int"]
  | ["int", "literal", "int"]
  | ["uint", "uint", "uint"]
  | ["uint", "literal", "uint"];

export type Mul<
  A extends WGSLValueType,
  B extends NodeValueType,
  R extends [WGSLValueType, NodeValueType, WGSLValueType] = MatchMul
> = R extends [A, B, infer C] ? C : never;

type MatchAdd =
  | ["vec2", "vec2", "vec2"]
  | ["vec2", "float", "vec2"]
  | ["vec2", "literal", "vec2"]
  | ["ivec2", "ivec2", "ivec2"]
  | ["ivec2", "int", "ivec2"]
  | ["ivec2", "literal", "ivec2"]
  | ["uvec2", "uvec2", "uvec2"]
  | ["uvec2", "uint", "uvec2"]
  | ["uvec2", "literal", "uvec2"]
  | ["vec3", "vec3", "vec3"]
  | ["vec3", "float", "vec3"]
  | ["vec3", "literal", "vec3"]
  | ["ivec3", "ivec3", "ivec3"]
  | ["ivec3", "int", "ivec3"]
  | ["ivec3", "literal", "ivec3"]
  | ["uvec3", "uvec3", "uvec3"]
  | ["uvec3", "uint", "uvec3"]
  | ["uvec3", "literal", "uvec3"]
  | ["vec4", "vec4", "vec4"]
  | ["vec4", "float", "vec4"]
  | ["vec4", "literal", "vec4"]
  | ["ivec4", "ivec4", "ivec4"]
  | ["ivec4", "int", "ivec4"]
  | ["ivec4", "literal", "ivec4"]
  | ["uvec4", "uvec4", "uvec4"]
  | ["uvec4", "uint", "uvec4"]
  | ["uvec4", "literal", "uvec4"]
  | ["float", "float", "float"]
  | ["float", "literal", "float"]
  | ["int", "int", "int"]
  | ["int", "literal", "int"]
  | ["uint", "uint", "uint"]
  | ["uint", "literal", "uint"];

export type Add<
  A extends WGSLValueType,
  B extends NodeValueType,
  R extends [WGSLValueType, NodeValueType, WGSLValueType] = MatchAdd
> = R extends [A, B, infer C] ? C : never;

type MatchDiv =
  | ["vec2", "float", "vec2"]
  | ["vec2", "literal", "vec2"]
  | ["ivec2", "int", "ivec2"]
  | ["ivec2", "literal", "ivec2"]
  | ["uvec2", "uint", "uvec2"]
  | ["uvec2", "literal", "uvec2"]
  | ["vec3", "float", "vec3"]
  | ["vec3", "literal", "vec3"]
  | ["ivec3", "int", "ivec3"]
  | ["ivec3", "literal", "ivec3"]
  | ["vec4", "float", "vec4"]
  | ["vec4", "literal", "vec4"]
  | ["ivec4", "int", "ivec4"]
  | ["ivec4", "literal", "ivec4"]
  | ["uvec4", "uint", "uvec4"]
  | ["uvec4", "literal", "uvec4"]
  | ["float", "float", "float"]
  | ["float", "literal", "float"];

export type Div<
  A extends WGSLValueType,
  B extends NodeValueType,
  R extends [WGSLValueType, NodeValueType, WGSLValueType] = MatchDiv
> = R extends [A, B, infer C] ? C : never;
