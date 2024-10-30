import createSharedBuffer from "./createSharedBuffer";
import { HEADER_SIZE } from "./sharedBufferLayout";

export default function createIndexHandle(indexCount: number) {
  let size = indexCount * 2;
  // ensure 4 byte alignment
  size += (4 - (size % 4)) % 4;
  const buf = createSharedBuffer(size);

  return {
    buffer: buf,
    view: new Uint16Array(buf, HEADER_SIZE),
  };
}
