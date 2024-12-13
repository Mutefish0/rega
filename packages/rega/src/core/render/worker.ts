import {
  MaterialJSON,
  TransferObject,
  TransferInput,
  TransferResource,
  TransferPipeline,
  TransferBinding,
  resourceToResourceType,
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

function createBindGroupByBindings(
  device: GPUDevice,
  bindings: TransferBinding[],
  textures: Record<string, any>
) {
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

  return {
    bindGroupLayout,
    bindGroup,
  };
}

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
    // index 3
    // check-every-frame
    // check-every-scene
    // check-every-object

    groupId: string;

    passes: Record<
      string,
      {
        material: MaterialJSON;
        pipelineKey: string;
        bindings: Array<{
          binding: number;
          resource: TransferResource;
        }>;
        bindGroup: GPUBindGroup;
      }
    >;

    input: TransferInput;

    vertexCountView: Uint32Array;
  }
>();

const renderPasses = new Map<
  string,
  {
    outputTexture: GPUTexture | null;
    //textureView: GPUTextureView;
    depthTexture: GPUTexture;
    //depthTextureView: GPUTextureView;
    // viewportView: Float32Array;
    groups: Set<string>;
    loadOp: GPULoadOp;
    storeOp: GPUStoreOp;
    depthStoreOp: GPUStoreOp;
    depthLoadOp: GPULoadOp;
  }
>();

let sortedPasses: string[] = [];

// index 2
// check-every-frame
// check-every-scene
const renderGroups = new Map<
  string,
  {
    objects: Set<string>;
  }
>();

const sharedBindGroup = {
  bindings: [] as Array<{
    binding: number;
    resource: TransferResource;
  }>,
  bindGroupLayout: null as any as GPUBindGroupLayout,
  bindGroup: null as any as GPUBindGroup,
};

// index 1
// check-every-frame
const frameBindGroup = {
  bindings: [] as Array<{
    binding: number;
    resource: TransferResource;
  }>,
  bindGroup: null as any as GPUBindGroup,
  bindGroupLayout: null as any as GPUBindGroupLayout,
};

// index 0
// check on signal
const globalBindGroup = {
  bindings: [] as Array<{
    binding: number;
    resource: TransferResource;
  }>,
  bindGroup: null as any as GPUBindGroup,
  bindGroupLayout: null as any as GPUBindGroupLayout,
};

let _initialized = false;
let _pipelineInitialized = false;

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

    globalBindGroup.bindGroupLayout = device.createBindGroupLayout({
      entries: [],
    });
    globalBindGroup.bindGroup = createGPUBindGroup(
      device,
      globalBindGroup.bindGroupLayout,
      []
    );

    frameBindGroup.bindGroupLayout = device.createBindGroupLayout({
      entries: [],
    });
    frameBindGroup.bindGroup = createGPUBindGroup(
      device,
      frameBindGroup.bindGroupLayout,
      []
    );

    self.postMessage({ type: "ready" });
  } else if (event.data.type === "initPipeline" && !_pipelineInitialized) {
    _pipelineInitialized = true;
    const pipeline = event.data.pipeline as TransferPipeline;
    sortedPasses = pipeline.sortedPasses;
    for (const passId in pipeline.passes) {
      const pass = pipeline.passes[passId];
      const {
        loadOp,
        storeOp,
        depthLoadOp,
        depthStoreOp,
        depthTexture: _depthTexture,
        outputTxture: _outputTxture,
      } = pass;

      let depthTexture: GPUTexture;
      if (_depthTexture) {
        depthTexture = renderPasses.get(_depthTexture)!.depthTexture;
      } else {
        depthTexture = device.createTexture({
          size: [canvasSize.width, canvasSize.height, 1],
          format: "depth24plus",
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }
      let outputTexture: GPUTexture | null;
      if (_outputTxture) {
        if (_outputTxture === "swapchain") {
          outputTexture = null;
        } else {
          outputTexture = renderPasses.get(_outputTxture)!.outputTexture;
        }
      } else {
        outputTexture = device.createTexture({
          size: [canvasSize.width, canvasSize.height, 1],
          format: "bgra8unorm",
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }

      renderPasses.set(passId, {
        depthTexture,
        outputTexture,
        groups: new Set(pass.renderGroups),
        loadOp,
        storeOp,
        depthStoreOp,
        depthLoadOp,
      });
    }

    const { bindGroup, bindGroupLayout } = createBindGroupByBindings(
      device,
      pipeline.bindings,
      pipeline.textures
    );
    sharedBindGroup.bindings = pipeline.bindings;
    sharedBindGroup.bindGroup = bindGroup;
    sharedBindGroup.bindGroupLayout = bindGroupLayout;
    start();
  } else if (event.data.type === "addObjectToTarget") {
    // const { targetId, objectId } = event.data;
    // const target = renderTargets.get(targetId);
    // if (target) {
    //   target.objects.add(objectId);
    // }
  } else if (event.data.type === "removeObjectFromTarget") {
    // const { targetId, objectId } = event.data;
    // const target = renderTargets.get(targetId);
    // if (target) {
    //   target.objects.delete(objectId);
    // }
  } else if (event.data.type === "createObject") {
    const { id, groupId, passes, input, textures } = event.data
      .object as TransferObject;

    const passRet: Record<
      string,
      {
        material: MaterialJSON;
        pipelineKey: string;
        bindings: Array<{
          binding: number;
          resource: TransferResource;
        }>;
        bindGroup: GPUBindGroup;
      }
    > = {};

    for (const passId in passes) {
      const { material, bindings } = passes[passId];

      const pipelineKey = JSON.stringify(material);
      const objectBindGroup = createBindGroupByBindings(
        device,
        bindings,
        textures
      );
      if (!pipelineMap.has(pipelineKey)) {
        const pipeline = createRenderPipeline(device, material, [
          objectBindGroup.bindGroupLayout,
          sharedBindGroup.bindGroupLayout,
          frameBindGroup.bindGroupLayout,
          globalBindGroup.bindGroupLayout,
        ]);
        pipelineMap.set(pipelineKey, pipeline);
      }

      passRet[passId] = {
        material,
        pipelineKey,
        bindings,
        bindGroup: objectBindGroup.bindGroup,
      };
    }

    for (const vertex of input.vertexBuffers) {
      addObjectGPUBuffer(
        device,
        vertex.name,
        vertex.buffer,
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
        const { bindings } = passObject;
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
      }

      for (const vertex of input.vertexBuffers) {
        removeObjectGPUBuffer(vertex.buffer);
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

    const textureView = context.getCurrentTexture().createView();

    const commandEncoder = device.createCommandEncoder();

    sortedPasses.forEach((passId) => {
      const {
        outputTexture,
        depthTexture,
        groups,
        loadOp,
        storeOp,
        depthStoreOp,
        depthLoadOp,
        viewportView,
      } = renderPasses.get(passId)!;

      const renderPassDescriptor: GPURenderPassDescriptor = {
        colorAttachments: [
          {
            view: outputTexture?.createView() ?? textureView,
            loadOp,
            storeOp,
            clearValue: backgroundColor,
          },
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(),
          depthClearValue: 1.0, // 深度清除值
          depthStoreOp,
          depthLoadOp,
        },
      };

      const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

      passEncoder.setBindGroup(3, globalBindGroup.bindGroup);
      passEncoder.setBindGroup(2, frameBindGroup.bindGroup);

      // passEncoder.setViewport(
      //   viewportView[0],
      //   viewportView[1],
      //   viewportView[2],
      //   viewportView[3],
      //   0,
      //   1
      // );

      // check target bindings
      sharedBindGroup.bindings.forEach(({ resource }) => {
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
      passEncoder.setBindGroup(1, sharedBindGroup.bindGroup);

      groups.forEach((groupId) => {
        const objects = renderGroups.get(groupId)?.objects || [];
        objects.forEach((objectId) => {
          const object = renderObjectMap.get(objectId);
          if (object) {
            const passObject = object.passes[passId];

            const pipeline = pipelineMap.get(passObject.pipelineKey)!.pipeline;
            passEncoder.setPipeline(pipeline);
            // check object bindings
            passObject.bindings.forEach(({ resource }) => {
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

            passEncoder.setBindGroup(0, passObject.bindGroup);

            for (const vertex of object.input.vertexBuffers) {
              const gpuBuffer = updateGPUBuffer(device, vertex.buffer);
              passEncoder.setVertexBuffer(vertex.binding, gpuBuffer);
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
