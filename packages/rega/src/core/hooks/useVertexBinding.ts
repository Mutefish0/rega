import { useMemo } from "react";
import { createVertexBinding } from "../render/vertex";
import { WGSLValueType } from "pure3";

export default function useVertexBinding(
  type: WGSLValueType,
  vertexCount: number
) {
  const binding = useMemo(() => createVertexBinding(type, vertexCount), []);
  return binding;
}
