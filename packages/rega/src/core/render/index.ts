/// <reference types="@webgpu/types" />

import {
  vec4,
  cameraProjectionMatrix,
  attribute,
  modelViewMatrix,
  positionGeometry,
} from "three/src/nodes/TSL.js";
import WGSLNodeBuilder from "three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js";
import NodeMaterial from "three/src/materials/nodes/NodeMaterial.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { Type } from "typescript";
import { TypedArray } from "three";

// 不重要
const geometry = new BufferGeometry();

function createBindingsLayout(device: GPUDevice, bindGroup: any) {
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
    } else if (binding.isSampler) {
      const sampler: GPUSamplerBindingLayout = {}; // GPUSamplerBindingLayout

      if (binding.texture.isDepthTexture) {
        if (binding.texture.compareFunction !== null) {
          sampler.type = "comparison";
        }
      }

      bindingGPU.sampler = sampler;
    } else if (binding.isSampledTexture && binding.texture.isVideoTexture) {
      bindingGPU.externalTexture = {}; // GPUExternalTextureBindingLayout
    } else if (binding.isSampledTexture && binding.store) {
      // const format = this.backend.get(binding.texture).texture.format;
      // const access = binding.access;
      // bindingGPU.storageTexture = { format, access }; // GPUStorageTextureBindingLayout
    } else if (binding.isSampledTexture) {
      // const texture = {}; // GPUTextureBindingLayout
      // if (binding.texture.isMultisampleRenderTargetTexture === true) {
      //   texture.multisampled = true;
      // }
      // if (binding.texture.isDepthTexture) {
      //   texture.sampleType = GPUTextureSampleType.Depth;
      // } else if (
      //   binding.texture.isDataTexture ||
      //   binding.texture.isDataArrayTexture ||
      //   binding.texture.isData3DTexture
      // ) {
      //   const type = binding.texture.type;
      //   if (type === IntType) {
      //     texture.sampleType = GPUTextureSampleType.SInt;
      //   } else if (type === UnsignedIntType) {
      //     texture.sampleType = GPUTextureSampleType.UInt;
      //   } else if (type === FloatType) {
      //     if (this.backend.hasFeature("float32-filterable")) {
      //       texture.sampleType = GPUTextureSampleType.Float;
      //     } else {
      //       texture.sampleType = GPUTextureSampleType.UnfilterableFloat;
      //     }
      //   }
      // }
      // if (binding.isSampledCubeTexture) {
      //   texture.viewDimension = GPUTextureViewDimension.Cube;
      // } else if (
      //   binding.texture.isDataArrayTexture ||
      //   binding.texture.isCompressedArrayTexture
      // ) {
      //   texture.viewDimension = GPUTextureViewDimension.TwoDArray;
      // } else if (binding.isSampledTexture3D) {
      //   texture.viewDimension = GPUTextureViewDimension.ThreeD;
      // }
      // bindingGPU.texture = texture;
    } else {
      console.error(`WebGPUBindingUtils: Unsupported binding "${binding}".`);
    }

    entries.push(bindingGPU);
  }

  return device.createBindGroupLayout({ entries });
}

function createBindGroup(
  device: GPUDevice,
  gpuBindGroupLayout: GPUBindGroupLayout,
  bindGroup: any
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

      entriesGPU.push({
        binding: bindingPoint,
        resource: { buffer: gpuBuffer },
      });
    } else if (binding.isStorageBuffer) {
      // const bindingData = backend.get(binding);
      // if (bindingData.buffer === undefined) {
      //   const attribute = binding.attribute;
      //   //const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | /*GPUBufferUsage.COPY_SRC |*/ GPUBufferUsage.COPY_DST;
      //   //backend.attributeUtils.createAttribute( attribute, usage ); // @TODO: Move it to universal renderer
      //   bindingData.buffer = backend.get(attribute).buffer;
      // }
      // entriesGPU.push({
      //   binding: bindingPoint,
      //   resource: { buffer: bindingData.buffer },
      // });
    } else if (binding.isSampler) {
      // const textureGPU = backend.get(binding.texture);
      // entriesGPU.push({ binding: bindingPoint, resource: textureGPU.sampler });
    } else if (binding.isSampledTexture) {
      // const textureData = backend.get(binding.texture);
      // let resourceGPU;
      // if (textureData.externalTexture !== undefined) {
      //   resourceGPU = device.importExternalTexture({
      //     source: textureData.externalTexture,
      //   });
      // } else {
      //   const mipLevelCount = binding.store
      //     ? 1
      //     : textureData.texture.mipLevelCount;
      //   const propertyName = `view-${textureData.texture.width}-${textureData.texture.height}-${mipLevelCount}`;
      //   resourceGPU = textureData[propertyName];
      //   if (resourceGPU === undefined) {
      //     const aspectGPU = GPUTextureAspect.All;
      //     let dimensionViewGPU;
      //     if (binding.isSampledCubeTexture) {
      //       dimensionViewGPU = GPUTextureViewDimension.Cube;
      //     } else if (binding.isSampledTexture3D) {
      //       dimensionViewGPU = GPUTextureViewDimension.ThreeD;
      //     } else if (
      //       binding.texture.isDataArrayTexture ||
      //       binding.texture.isCompressedArrayTexture
      //     ) {
      //       dimensionViewGPU = GPUTextureViewDimension.TwoDArray;
      //     } else {
      //       dimensionViewGPU = GPUTextureViewDimension.TwoD;
      //     }
      //     resourceGPU = textureData[propertyName] =
      //       textureData.texture.createView({
      //         aspect: aspectGPU,
      //         dimension: dimensionViewGPU,
      //         mipLevelCount,
      //       });
      //   }
      // }
      // entriesGPU.push({ binding: bindingPoint, resource: resourceGPU });
    }

    bindingPoint++;
  }

  return device.createBindGroup({
    label: "bindGroup_" + bindGroup.name,
    layout: gpuBindGroupLayout,
    entries: entriesGPU,
  });
}

function createAttributeBuffer(
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

async function setupMaterial(cb: (material: NodeMaterial) => void) {
  const material = new NodeMaterial();

  cb(material);

  const builder = new WGSLNodeBuilder(
    { geometry, material },
    {
      getRenderTarget: () => null,
      nodes: {
        library: {
          fromMaterial: (m: any) => m,
        },
      },
      getMRT: () => null,
    }
  );

  builder.build();

  console.log(builder.vertexShader);
  console.log(builder.fragmentShader);

  const attributes = builder.attributes as Array<{
    name: string;
    type: "vec3" | "vec2";
  }>;
  console.log("attributes", attributes);

  const bindings = builder.getBindings();
  console.log("bindings", bindings);

  const canvasEl = document.createElement("canvas");
  document.body.appendChild(canvasEl);
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();
  const context = canvasEl.getContext("webgpu")!;

  // 配置画布格式
  const swapChainFormat = "bgra8unorm";
  context.configure({
    device: device,
    format: swapChainFormat,
  });

  const shaderModuleVertex = device.createShaderModule({
    code: builder.vertexShader,
  });

  const shaderModuleFragment = device.createShaderModule({
    code: builder.fragmentShader,
  });

  const bindGroupLayouts = [];

  const bindGroupList: Array<{ index: number; bindGroup: GPUBindGroup }> = [];

  // bindings
  for (const group of bindings) {
    const layout = createBindingsLayout(device, group);
    const bindGroup = createBindGroup(device, layout, group);
    bindGroupLayouts.push(layout);
    bindGroupList.push({ index: group.index, bindGroup });
  }

  // attributes
  const gpuVeterxBufferList: Array<{
    gpuBuffer: GPUBuffer;
    cpuBuffer: ArrayBuffer;
  }> = [];

  const gpuVeterxBufferLayouts: Array<GPUVertexBufferLayout> = [];

  let location = 0;

  for (const attribute of attributes) {
    let arrayStride = 4;
    let format: GPUVertexFormat = "float32";
    if (attribute.type === "vec3") {
      arrayStride = 4 * 4;
      format = "float32x3";
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
      format = "float32x2";
    }

    const arrayBuffer = new Float32Array(128 / 4);

    arrayBuffer.set([0.0, 0.5, 0 - 0.5, -0.5, 0, 0.5, -0.5, 0]);

    gpuVeterxBufferList.push({
      gpuBuffer: createAttributeBuffer(
        device,
        attribute,
        GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        128
      ),
      cpuBuffer: arrayBuffer.buffer,
    });

    gpuVeterxBufferLayouts.push({
      arrayStride,
      attributes: [
        {
          shaderLocation: location,
          offset: 0,
          format,
        },
      ],
    });

    location++;
  }

  // 创建 Pipeline Layout
  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts,
  });

  const pipeline = device.createRenderPipeline({
    layout: pipelineLayout, // 使用自定义的管线布局
    vertex: {
      module: shaderModuleVertex,
      entryPoint: "main",
      buffers: gpuVeterxBufferLayouts,
    },
    fragment: {
      module: shaderModuleFragment,
      entryPoint: "main",
      targets: [
        {
          format: swapChainFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  // 渲染三角形
  function render() {
    const textureView = context.getCurrentTexture().createView();
    const commandEncoder = device.createCommandEncoder();
    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          loadOp: "clear",
          clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);

    gpuVeterxBufferList.forEach((bufferItem, index) => {
      device.queue.writeBuffer(
        bufferItem.gpuBuffer,
        0,
        bufferItem.cpuBuffer,
        0
      );
      passEncoder.setVertexBuffer(index, bufferItem.gpuBuffer);
    });

    for (const bindGroupItem of bindGroupList) {
      passEncoder.setBindGroup(bindGroupItem.index, bindGroupItem.bindGroup);
    }

    passEncoder.draw(3); // 绘制 3 个顶点组成的三角形
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    // requestAnimationFrame(render);
  }

  render();
}

interface MeshElement {
  vertexShader: string;
  fragmentShader: string;
}

setupMaterial((material) => {
  //material.positionNode = positionGeometry;

  material.vertexNode = vec4(positionGeometry, 1.0);

  material.colorNode = vec4(1, 0, 0, 1);

  // = cameraProjectionMatrix
  //   .mul(modelViewMatrix)
  //   .mul(positionGeometry);
});
