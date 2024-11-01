import { Node } from "../core/types";
import { modelWorldMatrix as _modelWorldMatrix } from "three/src/nodes/TSL.js";

const modelWorldMatrix = _modelWorldMatrix.label(
  "modelWorldMatrix"
) as Node<"mat4">;

export default modelWorldMatrix;
