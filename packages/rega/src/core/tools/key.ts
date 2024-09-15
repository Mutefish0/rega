export function keyStringify(v?: { x?: number; y?: number; z?: number }) {
  return v ? `${v.x ?? 0}:${v.y ?? 0}:${v.z ?? 0}` : "";
}
