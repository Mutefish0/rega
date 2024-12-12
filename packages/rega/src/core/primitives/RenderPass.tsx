import { ReactNode, createContext, useMemo } from "react";
import { TransferResource } from "../render";
import { BindingsLayout } from "../render/binding";

import {
  Fn,
  Node,
  modelWorldMatrix,
  cameraProjectionMatrix,
  cameraViewMatrix,
  max,
  min,
  dot,
  div,
  add,
  normalize,
  vec4,
  PI,
} from "pure3";
import useBindings from "../hooks/useBingdings";

const cameraPass: Pipeline = Fn(({ position }: PipelineIn) => {
  const basicVertexNode = cameraProjectionMatrix
    .mul(cameraViewMatrix)
    .mul(modelWorldMatrix)
    .mul(position);
  return { position: basicVertexNode };
});

const lightLambertPass: Pipeline = Fn(
  ({ color, normal, lightDir, lightColor, ambientColor }: PipelineIn) => {
    const N = modelWorldMatrix.mul(vec4(normal, 1)).xyz;
    const L = normalize(lightDir);
    const NdotL = min(dot(N, L), 1.0);
    const cNdotL = max(NdotL, 0.0); // clamped NdotL
    const diffuse_brdf_NL = cNdotL.mul(div(1.0, PI));

    return {
      color: add(ambientColor, color.mul(diffuse_brdf_NL).mul(lightColor)),
    };
  }
);

export { cameraPass, lightLambertPass };

interface PipelineIn {
  normal: Node<"vec3">;
  position: Node<"vec4">;
  color: Node<"vec3">;
  ambientColor: Node<"vec3">;
  lightDir: Node<"vec3">;
  lightColor: Node<"vec3">;
  roughness: Node<"float">;
  metallic: Node<"float">;
}

type PipelineOut = Partial<PipelineIn>;

type Pipeline = (pipelineId: PipelineIn) => PipelineOut;

const RenderPassContext = createContext({
  pipeline: null as any as Pipeline,
  bindings: {} as Record<string, TransferResource>,
});

interface Props {
  children: ReactNode;
  bindingsLayout?: BindingsLayout;
  pipeline: Pipeline[];
}

function mergePipelines(pipelines: Pipeline[]): Pipeline {
  return function (pipelineIn: PipelineIn) {
    return pipelines.reduce((acc, pipeline) => {
      return { ...acc, ...pipeline(acc) };
    }, pipelineIn);
  };
}

export default function RenderPass({
  children,
  bindingsLayout = {},
  pipeline,
}: Props) {
  const bindings = useBindings(bindingsLayout);

  const ctx = useMemo(() => {
    return {
      pipeline: mergePipelines(pipeline),
      bindings: bindings.resources,
    };
  }, [pipeline, bindings]);

  return (
    <RenderPassContext.Provider value={ctx}>
      {children}
    </RenderPassContext.Provider>
  );
}

interface Denpendency {
  pass: PassNode;
  type: "depth" | "output";
}
interface PassNode {
  dependencies: Denpendency[];
  pipeline: Pipeline;
  renderGroups: string[];
}

// export default function App() {
//
//   return (
//     <RenderPipeline>
//       <RenderGroup id="GUI"></RenderGroup>
//       <RenderGroup id="GAME"></RenderGroup>
//     </RenderPipeline>
//   );
// }
