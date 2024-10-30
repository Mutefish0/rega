import createSharedBuffer, {
  createUint16Array,
  createVersionView,
  updateVersion,
} from "./createSharedBuffer";

export default function createIndexHandle(indexCount: number) {
  let size = indexCount * 2;
  // ensure 4 byte alignment
  size += (4 - (size % 4)) % 4;
  const buf = createSharedBuffer(size);

  const view = createUint16Array(buf);
  const version = createVersionView(buf);

  function update(value: number[]) {
    view.set(value);
    updateVersion(version);
  }

  return {
    buffer: buf,
    update,
  };
}
