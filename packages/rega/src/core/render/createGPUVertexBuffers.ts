import { MaterialJSON } from "./types";
import { createAttributeBuffer } from "./utils";

export default function createGPUVertexBuffers(
  device: GPUDevice,
  materialJSON: MaterialJSON,
  vertexCount: number
) {
  const { attributes } = materialJSON;
  const buffers: GPUBuffer[] = [];
  for (const attribute of attributes) {
    let arrayStride = 4;
    if (attribute.type === "vec3") {
      arrayStride = 4 * 4;
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
    }
    const buffer = createAttributeBuffer(
      device,
      attribute,
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      arrayStride * vertexCount
    );

    buffers.push(buffer);
  }

  return buffers;
}
