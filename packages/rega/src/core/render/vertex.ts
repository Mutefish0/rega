import { WGSLValueType } from "pure3";
import createSharedBuffer, {
  createUint16Array,
  createFloat32Array,
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

export type VertexUpdater<
  T extends WGSLValueType,
  A = T extends WGSLValueType ? number[] : void
> = (data: A, offset?: number, commit?: boolean) => SharedArrayBuffer;

export function createVertexBinding<T extends WGSLValueType>(
  type: T,
  vertexCount: number
): {
  buffer: SharedArrayBuffer;
  update: VertexUpdater<T>;
} {
  let arrayStride = 4;

  if (type === "vec3") {
    arrayStride = 3 * 4;
  } else if (type === "vec2") {
    arrayStride = 2 * 4;
  } else if (type === "vec4") {
    arrayStride = 4 * 4;
  }

  const buffer = createSharedBuffer(vertexCount * arrayStride);

  const versionView = createVersionView(buffer);
  const dataView = createFloat32Array(buffer);

  function update(data: number[], offset = 0, commit = true) {
    if (data.length > 0) {
      dataView.set(data, offset);
      if (commit) {
        updateVersion(versionView);
      }
    } else {
      updateVersion(versionView);
    }
    return buffer;
  }

  return {
    buffer,
    update,
  };
}

export function createIndexBinding(indexCount: number) {
  let size = indexCount * 2;
  // ensure 4 byte alignment
  size += (4 - (size % 4)) % 4;
  const buf = createSharedBuffer(size);

  const view = createUint16Array(buf);
  const version = createVersionView(buf);

  function update(value: number[], offset = 0) {
    view.set(value, offset);
    updateVersion(version);
    return buf;
  }

  return {
    buffer: buf,
    update,
  };
}

export function createVertexControll(vertexCount = 0) {
  const buf = new SharedArrayBuffer(4);

  const vertexCountView = new Uint32Array(buf);

  function updateVertexCount(count: number) {
    vertexCountView.set([count]);
  }

  updateVertexCount(vertexCount);

  return {
    buffer: buf,
    updateVertexCount,
  };
}
