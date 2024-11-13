import { MaterialJSON } from "./types";
import createBindGroupLayout from "./createBindGroupLayout";

export default function createRenderPipeline(
  device: GPUDevice,
  materialJSON: MaterialJSON
) {
  const {
    fragmentShader,
    vertexShader,
    blend,
    attributes,
    format,
    frontFace,
    cullMode,
    topology,
  } = materialJSON;

  const shaderModuleVertex = device.createShaderModule({
    code: vertexShader,
  });

  const shaderModuleFragment = device.createShaderModule({
    code: fragmentShader,
  });

  const bindGroupLayouts = materialJSON.bindGroups.map((layout) =>
    createBindGroupLayout(device, layout)
  );

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
      topology,
      cullMode,
      frontFace,
    },

    depthStencil: {
      format: "depth24plus", // 与深度纹理的格式一致
      depthWriteEnabled: true,
      depthCompare: "less-equal",
    },
  });

  return { pipeline, bindGroupLayouts };
}
