export default function createIndexBuffer(indexCount: number) {
  let size = indexCount * 2;
  // ensure 4 byte alignment
  size += (4 - (size % 4)) % 4;
  return new SharedArrayBuffer(size);
}
