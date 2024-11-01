const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

console.log("limits: ", device.limits);

export function hasFeature(name: string) {
  return device.features.has(name);
}
