import { MaterialJSON } from "./types";
import { createBindingsLayout } from "./utils";

export default function createRenderPipeline(
  device: GPUDevice,
  materialJSON: MaterialJSON
) {
  const bindGroupLayoutMap = new Map<string, GPUBindGroupLayout>();

  const { fragmentShader, vertexShader, blend, bindings, attributes, format } =
    materialJSON;

  const shaderModuleVertex = device.createShaderModule({
    code: vertexShader,
  });

  const shaderModuleFragment = device.createShaderModule({
    code: fragmentShader,
  });

  const bindGroupLayouts = [];

  // bindings
  for (const group of bindings) {
    const layout = createBindingsLayout(device, group);
    bindGroupLayouts.push(layout);
    bindGroupLayoutMap.set(group.name, layout);
  }

  const gpuVeterxBufferLayouts: Array<GPUVertexBufferLayout> = [];

  let location = 0;

  for (const attribute of attributes) {
    let arrayStride = 4;
    let format: GPUVertexFormat = "float32";
    if (attribute.type === "vec3") {
      arrayStride = 3 * 4;
      format = "float32x3";
    } else if (attribute.type === "vec2") {
      arrayStride = 2 * 4;
      format = "float32x2";
    }

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
          format,
          blend,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  return { pipeline, bindGroupLayoutMap };
}
