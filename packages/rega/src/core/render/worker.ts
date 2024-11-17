import {
  MaterialJSON,
  TransferObject,
  TransferRenderTarget,
  TransferInput,
  TransferResource,
} from "./types";

import {
  addObjectGPUBuffer,
  removeObjectGPUBuffer,
  addObjectGPUTexture,
  removeObjectGPUTexture,
  updateGPUTexture,
  addObjectGPUSampler,
  updateGPUBuffer,
} from "./bufferPair";
import createGPUBindGroup from "./createGPUBindGroup";
import createRenderPipeline from "./createRenderPipeline";
import createBindGroupLayout from "./createBindGroupLayout";

import { parseColor } from "../tools/color";

let context!: GPUCanvasContext;
let device!: GPUDevice;
let canvasSize = { width: 0, height: 0 };
let backgroundColor = { r: 0, g: 0, b: 0, a: 1 };

const pipelineMap = new Map<
  string,
  {
    pipeline: GPURenderPipeline;
    bindGroupLayouts: GPUBindGroupLayout[];
  }
>();

const renderObjectMap = new Map<
  string, // object ID
  {
    material: MaterialJSON;
    pipelineKey: string;

    // index 3
    // check-every-frame
    // check-every-scene
    // check-every-object
    bindings: Array<{
      binding: number;
      resource: TransferResource;
    }>;

    bindGroup: GPUBindGroup;

    input: TransferInput;

    vertexCountView: Uint32Array;
  }
>();

// index 2
// check-every-frame
// check-every-scene
const renderTargets = new Map<
  string,
  {
    objects: Set<string>;
    viewportView: Float32Array;
    bindings: Array<{
      binding: number;
      resource: TransferResource;
    }>;
    bindGroup: GPUBindGroup;
    depthTexture: GPUTexture;
    depthTextureView: GPUTextureView;
  }
>();
let renderTargetIds: string[] = [];

// index 1
// check-every-frame
const frameBindGroup = {
  bindings: [] as Array<{
    binding: number;
    resource: TransferResource;
  }>,
  bindGroup: null as any as GPUBindGroup,
};

// index 0
// check on signal
const globalBindGroup = {
  bindings: [] as Array<{
    binding: number;
    resource: TransferResource;
  }>,
  bindGroup: null as any as GPUBindGroup,
};

let _initialized = false;

self.addEventListener("message", async (event) => {
  if (event.data.type === "initCanvas" && !_initialized) {
    _initialized = true;
    const canvas = event.data.canvas as OffscreenCanvas;
    const adapter = await navigator.gpu.requestAdapter();
    canvasSize = { width: canvas.width, height: canvas.height };
    device = await adapter!.requestDevice();
    context = canvas.getContext("webgpu")!;

    const { array, opacity } = parseColor(event.data.backgroundColor);
    backgroundColor = {
      r: array[0],
      g: array[1],
      b: array[2],
      a: opacity,
    };

    // 配置画布格式
    context.configure({
      device: device,
      format: "bgra8unorm",
    });

    globalBindGroup.bindGroup = createGPUBindGroup(
      device,
      device.createBindGroupLayout({ entries: [] }),
      []
    );

    frameBindGroup.bindGroup = createGPUBindGroup(
      device,
      device.createBindGroupLayout({ entries: [] }),
      []
    );

    self.postMessage({ type: "ready" });
    start();
  } else if (event.data.type === "createRenderTarget") {
    const { id, viewport, bindings, textures } = event.data
      .target as TransferRenderTarget;
    const viewportView = new Float32Array(viewport);

    const bindGroupLayout = createBindGroupLayout(
      device,
      bindings.map(({ binding, resource, name }) => {
        let type;
        if (resource.type === "texture") {
          if (resource.sampleType === "sint") {
            type = "sintTexture" as const;
          } else if (resource.sampleType === "uint") {
            type = "uintTexture" as const;
          } else {
            type = "sampledTexture" as const;
          }
        } else {
          type = resource.type;
        }

        return {
          binding,
          type,
          name,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        };
      })
    );

    const gpuResources = bindings.map(({ resource, binding, name }) => {
      if (resource.type === "uniformBuffer") {
        const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
        const gpuBuffer = addObjectGPUBuffer(
          device,
          name,
          resource.buffer,
          usage
        );
        return {
          binding,
          resource: { buffer: gpuBuffer } as GPUBufferBinding,
        };
      } else if (resource.type === "texture") {
        const usage =
          GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
        const t = textures[name];
        const texture = addObjectGPUTexture(
          device,
          t.immutable,
          name,
          resource.textureId,
          t.buffer,
          {
            width: t.width,
            height: t.height,
            usage,
            format: t.format,
          }
        );

        return {
          binding,
          resource: texture.createView(),
        };
      } else if (resource.type === "sampler") {
        return {
          binding,
          resource: addObjectGPUSampler(device, {}),
        };
      } else {
        throw new Error("not supported uniform type");
      }
    });

    const gpuBindGroup = createGPUBindGroup(
      device,
      bindGroupLayout,
      gpuResources
    );

    const depthTexture = device.createTexture({
      size: [canvasSize.width, canvasSize.height, 1],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const depthTextureView = depthTexture.createView();
    renderTargets.set(id, {
      objects: new Set(),
      viewportView,
      bindGroup: gpuBindGroup,
      bindings,
      depthTexture,
      depthTextureView,
    });
    renderTargetIds.push(id);
  } else if (event.data.type === "removeRenderTarget") {
    const { id } = event.data;
    const target = renderTargets.get(id);
    if (target) {
      renderTargetIds = renderTargetIds.filter((targetId) => targetId !== id);
      target.depthTexture.destroy();
      renderTargets.delete(id);
    }
  } else if (event.data.type === "addObjectToTarget") {
    const { targetId, objectId } = event.data;
    const target = renderTargets.get(targetId);
    if (target) {
      target.objects.add(objectId);
    }
  } else if (event.data.type === "removeObjectFromTarget") {
    const { targetId, objectId } = event.data;
    const target = renderTargets.get(targetId);
    if (target) {
      target.objects.delete(objectId);
    }
  } else if (event.data.type === "createObject") {
    const { id, material, bindings, input, textures } = event.data
      .object as TransferObject;
    const pipelineKey = JSON.stringify(material);
    if (!pipelineMap.has(pipelineKey)) {
      const pipeline = createRenderPipeline(device, material);
      pipelineMap.set(pipelineKey, pipeline);
    }

    const pl = pipelineMap.get(pipelineKey)!;

    const gpuResources = bindings.map(({ resource, binding, name }) => {
      if (resource.type === "uniformBuffer") {
        const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
        const gpuBuffer = addObjectGPUBuffer(
          device,
          name,
          resource.buffer,
          usage
        );
        return {
          binding,
          resource: { buffer: gpuBuffer } as GPUBufferBinding,
        };
      } else if (resource.type === "texture") {
        const usage =
          GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
        const t = textures[name];
        const texture = addObjectGPUTexture(
          device,
          t.immutable,
          name,
          resource.textureId,
          t.buffer,
          {
            width: t.width,
            height: t.height,
            usage,
            format: t.format,
          }
        );
        return {
          binding,
          resource: texture.createView(),
        };
      } else if (resource.type === "sampler") {
        return {
          binding,
          resource: addObjectGPUSampler(device, {}),
        };
      } else {
        throw new Error("not supported uniform type");
      }
    });

    const gpuBindGroup = createGPUBindGroup(
      device,
      pl.bindGroupLayouts[0],
      gpuResources
    );

    input.vertexBuffers.forEach((buffer, index) => {
      const attribute = material.attributes[index];
      addObjectGPUBuffer(
        device,
        attribute.name,
        buffer,
        GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      );
    });

    if (input.index) {
      const { indexBuffer } = input.index;
      addObjectGPUBuffer(
        device,
        "index_buffer",
        indexBuffer,
        GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
      );
    }

    renderObjectMap.set(id, {
      pipelineKey,
      input,
      material,
      bindGroup: gpuBindGroup,
      bindings,
      vertexCountView: new Uint32Array(input.vertexCtrlBuffer),
    });
  } else if (event.data.type === "removeObject") {
    const id = event.data.id;
    const object = renderObjectMap.get(id);
    if (object) {
      const { bindings, input } = object;
      bindings.forEach(({ resource }) => {
        if (resource.type === "uniformBuffer") {
          removeObjectGPUBuffer(resource.buffer);
        } else if (resource.type === "texture") {
          removeObjectGPUTexture(resource.textureId);
        } else if (resource.type === "sampler") {
          // do nothing
        } else {
          throw new Error("RemoveObject: not supported uniform type");
        }
      });
      input.vertexBuffers.forEach((buffer) => {
        removeObjectGPUBuffer(buffer);
      });
      input.index && removeObjectGPUBuffer(input.index.indexBuffer);
      renderObjectMap.delete(id);
    }
  }
});

async function start() {
  let frame = 0;

  function render() {
    frame++;

    const textureView = context.getCurrentTexture().createView();
    const commandEncoder = device.createCommandEncoder();

    renderTargetIds.forEach((targetId, i) => {
      const target = renderTargets.get(targetId)!;
      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: textureView,
            loadOp: i == 0 ? "clear" : "load",
            clearValue: backgroundColor,
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: target.depthTextureView,
          depthClearValue: 1.0, // 深度清除值
          depthStoreOp: "store",
          depthLoadOp: "clear",
        },
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

      passEncoder.setBindGroup(3, globalBindGroup.bindGroup);
      passEncoder.setBindGroup(2, frameBindGroup.bindGroup);

      passEncoder.setViewport(
        target.viewportView[0],
        target.viewportView[1],
        target.viewportView[2],
        target.viewportView[3],
        0,
        1
      );

      // check target bindings
      target.bindings.forEach(({ resource }) => {
        if (resource.type === "uniformBuffer") {
          updateGPUBuffer(device, resource.buffer);
        } else if (resource.type === "texture") {
          updateGPUTexture(device, resource.textureId);
        } else if (resource.type === "sampler") {
          // do nothing
        } else {
          throw new Error("update: not supported uniform type");
        }
      });

      passEncoder.setBindGroup(1, target.bindGroup);

      target.objects.forEach((objectId) => {
        const object = renderObjectMap.get(objectId);
        if (object) {
          const pipeline = pipelineMap.get(object.pipelineKey)!.pipeline;
          passEncoder.setPipeline(pipeline);
          // check object bindings
          object.bindings.forEach(({ resource }) => {
            if (resource.type === "uniformBuffer") {
              updateGPUBuffer(device, resource.buffer);
            } else if (resource.type === "texture") {
              updateGPUTexture(device, resource.textureId);
            } else if (resource.type === "sampler") {
              // do nothing
            } else {
              throw new Error("update: not supported uniform type");
            }
          });
          passEncoder.setBindGroup(0, object.bindGroup);

          // check vertex buffers
          object.input.vertexBuffers.forEach((buffer, index) => {
            const gpuBuffer = updateGPUBuffer(device, buffer);
            passEncoder.setVertexBuffer(index, gpuBuffer);
          });

          // draw
          if (object.input.index) {
            const { indexBuffer, indexCount } = object.input.index;
            const gpuBuffer = updateGPUBuffer(device, indexBuffer);
            passEncoder.setIndexBuffer(gpuBuffer, "uint16");
            passEncoder.drawIndexed(indexCount);
          } else {
            passEncoder.draw(object.vertexCountView[0]);
          }
        }
      });

      passEncoder.end();
    });

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);

    // if (frame < 200) {
    //   requestAnimationFrame(render);
    // }
  }

  render();
}
