import {
  MaterialJSON,
  TransferObject,
  TransferInput,
  TransferResource,
  TransferPipeline,
  TransferBinding,
  resourceToResourceType,
  TransferRenderPassRef,
  TransferRenderPassTexture,
  resourceToKey,
} from "./types";

import {
  addObjectGPUBuffer,
  removeObjectGPUBuffer,
  addObjectGPUTexture,
  removeObjectGPUTexture,
  updateGPUTexture,
  addObjectGPUSampler,
  updateGPUBuffer,
  getGPUBuffer,
} from "./bufferPair";

import createGPUBindGroup from "./createGPUBindGroup";
import createRenderPipeline from "./createRenderPipeline";
import createBindGroupLayout from "./createBindGroupLayout";

import { parseColor } from "../tools/color";

function createBindGroupByBindings(
  device: GPUDevice,
  bindings: TransferBinding[],
  textures: Record<string, any>
) {
  const keysArr: string[] = [];
  bindings.forEach(({ binding, resource }) => {
    keysArr[binding] = resourceToKey(resource);
  });
  const key = keysArr.join("|");

  const cached = sharedBindGroups.get(key);

  if (cached) {
    cached.referenceCount++;
    return cached;
  }

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
      const usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
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
        resource: addObjectGPUSampler(device, {
          magFilter: resource.magFilter,
          minFilter: resource.minFilter,
          maxAnisotropy: resource.maxAnisotropy,
          compare: resource.compare,
        }),
      };
    } else {
      throw new Error("not supported uniform type");
    }
  });
  const namedBindingLayout = bindings.map(
    ({ binding, resource, name, visibility }) => ({
      type: resourceToResourceType(resource),
      name,
      binding,
      visibility,
    })
  );

  const bindGroupLayout = createBindGroupLayout(device, namedBindingLayout);
  const bindGroup = createGPUBindGroup(device, bindGroupLayout, gpuResources);

  const item = {
    referenceCount: 1,
    bindGroupLayout,
    bindGroup,
    bindings,
    key,
  };

  sharedBindGroups.set(key, item);

  return item;
}

function removeBindGroup(key: string) {
  const item = sharedBindGroups.get(key);
  if (item) {
    item.referenceCount--;
    if (item.referenceCount === 0) {
      const { bindings } = item;
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
      sharedBindGroups.delete(key);
    }
  }
}

let context!: GPUCanvasContext;
let device!: GPUDevice;
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
    groupId: string;
    passes: Record<
      string,
      {
        material: MaterialJSON;
        pipelineKey: string;
        bindGroups: string[];
      }
    >;
    input: TransferInput;
    vertexCountView: Uint32Array;
  }
>();

const renderPasses = new Map<
  string,
  {
    output: Array<{
      texture: GPUTexture | null;
      storeOp: GPUStoreOp;
      loadOp: GPULoadOp;
    }>;

    depth: {
      texture: GPUTexture;
      storeOp: GPUStoreOp;
      loadOp: GPULoadOp;
    };
    // viewportView: Float32Array;
    groups: Set<string>;
  }
>();

let sortedPasses: string[] = [];

const renderGroups = new Map<
  string,
  {
    objects: Set<string>;
  }
>();

const sharedBindGroups = new Map<
  string,
  {
    referenceCount: number;
    bindings: Array<{
      binding: number;
      resource: TransferResource;
    }>;
    bindGroup: GPUBindGroup;
    bindGroupLayout: GPUBindGroupLayout;
    key: string;
  }
>();

let _initialized = false;
let _pipelineInitialized = false;

self.addEventListener("message", async (event) => {
  if (event.data.type === "initCanvas" && !_initialized) {
    _initialized = true;
    const canvas = event.data.canvas as OffscreenCanvas;
    const swapchainFormat = event.data.swapchainFormat;
    const adapter = await navigator.gpu.requestAdapter();

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
      format: swapchainFormat,
    });

    self.postMessage({ type: "ready" });
  } else if (event.data.type === "initPipeline" && !_pipelineInitialized) {
    _pipelineInitialized = true;
    const pipeline = event.data.pipeline as TransferPipeline;
    sortedPasses = pipeline.sortedPasses;
    for (const passId in pipeline.passes) {
      const pass = pipeline.passes[passId];
      const { depth: _depth, output: _output } = pass;

      let depth!: {
        texture: GPUTexture;
        storeOp: GPUStoreOp;
        loadOp: GPULoadOp;
      };
      if ((_depth as TransferRenderPassRef).ref) {
        const { ref, src, loadOp, storeOp } = _depth as TransferRenderPassRef;
        const pass = renderPasses.get(ref);
        if (src === "depth") {
          depth = {
            texture: pass!.depth.texture,
            storeOp,
            loadOp,
          };
        } else if (src === "output_0") {
          depth = {
            texture: pass!.output[0]!.texture!,
            storeOp,
            loadOp,
          };
        } else if (src === "output_1") {
          depth = {
            texture: pass!.output[1]!.texture!,
            storeOp,
            loadOp,
          };
        } else if (src === "output_2") {
          depth = {
            texture: pass!.output[2]!.texture!,
            storeOp,
            loadOp,
          };
        }
      } else {
        const { width, height, format, loadOp, storeOp } =
          _depth as TransferRenderPassTexture;
        depth = {
          texture: device.createTexture({
            size: [width, height, 1],
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
          }),
          storeOp,
          loadOp,
        };
      }

      let output: Array<{
        texture: GPUTexture | null;
        storeOp: GPUStoreOp;
        loadOp: GPULoadOp;
      }> = [];

      for (const item of _output) {
        if ((item as TransferRenderPassRef).ref) {
          const { ref, src, loadOp, storeOp } = item as TransferRenderPassRef;
          const pass = renderPasses.get(ref);
          if (ref === "swapchain") {
            output.push({ texture: null, loadOp, storeOp });
          } else if (src === "depth") {
            output.push({ texture: pass!.depth.texture, loadOp, storeOp });
          } else if (src === "output_0") {
            output.push({
              texture: pass!.output[0]!.texture!,
              loadOp,
              storeOp,
            });
          } else if (src === "output_1") {
            output.push({
              texture: pass!.output[1]!.texture!,
              loadOp,
              storeOp,
            });
          } else if (src === "output_2") {
            output.push({
              texture: pass!.output[2]!.texture!,
              loadOp,
              storeOp,
            });
          }
        } else {
          const { width, height, format, loadOp, storeOp } =
            item as TransferRenderPassTexture;
          output.push({
            texture: device.createTexture({
              size: [width, height, 1],
              format,
              usage:
                GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            }),
            storeOp,
            loadOp,
          });
        }
      }

      renderPasses.set(passId, {
        depth,
        output,
        groups: new Set(pass.groups),
      });
    }

    start();
  } else if (event.data.type === "createObject") {
    const { id, groupId, passes, input, textures } = event.data
      .object as TransferObject;

    const passRet: Record<
      string,
      {
        material: MaterialJSON;
        pipelineKey: string;
        bindGroups: string[];
      }
    > = {};

    for (const passId in passes) {
      const { material, bindingGroups } = passes[passId];

      const pipelineKey = JSON.stringify(material);

      const bindGroups = bindingGroups.map((bindings) =>
        createBindGroupByBindings(device, bindings, textures)
      );

      if (!pipelineMap.has(pipelineKey)) {
        const pipeline = createRenderPipeline(
          device,
          material,
          bindGroups.map((b) => b.bindGroupLayout)
        );
        pipelineMap.set(pipelineKey, pipeline);
      }

      passRet[passId] = {
        material,
        pipelineKey,
        bindGroups: bindGroups.map((b) => b.key),
      };
    }

    for (const attrName in input.vertexBuffers) {
      const { binding, buffer } = input.vertexBuffers[attrName];
      addObjectGPUBuffer(
        device,
        attrName,
        buffer,
        GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      );
    }

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
      groupId,
      passes: passRet,
      input,
      vertexCountView: new Uint32Array(input.vertexCtrlBuffer),
    });
    renderGroups.get(groupId)!.objects.add(id);
  } else if (event.data.type === "removeObject") {
    const id = event.data.id;
    const object = renderObjectMap.get(id);
    if (object) {
      const { passes, input, groupId } = object;
      for (const passId in passes) {
        const passObject = passes[passId];
        const { bindGroups } = passObject;
        bindGroups.forEach(removeBindGroup);
      }
      for (const attrName in input.vertexBuffers) {
        removeObjectGPUBuffer(input.vertexBuffers[attrName].buffer);
      }
      input.index && removeObjectGPUBuffer(input.index.indexBuffer);
      renderObjectMap.delete(id);
      renderGroups.get(groupId)!.objects.delete(id);
    }
  } else if (event.data.type === "createRenderGroup") {
    const { id } = event.data;
    renderGroups.set(id, { objects: new Set() });
  } else if (event.data.type === "removeRenderGroup") {
    const { id } = event.data;
    renderGroups.delete(id);
  }
});

async function start() {
  let frame = 0;

  function render() {
    frame++;

    const swapchainTextureView = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();

    const checkBindGroupMap: Record<string, boolean> = {};
    const checkObjectVertex: Record<string, boolean> = {};

    sortedPasses.forEach((passId) => {
      const {
        depth,
        output,
        groups,
        // viewportView,
      } = renderPasses.get(passId)!;

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: output.map(({ texture, loadOp, storeOp }) => ({
          view: texture?.createView() ?? swapchainTextureView,
          loadOp,
          storeOp,
          clearValue: backgroundColor,
        })),
        depthStencilAttachment: {
          view: depth.texture.createView(),
          depthClearValue: 1.0, // 深度清除值
          depthStoreOp: depth.storeOp,
          depthLoadOp: depth.loadOp,
        },
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

      // passEncoder.setViewport(
      //   viewportView[0],
      //   viewportView[1],
      //   viewportView[2],
      //   viewportView[3],
      //   0,
      //   1
      // );

      groups.forEach((groupId) => {
        const objects = renderGroups.get(groupId)?.objects || [];
        objects.forEach((objectId) => {
          const object = renderObjectMap.get(objectId);
          if (object) {
            const passObject = object.passes[passId];

            const pipeline = pipelineMap.get(passObject.pipelineKey)!.pipeline;
            passEncoder.setPipeline(pipeline);

            passObject.bindGroups.forEach((key, index) => {
              const bindGroupItem = sharedBindGroups.get(key)!;

              if (!checkBindGroupMap[key]) {
                bindGroupItem.bindings.forEach(({ resource }) => {
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
                checkBindGroupMap[key] = true;
              }

              passEncoder.setBindGroup(index, bindGroupItem.bindGroup);
            });

            if (!checkObjectVertex[objectId]) {
              for (const attrName in object.input.vertexBuffers) {
                const { buffer } = object.input.vertexBuffers[attrName];
                updateGPUBuffer(device, buffer);
              }
              checkObjectVertex[objectId] = true;
            }

            for (const attrName in object.input.vertexBuffers) {
              const { buffer, binding } = object.input.vertexBuffers[attrName];
              passEncoder.setVertexBuffer(binding, getGPUBuffer(buffer)!);
            }

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

export default {} as any;
