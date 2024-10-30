const adapter = await navigator.gpu.requestAdapter();
const device = await adapter!.requestDevice();

export function hasFeature(name: string) {
  return device.features.has(name);
}
