export const UUID_BYTES = 36;
export const VERSION_BYTES = 32;
export const HEADER_SIZE = UUID_BYTES + VERSION_BYTES;

export function getUUID(sab: SharedArrayBuffer): string {
  const u8View = new Uint8Array(sab);
  let id = "";
  for (let i = 0; i < UUID_BYTES; i++) {
    id += String.fromCharCode(u8View[i]);
  }
  return id;
}
