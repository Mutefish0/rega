import { BindGroupInfo } from "./types";

export default function createGPUBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  bindGroup: BindGroupInfo,
  resources: GPUBindingResource[]
) {
  const entriesGPU = resources.map((resource, index) => ({
    binding: index,
    resource,
  }));

  return device.createBindGroup({
    label: "bindGroup_" + bindGroup.name,
    layout: gpuBindGroupLayout,
    entries: entriesGPU,
  });
}
