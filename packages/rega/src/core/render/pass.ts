import { Node, NodeTexture, uniform, texture, WGSLValueType } from "pure3";
import { UniformType } from "../render";
import { TransferRenderPass } from "../render/types";
import { BindingsLayout } from "./binding";
export interface PipelineIn {
  normal: Node<"vec3">;
  position: Node<"vec4">;
  color: Node<"vec3">;
  ambientColor: Node<"vec3">;
  lightDir: Node<"vec3">;
  lightColor: Node<"vec3">;
  roughness: Node<"float">;
  metallic: Node<"float">;
}

export type PipelineOut = Partial<PipelineIn>;

export type Pipeline = (pipelineIn: PipelineIn) => PipelineOut;

export function mergePipelines(pipelines: Pipeline[]): Pipeline {
  return function (pipelineIn: PipelineIn) {
    return pipelines.reduce((acc, pipeline) => {
      return { ...acc, ...pipeline(acc) };
    }, pipelineIn);
  };
}

export interface PipelineConfigData {
  depth:
    | {
        width?: number;
        height?: number;
        format?: GPUTextureFormat;
        loadOp?: GPULoadOp;
        storeOp?: GPUStoreOp;
      }
    | {
        ref: string;
        src: "depth" | "output_0" | "output_1" | "output_2";
        loadOp?: GPULoadOp;
        storeOp?: GPUStoreOp;
      };

  output: Array<
    | {
        width?: number;
        height?: number;
        format?: GPUTextureFormat;
        loadOp?: GPULoadOp;
        storeOp?: GPUStoreOp;
      }
    | {
        ref: string;
        src: "depth" | "output_0" | "output_1" | "output_2";
        loadOp?: GPULoadOp;
        storeOp?: GPUStoreOp;
      }
    | {
        ref: "swapchain";
        loadOp?: GPULoadOp;
        storeOp?: GPUStoreOp;
      }
  >;

  layers: (PipelineLayer | Pipeline)[];

  groups: string[];
}

export interface PipelineLayer {
  layout: BindingsLayout;
  pipeline: Pipeline;
}

export type PipelineConfig = Record<string, PipelineConfigData>;

export function configToTransferPass(
  passId: string,
  data: PipelineConfigData,
  defaultData: {
    width: number;
    height: number;
    loadOp: GPULoadOp;
    storeOp: GPUStoreOp;
    format: GPUTextureFormat;
    depthFormat: GPUTextureFormat;
  }
): TransferRenderPass {
  const { width, height, loadOp, storeOp, format, depthFormat } = defaultData;

  return {
    id: passId,
    // @ts-ignore
    output: data.output.map((o) => {
      // @ts-ignore
      if (o.ref) {
        return {
          loadOp,
          storeOp,
          ...o,
        };
      } else {
        return {
          width,
          height,
          loadOp,
          storeOp,
          format,
          ...o,
        };
      }
    }),
    // @ts-ignore
    depth: data.depth.ref
      ? { loadOp, storeOp, ...data.depth }
      : {
          width,
          height,
          loadOp,
          storeOp,
          format: depthFormat,
          ...data.depth,
        },

    groups: data.groups,
  };
}

export function createPipelineLayer<T extends BindingsLayout>(
  layout: T,
  pipelineConstruct: (uniforms: {
    [K in keyof T]: T[K] extends WGSLValueType ? Node<T[K]> : never;
  }) => Pipeline
) {
  const uniforms = {} as {
    [K in keyof T]: T[K] extends WGSLValueType ? Node<T[K]> : never;
  };

  for (const name in layout) {
    const type = layout[name] as UniformType;
    if (type === "texture_2d") {
      uniforms[name] = texture(name) as any;
    } else if (type === "texture_2d<sint>" || type === "texture_2d<uint>") {
      throw new Error("Not implemented");
    } else {
      uniforms[name] = uniform(type as WGSLValueType, name) as any;
    }
  }

  const pipeline = pipelineConstruct(uniforms);

  return {
    pipeline,
    layout,
  };
}
