import { BindGroupInfo } from "./types";

export default function createGPUBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  bindGroup: BindGroupInfo,
  gpuBuffers: GPUBuffer[]
) {
  const entriesGPU = gpuBuffers.map((buffer, index) => ({
    binding: index,
    resource: { buffer: buffer },
  }));

  // for (const binding of bindGroup.bindings) {
  //   // if (binding.isUniformBuffer) {
  //   //   const byteLength = binding.byteLength;

  //   //   const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

  //   //   entriesGPU.push({
  //   //     binding: bindingPoint,
  //   //     resource: { buffer: gpuBuffers[binding.] },
  //   //   });
  //   // }
  //   // else if (binding.isStorageBuffer) {
  //   //   const bindingData = backend.get(binding);
  //   //   if (bindingData.buffer === undefined) {
  //   //     const attribute = binding.attribute;
  //   //     //const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | /*GPUBufferUsage.COPY_SRC |*/ GPUBufferUsage.COPY_DST;
  //   //     //backend.attributeUtils.createAttribute( attribute, usage ); // @TODO: Move it to universal renderer
  //   //     bindingData.buffer = backend.get(attribute).buffer;
  //   //   }
  //   //   entriesGPU.push({
  //   //     binding: bindingPoint,
  //   //     resource: { buffer: bindingData.buffer },
  //   //   });
  //   // } else if (binding.isSampler) {
  //   //   const textureGPU = backend.get(binding.texture);
  //   //   entriesGPU.push({ binding: bindingPoint, resource: textureGPU.sampler });
  //   // } else if (binding.isSampledTexture) {
  //   //   const textureData = backend.get(binding.texture);
  //   //   let resourceGPU;
  //   //   if (textureData.externalTexture !== undefined) {
  //   //     resourceGPU = device.importExternalTexture({
  //   //       source: textureData.externalTexture,
  //   //     });
  //   //   } else {
  //   //     const mipLevelCount = binding.store
  //   //       ? 1
  //   //       : textureData.texture.mipLevelCount;
  //   //     const propertyName = `view-${textureData.texture.width}-${textureData.texture.height}-${mipLevelCount}`;
  //   //     resourceGPU = textureData[propertyName];
  //   //     if (resourceGPU === undefined) {
  //   //       const aspectGPU = GPUTextureAspect.All;
  //   //       let dimensionViewGPU;
  //   //       if (binding.isSampledCubeTexture) {
  //   //         dimensionViewGPU = GPUTextureViewDimension.Cube;
  //   //       } else if (binding.isSampledTexture3D) {
  //   //         dimensionViewGPU = GPUTextureViewDimension.ThreeD;
  //   //       } else if (
  //   //         binding.texture.isDataArrayTexture ||
  //   //         binding.texture.isCompressedArrayTexture
  //   //       ) {
  //   //         dimensionViewGPU = GPUTextureViewDimension.TwoDArray;
  //   //       } else {
  //   //         dimensionViewGPU = GPUTextureViewDimension.TwoD;
  //   //       }
  //   //       resourceGPU = textureData[propertyName] =
  //   //         textureData.texture.createView({
  //   //           aspect: aspectGPU,
  //   //           dimension: dimensionViewGPU,
  //   //           mipLevelCount,
  //   //         });
  //   //     }
  //   //   }
  //   //   entriesGPU.push({ binding: bindingPoint, resource: resourceGPU });
  //   // }

  //   bindingPoint++;
  // }

  return device.createBindGroup({
    label: "bindGroup_" + bindGroup.name,
    layout: gpuBindGroupLayout,
    entries: entriesGPU,
  });
}
