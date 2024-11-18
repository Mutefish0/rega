export default function createGPUBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  resources: Array<{ binding: number; resource: GPUBindingResource }>
) {
  return device.createBindGroup({
    layout: gpuBindGroupLayout,
    entries: resources,
  });
}
