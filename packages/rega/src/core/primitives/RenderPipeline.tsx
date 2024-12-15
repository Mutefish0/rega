import React, { ReactNode, useContext, createContext, useMemo } from "react";
import { TransferRenderPass } from "../render";
import { BindingsLayout } from "../render/binding";
import {
  Pipeline,
  PipelineLayer,
  mergePipelines,
  PipelineConfig,
  configToTransferPass,
} from "../render/pass";
import RenderContext from "./RenderContext";
import BindingLayer from "./BindingLayer";
import ThreeContext from "./ThreeContext";

export const RenderPipelineContext = createContext({
  groupToPass: {} as Record<string, Array<{ id: string; pipeline: Pipeline }>>,
});

interface Props {
  children: ReactNode;
  config: PipelineConfig;
}

export default function RenderPipeline({ children, config }: Props) {
  const threeCtx = useContext(ThreeContext);
  const renderCtx = useContext(RenderContext);

  const { ctx, bindingsLayout } = useMemo(() => {
    const groupToPass: Record<
      string,
      Array<{ id: string; pipeline: Pipeline }>
    > = {};

    let bindingsLayout: BindingsLayout = {};

    for (const passId in config) {
      const pass = config[passId];
      const layers = pass.layers;
      const pipelines: Pipeline[] = [];

      for (const layer of layers) {
        if ((layer as PipelineLayer).pipeline) {
          pipelines.push((layer as PipelineLayer).pipeline);
          bindingsLayout = {
            ...bindingsLayout,
            ...(layer as PipelineLayer).layout,
          };
        } else {
          pipelines.push(layer as Pipeline);
        }
      }

      const mergedPipeline = mergePipelines(pipelines);

      for (const group of pass.groups) {
        if (!groupToPass[group]) {
          groupToPass[group] = [];
        }
        groupToPass[group].push({
          id: passId,
          pipeline: mergedPipeline,
        });
      }
    }

    const ctx = {
      groupToPass,
    };

    return {
      ctx,
      bindingsLayout,
    };
  }, []);

  useMemo(() => {
    const transferRenderPasses: Record<string, TransferRenderPass> = {};
    const sortedPasses: string[] = [];

    const defaultConfig = {
      width: threeCtx.size[0],
      height: threeCtx.size[1],
      loadOp: "clear",
      storeOp: "store",
      format: threeCtx.swapchainFormat,
      depthFormat: "depth24plus",
    } as const;

    for (const passId in config) {
      const pass = config[passId];
      transferRenderPasses[passId] = configToTransferPass(
        passId,
        pass,
        defaultConfig
      );
      sortedPasses.push(passId);
    }

    renderCtx.server.initPipeline({
      sortedPasses,
      passes: transferRenderPasses,
    });
  }, []);

  return (
    <RenderPipelineContext.Provider value={ctx}>
      <BindingLayer bindingsLayout={bindingsLayout}>{children}</BindingLayer>
    </RenderPipelineContext.Provider>
  );
}
