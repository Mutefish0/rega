import { MaterialJSON, VertexHandle } from "./types";
import createSharedBuffer, {
  createFloat32Array,
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

export default function createVertexHandle(
  materialJSON: MaterialJSON,
  vertexCount: number
): VertexHandle {
  const { attributes } = materialJSON;

  const bufferMap = new Map<
    string,
    { buffer: Float32Array; version: DataView }
  >();

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
    bufferMap.set(attribute.name, {
      buffer: createFloat32Array(buffer),
      version: createVersionView(buffer),
    });
  }

  function update(name: string, value: number[]) {
    const buf = bufferMap.get(name);
    if (buf) {
      buf.buffer.set(value);
      updateVersion(buf.version);
    }
  }

  return { buffers, update };
}
