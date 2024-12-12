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

export interface RenderPass {
  id: string;
  dependencies: Denpendency[];
  pipeline: Pipeline;
}
