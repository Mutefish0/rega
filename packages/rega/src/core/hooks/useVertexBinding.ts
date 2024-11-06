import { createVertexBinding } from "../render/vertex";
import { WGSLValueType } from "pure3";

export default function useVertexBinding(
  type: WGSLValueType,
  vertexCount: number
) {
  return createVertexBinding(type, vertexCount);
}
