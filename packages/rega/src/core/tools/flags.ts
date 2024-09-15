export function collisionFilter(
  collisionGroup?: number,
  collisionMask?: number
) {
  let left = collisionGroup ?? 1;
  let right = collisionMask ?? 1;
  return (left << 16) | right;
}
