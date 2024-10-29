import {
  MaterialJSON,
  TransferObject,
  TransferBinding,
  TransferInput,
} from "./types";

import { createBindGroup } from "./utils";
import createRenderPipeline from "./createRenderPipeline";
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

    gpuBindings: Array<{
      gpuBindGroup: GPUBindGroup;
      gpuBuffers: GPUBuffer[];
    }>;

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
      pipelineMap.set(pipelineKey, createRenderPipeline(device, material));
    }

    const pl = pipelineMap.get(pipelineKey)!;

    const gpuBindings: Array<{
      gpuBindGroup: GPUBindGroup;
      gpuBuffers: GPUBuffer[];
    }> = [];

    material.bindings.forEach((bg) => {
      const layout = pl.bindGroupLayoutMap.get(bg.name)!;
      const gpuBinding = createBindGroup(device, layout, bg);
      gpuBindings[bg.index] = gpuBinding;
    });

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
    renderObjectMap.set(id, {
      pipelineKey,
      bindings,
      input,
      material,
      gpuBindings,
    });
  } else if (event.data.type === "removeObject") {
    const object = renderObjectMap.get(event.data.objectID);
    if (object) {
      const { gpuBindings } = object;
      gpuBindings.forEach(({ gpuBuffers }) => {
        gpuBuffers.forEach((gpuBuffer) => {
          gpuBuffer.destroy();
        });
      });
      renderObjectMap.delete(event.data.objectID);
    }
  }
});

// @TODO reuse camera gpu bindGroup per frame

async function start() {
  let frame = 0;

  function render() {
    frame++;

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

    renderObjectMap.forEach(({ pipelineKey, bindings, input, gpuBindings }) => {
      const pipeline = pipelineMap.get(pipelineKey)!.pipeline;
      passEncoder.setPipeline(pipeline);

      bindings.forEach((binding) => {
        const gpuBinding = gpuBindings[binding.groupIndex];

        gpuBinding.gpuBuffers.forEach((gpuBuffer, index) => {
          const cpuBuffer = binding.buffers[index];
          device.queue.writeBuffer(gpuBuffer, 0, cpuBuffer, 0);
        });

        passEncoder.setBindGroup(binding.groupIndex, gpuBinding.gpuBindGroup);
      });

      const vertexBuffers = vertexBuffersMap.get(input.key)!;
      input.vertexBuffers.forEach((buffer, index) => {
        const gpuBuffer = vertexBuffers[index];
        device.queue.writeBuffer(gpuBuffer, 0, buffer, 0);
        passEncoder.setVertexBuffer(index, gpuBuffer);
      });
      if (input.index) {
        const { indexCount, indexFormat, key: indexKey } = input.index;
        const gpuIndexBuffer = indexBufferMap.get(indexKey)!;
        passEncoder.setIndexBuffer(gpuIndexBuffer, indexFormat);
        passEncoder.drawIndexed(indexCount);
      } else {
        passEncoder.draw(input.vertexCount);
      }
    });

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    if (frame < 200) {
      requestAnimationFrame(render);
    }
  }

  render();
}
