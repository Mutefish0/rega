import { BindGroupInfo, MaterialJSON } from "./types";

export function createBindingsLayout(
  device: GPUDevice,
  bindGroup: BindGroupInfo
) {
  const entries: GPUBindGroupLayoutEntry[] = [];

  let index = 0;

  for (const binding of bindGroup.bindings) {
    const bindingGPU: GPUBindGroupLayoutEntry = {
      binding: index++,
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
