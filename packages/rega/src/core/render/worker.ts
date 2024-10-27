import {
  MaterialJSON,
  TransferObject,
  TransferBinding,
  TransferInput,
} from "./types";

import { createBindGroup, createRenderPipeline } from "./utils";

import createGPUVertexBuffers from "./createGPUVertexBuffers";

let context!: GPUCanvasContext;
let device!: GPUDevice;

const pipelineMap = new Map<
  string,
  {
    pipeline: GPURenderPipeline;
    bindGroupLayoutMap: Map<string, GPUBindGroupLayout>;
  }
>();

const vertexBuffersMap = new Map<string, GPUBuffer[]>();

const indexBufferMap = new Map<string, GPUBuffer>();

const bindGroupMap = new Map<
  string,
  {
    gpuBindGroup: GPUBindGroup;
    gpuBuffers: GPUBuffer[];
  }
>();

const renderObjectMap = new Map<
  string,
  {
    material: MaterialJSON;
    pipelineKey: string;
    bindings: TransferBinding[];
    input: TransferInput;
  }
>();

let _initialized = false;

self.addEventListener("message", async (event) => {
  if (event.data.type === "initCanvas" && !_initialized) {
    _initialized = true;
    const canvas = event.data.canvas;
    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter!.requestDevice();
    context = canvas.getContext("webgpu")!;
    // 配置画布格式
    context.configure({
      device: device,
      format: "bgra8unorm",
    });
    self.postMessage({ type: "ready" });
    start();
  } else if (event.data.type === "addObject") {
    const { id, material, bindings, input } = event.data
      .object as TransferObject;
    const pipelineKey = JSON.stringify(material);
    if (!pipelineMap.has(pipelineKey)) {
      const pl = createRenderPipeline(device, material);
      pipelineMap.set(pipelineKey, pl);

      const bindGroupLayoutMap = pl.bindGroupLayoutMap;

      material.bindings.forEach((bg) => {
        const bindGroupKey = `${pipelineKey},${bg.index}`;
        if (!bindGroupMap.has(bindGroupKey)) {
          const layout = bindGroupLayoutMap.get(bg.name)!;
          const bindGroup = createBindGroup(device, layout, bg);
          bindGroupMap.set(bindGroupKey, bindGroup);
        }
      });
    }

    if (!vertexBuffersMap.has(input.key)) {
      vertexBuffersMap.set(
        input.key,
        createGPUVertexBuffers(device, material, input.vertexCount)
      );
    }
    if (input.index) {
      const { key: indexKey, indexBuffer } = input.index;
      if (!indexBufferMap.has(indexKey)) {
        const buffer = device.createBuffer({
          size: indexBuffer.byteLength,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        });
        const mappedRange = buffer.getMappedRange();
        new Uint16Array(mappedRange).set(new Uint16Array(indexBuffer));
        buffer.unmap();
        indexBufferMap.set(indexKey, buffer);
      }
    }
    renderObjectMap.set(id, { pipelineKey, bindings, input, material });
  } else if (event.data.type === "removeObject") {
    renderObjectMap.delete(event.data.objectID);
  }
});

async function start() {
  function render() {
    const textureView = context.getCurrentTexture().createView();
    const commandEncoder = device.createCommandEncoder();
    const renderPassDescriptor: GPURenderPassDescriptor = {
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

    renderObjectMap.forEach(({ pipelineKey, bindings, input }) => {
      const pipeline = pipelineMap.get(pipelineKey)!.pipeline;
      passEncoder.setPipeline(pipeline);

      bindings.forEach((binding) => {
        const bindGroup = bindGroupMap.get(
          `${pipelineKey},${binding.groupIndex}`
        )!;
        bindGroup.gpuBuffers.forEach((gpuBuffer, index) => {
          device.queue.writeBuffer(gpuBuffer, 0, binding.buffers[index], 0);
        });
        passEncoder.setBindGroup(binding.groupIndex, bindGroup.gpuBindGroup);
      });

      const vertexBuffers = vertexBuffersMap.get(input.key)!;
      input.vertexBuffers.forEach((buffer, index) => {
        const gpuBuffer = vertexBuffers[index];
        device.queue.writeBuffer(gpuBuffer, 0, buffer, 0);
        passEncoder.setVertexBuffer(index, gpuBuffer);
      });
      if (input.index) {
        const {
          indexCount,
          indexFormat,
          key: indexKey,
          // indexBuffer,
        } = input.index;
        const gpuIndexBuffer = indexBufferMap.get(indexKey)!;
        passEncoder.setIndexBuffer(gpuIndexBuffer, indexFormat);
        passEncoder.drawIndexed(indexCount);
      } else {
        passEncoder.draw(input.vertexCount);
      }
    });

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render();
}
