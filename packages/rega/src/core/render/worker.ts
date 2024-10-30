import {
  MaterialJSON,
  TransferObject,
  TransferBinding,
  TransferInput,
} from "./types";

import {
  addObjectGPUBuffer,
  removeObjectGPUBuffer,
  updateGPUBuffer,
} from "./bufferPair";
import createGPUBindGroup from "./createGPUBindGroup";
import createRenderPipeline from "./createRenderPipeline";

let context!: GPUCanvasContext;
let device!: GPUDevice;

const pipelineMap = new Map<
  string,
  {
    pipeline: GPURenderPipeline;
    bindGroupLayoutMap: Map<string, GPUBindGroupLayout>;
  }
>();

const renderObjectMap = new Map<
  string,
  {
    material: MaterialJSON;
    pipelineKey: string;
    bindings: TransferBinding[];
    gpuBindGroups: GPUBindGroup[];
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

    const gpuBindGroups: GPUBindGroup[] = [];

    bindings.forEach(({ resources }, index) => {
      const bg = material.bindings[index];
      const gpuResources = resources.map((res, bIndex) => {
        const info = bg.bindings[bIndex];
        if (res.type === "uniformBuffer") {
          let usage = GPUBufferUsage.UNIFORM;
          if (info.type === "uniformBuffer") {
            usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
          }
          const gpuBuffer = addObjectGPUBuffer(device, res.buffer, usage);
          return { buffer: gpuBuffer } as GPUBufferBinding;
        } else {
          throw new Error("not supported uniform type: " + res.type);
        }
      });

      const layout = pl.bindGroupLayoutMap.get(bg.name)!;
      gpuBindGroups.push(createGPUBindGroup(device, layout, bg, gpuResources));
    });

    input.vertexBuffers.forEach((buffer) => {
      addObjectGPUBuffer(
        device,
        buffer,
        GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      );
    });
    if (input.index) {
      const { indexBuffer } = input.index;
      addObjectGPUBuffer(
        device,
        indexBuffer,
        GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
      );
    }
    renderObjectMap.set(id, {
      pipelineKey,
      bindings,
      input,
      material,
      gpuBindGroups,
    });
  } else if (event.data.type === "removeObject") {
    const object = renderObjectMap.get(event.data.objectID);
    if (object) {
      const { bindings, input } = object;
      bindings.forEach(({ resources }) => {
        resources.forEach((res) => {
          if (res.type === "uniformBuffer") {
            removeObjectGPUBuffer(res.buffer);
          } else {
            throw new Error(
              "RemoveObject: not supported uniform type: " + res.type
            );
          }
        });
      });
      input.vertexBuffers.forEach((buffer) => {
        removeObjectGPUBuffer(buffer);
      });
      input.index && removeObjectGPUBuffer(input.index.indexBuffer);
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

    renderObjectMap.forEach(
      ({ pipelineKey, bindings, input, gpuBindGroups }) => {
        const pipeline = pipelineMap.get(pipelineKey)!.pipeline;
        passEncoder.setPipeline(pipeline);

        bindings.forEach((binding) => {
          binding.resources.forEach((res) => {
            if (res.type === "uniformBuffer") {
              updateGPUBuffer(device, res.buffer);
            }
          });
          passEncoder.setBindGroup(
            binding.groupIndex,
            gpuBindGroups[binding.groupIndex]
          );
        });
        input.vertexBuffers.forEach((buffer, index) => {
          const gpuBuffer = updateGPUBuffer(device, buffer);
          passEncoder.setVertexBuffer(index, gpuBuffer);
        });
        if (input.index) {
          const { indexBuffer, indexCount } = input.index;
          const gpuBuffer = updateGPUBuffer(device, indexBuffer);
          passEncoder.setIndexBuffer(gpuBuffer, "uint16");
          passEncoder.drawIndexed(indexCount);
        } else {
          passEncoder.draw(input.vertexCount);
        }
      }
    );

    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);

    // if (frame < 200) {
    //   requestAnimationFrame(render);
    // }
  }

  render();
}
