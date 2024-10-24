import { BindGroupInfo } from "./types";

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

const gpuBufferMap = new Map<string, GPUBuffer>();
const bindMap = new Map<string, string>();

export function getGPUBuffer(id: string) {
  return gpuBufferMap.get(id);
}

export function createBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  bindGroup: BindGroupInfo
) {
  let bindingPoint = 0;
  const entriesGPU = [];

  for (const binding of bindGroup.bindings) {
    if (binding.isUniformBuffer) {
      const byteLength = binding.byteLength;

      const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

      const gpuBuffer = device.createBuffer({
        label: "bindingBuffer_" + binding.name,
        size: byteLength,
        usage: usage,
      });

      const id = crypto.randomUUID();
      gpuBufferMap.set(id, gpuBuffer);

      bindMap.set(binding.id, id);

      entriesGPU.push({
        binding: bindingPoint,
        resource: { buffer: gpuBuffer },
      });
    }
    // else if (binding.isStorageBuffer) {
    //   const bindingData = backend.get(binding);
    //   if (bindingData.buffer === undefined) {
    //     const attribute = binding.attribute;
    //     //const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | /*GPUBufferUsage.COPY_SRC |*/ GPUBufferUsage.COPY_DST;
    //     //backend.attributeUtils.createAttribute( attribute, usage ); // @TODO: Move it to universal renderer
    //     bindingData.buffer = backend.get(attribute).buffer;
    //   }
    //   entriesGPU.push({
    //     binding: bindingPoint,
    //     resource: { buffer: bindingData.buffer },
    //   });
    // } else if (binding.isSampler) {
    //   const textureGPU = backend.get(binding.texture);
    //   entriesGPU.push({ binding: bindingPoint, resource: textureGPU.sampler });
    // } else if (binding.isSampledTexture) {
    //   const textureData = backend.get(binding.texture);
    //   let resourceGPU;
    //   if (textureData.externalTexture !== undefined) {
    //     resourceGPU = device.importExternalTexture({
    //       source: textureData.externalTexture,
    //     });
    //   } else {
    //     const mipLevelCount = binding.store
    //       ? 1
    //       : textureData.texture.mipLevelCount;
    //     const propertyName = `view-${textureData.texture.width}-${textureData.texture.height}-${mipLevelCount}`;
    //     resourceGPU = textureData[propertyName];
    //     if (resourceGPU === undefined) {
    //       const aspectGPU = GPUTextureAspect.All;
    //       let dimensionViewGPU;
    //       if (binding.isSampledCubeTexture) {
    //         dimensionViewGPU = GPUTextureViewDimension.Cube;
    //       } else if (binding.isSampledTexture3D) {
    //         dimensionViewGPU = GPUTextureViewDimension.ThreeD;
    //       } else if (
    //         binding.texture.isDataArrayTexture ||
    //         binding.texture.isCompressedArrayTexture
    //       ) {
    //         dimensionViewGPU = GPUTextureViewDimension.TwoDArray;
    //       } else {
    //         dimensionViewGPU = GPUTextureViewDimension.TwoD;
    //       }
    //       resourceGPU = textureData[propertyName] =
    //         textureData.texture.createView({
    //           aspect: aspectGPU,
    //           dimension: dimensionViewGPU,
    //           mipLevelCount,
    //         });
    //     }
    //   }
    //   entriesGPU.push({ binding: bindingPoint, resource: resourceGPU });
    // }

    bindingPoint++;
  }

  return device.createBindGroup({
    label: "bindGroup_" + bindGroup.name,
    layout: gpuBindGroupLayout,
    entries: entriesGPU,
  });
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
