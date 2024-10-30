import { UUID_BYTES, VERSION_BYTES } from "./sharedBufferLayout";

export default function createSharedBuffer(size: number) {
  const id = crypto.randomUUID();

  const sab = new SharedArrayBuffer(UUID_BYTES + VERSION_BYTES + size);
  const u8View = new Uint8Array(sab);
  for (let i = 0; i < UUID_BYTES; i++) {
    u8View[i] = id.charCodeAt(i);
  }

  return sab;
}
