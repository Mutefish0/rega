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

    if (binding.isUniformBuffer || binding.isStorageBuffer) {
      const buffer: GPUBufferBindingLayout = {}; // GPUBufferBindingLayout

      if (binding.isStorageBuffer) {
        buffer.type = binding.access;
      }

      bindingGPU.buffer = buffer;
    }
    //  else if (binding.isSampler) {
    //   const sampler: GPUSamplerBindingLayout = {}; // GPUSamplerBindingLayout

    //   if (binding.texture.isDepthTexture) {
    //     if (binding.texture.compareFunction !== null) {
    //       sampler.type = "comparison";
    //     }
    //   }

    //   bindingGPU.sampler = sampler;
    // } else if (binding.isSampledTexture && binding.texture.isVideoTexture) {
    //   bindingGPU.externalTexture = {}; // GPUExternalTextureBindingLayout
    // } else if (binding.isSampledTexture && binding.store) {
    //   const format = this.backend.get(binding.texture).texture.format;
    //   const access = binding.access;
    //   bindingGPU.storageTexture = { format, access }; // GPUStorageTextureBindingLayout
    // } else if (binding.isSampledTexture) {
    //   const texture = {}; // GPUTextureBindingLayout
    //   if (binding.texture.isMultisampleRenderTargetTexture === true) {
    //     texture.multisampled = true;
    //   }
    //   if (binding.texture.isDepthTexture) {
    //     texture.sampleType = GPUTextureSampleType.Depth;
    //   } else if (
    //     binding.texture.isDataTexture ||
    //     binding.texture.isDataArrayTexture ||
    //     binding.texture.isData3DTexture
    //   ) {
    //     const type = binding.texture.type;
    //     if (type === IntType) {
    //       texture.sampleType = GPUTextureSampleType.SInt;
    //     } else if (type === UnsignedIntType) {
    //       texture.sampleType = GPUTextureSampleType.UInt;
    //     } else if (type === FloatType) {
    //       if (this.backend.hasFeature("float32-filterable")) {
    //         texture.sampleType = GPUTextureSampleType.Float;
    //       } else {
    //         texture.sampleType = GPUTextureSampleType.UnfilterableFloat;
    //       }
    //     }
    //   }
    //   if (binding.isSampledCubeTexture) {
    //     texture.viewDimension = GPUTextureViewDimension.Cube;
    //   } else if (
    //     binding.texture.isDataArrayTexture ||
    //     binding.texture.isCompressedArrayTexture
    //   ) {
    //     texture.viewDimension = GPUTextureViewDimension.TwoDArray;
    //   } else if (binding.isSampledTexture3D) {
    //     texture.viewDimension = GPUTextureViewDimension.ThreeD;
    //   }
    //   bindingGPU.texture = texture;
    // } else {
    //   console.error(`WebGPUBindingUtils: Unsupported binding "${binding}".`);
    // }

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
