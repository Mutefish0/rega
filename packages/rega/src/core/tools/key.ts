export function keyStringify(
  v?: { x?: number; y?: number; z?: number },
  defaultValue = 0
) {
  return v
    ? `${v.x ?? defaultValue}:${v.y ?? defaultValue}:${v.z ?? defaultValue}`
    : "";
}
