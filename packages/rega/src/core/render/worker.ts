import { MaterialJSON, TransferBinding } from "./types";

import {
  createBindingsLayout,
  createBindGroup,
  createAttributeBuffer,
} from "./utils";

let context!: GPUCanvasContext;
let device!: GPUDevice;

const swapChainFormat = "bgra8unorm";

let _resolveInitCanvas: () => void;
const _initCanvasPromise = new Promise<void>((resolve) => {
  _resolveInitCanvas = resolve;
});

self.addEventListener("message", async (event) => {
  if (event.data.type === "initCanvas") {
    const canvas = event.data.canvas;
    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter!.requestDevice();

    context = canvas.getContext("webgpu")!;
    // 配置画布格式
    context.configure({
      device: device,
      format: swapChainFormat,
    });
    _resolveInitCanvas();
  } else if (event.data.type === "addObject") {
    await _initCanvasPromise;
    setupMaterial(event.data.object.material, event.data.object.bindings);
  }
});

async function setupMaterial(
  materialJSON: MaterialJSON,
  tbindings: TransferBinding[]
) {
  const { fragmentShader, vertexShader } = materialJSON;

  const attributes = materialJSON.attributes as Array<{
    name: string;
    type: "vec3" | "vec2";
  }>;

  const bindings = materialJSON.bindings;

  const blend = materialJSON.blend;

  const shaderModuleVertex = device.createShaderModule({
    code: vertexShader,
  });

  const shaderModuleFragment = device.createShaderModule({
    code: fragmentShader,
  });

  const bindGroupLayouts = [];

  const bindGroupList: Array<{
    index: number;
    bindGroup: GPUBindGroup;
    group: any;
  }> = [];

  // bindings
  for (const group of bindings) {
    const layout = createBindingsLayout(device, group);
    const bindGroup = createBindGroup(device, layout, group);
    bindGroupLayouts.push(layout);
    bindGroupList.push({ index: group.index, bindGroup, group });
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

    arrayBuffer.set([0.0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]);

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
          blend,
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
      for (const binding of bindGroupItem.group.bindings) {
        binding.update();
        const gpuBuffer = getGPUBuffer(binding.gpuBufferId)!;
        device.queue.writeBuffer(gpuBuffer, 0, binding.buffer, 0);
      }
      passEncoder.setBindGroup(bindGroupItem.index, bindGroupItem.bindGroup);
    }

    passEncoder.draw(3); // 绘制 3 个顶点组成的三角形
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(render);
  }

  render();
}
