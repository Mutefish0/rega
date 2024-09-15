// unpack f64 -> u32,u32
export function f64unpack(value: number) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, value);
  const high = view.getUint32(0);
  const low = view.getUint32(4);
  return [high, low];
}

// unpack f64 -> f32,f32
export function f64unpackf(value: number) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setFloat64(0, value);
  const high = view.getFloat32(0);
  const low = view.getFloat32(4);
  return [high, low];
}
