import { UUID_BYTES, VERSION_BYTES, HEADER_SIZE } from "./sharedBufferLayout";

export { HEADER_SIZE };

export default function createSharedBuffer(size: number) {
  const id = crypto.randomUUID();

  const sab = new SharedArrayBuffer(UUID_BYTES + VERSION_BYTES + size);
  const u8View = new Uint8Array(sab);
  for (let i = 0; i < UUID_BYTES; i++) {
    u8View[i] = id.charCodeAt(i);
  }

  return sab;
}

export function createFloat32Array(sab: SharedArrayBuffer, offset = 0) {
  return new Float32Array(sab, HEADER_SIZE + offset);
}
export function createUint16Array(sab: SharedArrayBuffer) {
  return new Uint16Array(sab, HEADER_SIZE);
}

export function createUint8Array(sab: SharedArrayBuffer) {
  return new Uint8Array(sab, HEADER_SIZE);
}

export function createVersionView(sab: SharedArrayBuffer) {
  const view = new DataView(sab, UUID_BYTES, VERSION_BYTES);
  return view;
}

export function getVersion(view: DataView) {
  return view.getUint32(0);
}

const MAX_VERSION = 0xffffffff;
export function updateVersion(view: DataView) {
  const version = view.getUint32(0);
  view.setUint32(0, version >= MAX_VERSION ? 0 : version + 1);
}
