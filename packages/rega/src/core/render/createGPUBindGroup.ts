export default function createGPUBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  resources: GPUBindingResource[]
) {
  const entriesGPU = resources.map((resource, index) => ({
    binding: index,
    resource,
  }));

  return device.createBindGroup({
    layout: gpuBindGroupLayout,
    entries: entriesGPU,
  });
}
