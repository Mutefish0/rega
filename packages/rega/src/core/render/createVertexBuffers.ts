import { MaterialJSON } from "./types";

export default function createVertexBuffers(
  materialJSON: MaterialJSON,
  vertexCount: number
) {
  const { attributes } = materialJSON;

  const buffers: SharedArrayBuffer[] = [];

  for (const attribute of attributes) {
    let arrayStride = 4;
    if (attribute.type === "vec3") {
      arrayStride = 4 * 4;
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
    }

    buffers.push(new SharedArrayBuffer(vertexCount * arrayStride));
  }

  return buffers;
}
