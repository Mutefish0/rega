import { Node } from "pure3";

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

export type Pipeline = (pipelineId: PipelineIn) => PipelineOut;

interface Denpendency {
  pass: RenderPass;
  type: "depth" | "output";
}

// texture: GPUTexture;
// textureView: GPUTextureView;
// depthTexture: GPUTexture;
// depthTextureView: GPUTextureView;
// viewportView: Float32Array;
// groups: Set<string>;
// loadOp: GPULoadOp;
// storeOp: GPUStoreOp;
// depthStoreOp: GPUStoreOp;
// depthLoadOp: GPULoadOp;

export interface RenderPass {
  id: string;
  dependencies: Denpendency[];
  pipelines: Pipeline[];

  loadOp: GPULoadOp;
  storeOp: GPUStoreOp;
  depthStoreOp: GPUStoreOp;
  depthLoadOp: GPULoadOp;
}

export function mergePipelines(pipelines: Pipeline[]): Pipeline {
  return function (pipelineIn: PipelineIn) {
    return pipelines.reduce((acc, pipeline) => {
      return { ...acc, ...pipeline(acc) };
    }, pipelineIn);
  };
}
