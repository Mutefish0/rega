import { NamedBindingLayout } from "./types";

export default function createBindGroupLayout(
  device: GPUDevice,
  bindings: NamedBindingLayout[]
) {
  const entries: GPUBindGroupLayoutEntry[] = [];

  for (const binding of bindings) {
    const bindingGPU: GPUBindGroupLayoutEntry = {
      binding: binding.binding,
      visibility: binding.visibility,
    };
    if (binding.type === "uniformBuffer") {
      const buffer: GPUBufferBindingLayout = {}; // GPUBufferBindingLayout
      bindingGPU.buffer = buffer;
    } else if (binding.type === "sampler") {
      bindingGPU.sampler = {};
    } else if (binding.type === "sampledTexture") {
      bindingGPU.texture = {};
    } else {
      throw new Error("CreateBindingsLayout: not supported uniform type");
    }

    entries.push(bindingGPU);
  }

  return device.createBindGroupLayout({ entries });
}
