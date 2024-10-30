import { MaterialJSON, VertexHandle } from "./types";
import createSharedBuffer from "./createSharedBuffer";
import { HEADER_SIZE } from "./sharedBufferLayout";

export default function createVertexHandle(
  materialJSON: MaterialJSON,
  vertexCount: number
): VertexHandle {
  const { attributes } = materialJSON;

  const bufferMap = new Map<string, Float32Array>();

  const buffers: SharedArrayBuffer[] = [];

  for (const attribute of attributes) {
    let arrayStride = 4;
    if (attribute.type === "vec3") {
      arrayStride = 3 * 4;
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
    }
    const buffer = createSharedBuffer(vertexCount * arrayStride);
    buffers.push(buffer);
    bufferMap.set(attribute.name, new Float32Array(buffer, HEADER_SIZE));
  }

  return { buffers, bufferMap };
}
