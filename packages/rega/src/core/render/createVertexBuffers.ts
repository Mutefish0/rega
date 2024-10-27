import { MaterialJSON } from "./types";

export default function createVertexBuffers(
  materialJSON: MaterialJSON,
  vertexCount: number
) {
  const { attributes } = materialJSON;

  const bufferMap = new Map<string, SharedArrayBuffer>();

  const buffers: SharedArrayBuffer[] = [];

  for (const attribute of attributes) {
    let arrayStride = 4;
    if (attribute.type === "vec3") {
      arrayStride = 3 * 4;
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
    }
    const buffer = new SharedArrayBuffer(vertexCount * arrayStride);
    buffers.push(buffer);
    bufferMap.set(attribute.name, buffer);
  }

  return { buffers, bufferMap };
}
