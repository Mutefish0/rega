import { uniform as u } from "three/src/nodes/TSL.js";
import { Vector2, Vector3, Vector4 } from "three/src/Three.WebGPU.Nodes.js";

type UniformNodeType = "float" | "vec2" | "vec3" | "vec4";

const initValues: Record<UniformNodeType, any> = {
  float: 1,
  vec2: new Vector2(0, 0),
  vec3: new Vector3(0, 0, 0),
  vec4: new Vector4(0, 0, 0, 0),
};

function uniform(type: UniformNodeType) {
  return u(initValues[type], type);
}

export default uniform;
