import { WGSLValueType } from "./types";

type PS = {
  x:
    | ["vec2", "float"]
    | ["ivec2", "int"]
    | ["uvec2", "uint"]
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  y:
    | ["vec2", "float"]
    | ["ivec2", "int"]
    | ["uvec2", "uint"]
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  z:
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  w: ["vec4", "float"] | ["ivec4", "int"] | ["uvec4", "uint"];

  xy:
    | ["vec2", "vec2"]
    | ["ivec2", "ivec2"]
    | ["uvec2", "uvec2"]
    | ["vec3", "vec2"]
    | ["ivec3", "ivec2"]
    | ["uvec3", "uvec2"]
    | ["vec4", "vec2"]
    | ["ivec4", "ivec2"]
    | ["uvec4", "uvec2"];

  yz:
    | ["vec3", "vec2"]
    | ["ivec3", "ivec2"]
    | ["uvec3", "uvec2"]
    | ["vec4", "vec2"]
    | ["ivec4", "ivec2"]
    | ["uvec4", "uvec2"];

  xyz:
    | ["vec3", "vec3"]
    | ["ivec3", "ivec3"]
    | ["uvec3", "uvec3"]
    | ["vec4", "vec3"]
    | ["ivec4", "ivec3"]
    | ["uvec4", "uvec3"];

  r:
    | ["vec2", "float"]
    | ["ivec2", "int"]
    | ["uvec2", "uint"]
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  g:
    | ["vec2", "float"]
    | ["ivec2", "int"]
    | ["uvec2", "uint"]
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  b:
    | ["vec3", "float"]
    | ["ivec3", "int"]
    | ["uvec3", "uint"]
    | ["vec4", "float"]
    | ["ivec4", "int"]
    | ["uvec4", "uint"];
  a: ["vec4", "float"] | ["ivec4", "int"] | ["uvec4", "uint"];

  rg:
    | ["vec2", "vec2"]
    | ["ivec2", "ivec2"]
    | ["uvec2", "uvec2"]
    | ["vec3", "vec2"]
    | ["ivec3", "ivec2"]
    | ["uvec3", "uvec2"]
    | ["vec4", "vec2"]
    | ["ivec4", "ivec2"]
    | ["uvec4", "uvec2"];

  gb:
    | ["vec3", "vec2"]
    | ["ivec3", "ivec2"]
    | ["uvec3", "uvec2"]
    | ["vec4", "vec2"]
    | ["ivec4", "ivec2"]
    | ["uvec4", "uvec2"];

  rgb:
    | ["vec3", "vec3"]
    | ["ivec3", "ivec3"]
    | ["uvec3", "uvec3"]
    | ["vec4", "vec3"]
    | ["ivec4", "ivec3"]
    | ["uvec4", "uvec3"];
};

type PropsHelper<
  T extends WGSLValueType,
  P extends keyof PS,
  R = PS[P]
> = R extends [T, infer U] ? U : void;

export type Props<T extends WGSLValueType> = {
  [K in keyof PS]: PropsHelper<T, K>;
};
