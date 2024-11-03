import { ResourceType } from "./types";

export function createBindGroupLayout(
  device: GPUDevice,
  bindings: Array<{ type: ResourceType; binding: number }>
) {
  const entries: GPUBindGroupLayoutEntry[] = [];

  for (const binding of bindings) {
    const bindingGPU: GPUBindGroupLayoutEntry = {
      binding: binding.binding,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
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

export function createAttributeBuffer(
  device: GPUDevice,
  attribute: { name: string; type: string },
  usage: any,
  byteLength: number
) {
  const size = byteLength + ((4 - (byteLength % 4)) % 4); // ensure 4 byte alignment, see #20441

  const buffer = device.createBuffer({
    label: attribute.name,
    size: size,
    usage: usage,
  });

  return buffer;
}
