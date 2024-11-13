import { useMemo } from "react";
import { createVertexBinding, VertexUpdater } from "../render/vertex";
import { WGSLValueType } from "pure3";

export default function useVertexBindings<
  T extends Record<string, WGSLValueType>
>(
  obj: T,
  vertexCount: number
): {
  buffers: Record<string, SharedArrayBuffer>;
  updates: {
    [K in keyof T]: VertexUpdater<T[K]>;
  };
} {
  return useMemo(() => {
    const buffers = {} as Record<string, SharedArrayBuffer>;
    const updates = {} as {
      [K in keyof T]: VertexUpdater<T[K]>;
    };
    for (const name in obj) {
      const { update, buffer } = createVertexBinding(obj[name], vertexCount);
      buffers[name] = buffer;
      updates[name] = update;
    }
    return {
      buffers,
      updates,
    };
  }, []);
}
