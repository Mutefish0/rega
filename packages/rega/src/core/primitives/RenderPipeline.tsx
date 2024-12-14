import React, { ReactNode, useContext, createContext, useMemo } from "react";
import { TransferBinding, TransferRenderPass } from "../render";
import { BindingsLayout } from "../render/binding";
import {
  Pipeline,
  PipelineLayer,
  mergePipelines,
  PipelineConfig,
  configToTransferPass,
} from "../render/pass";
import { SlotGroup, getOrcreateSlot } from "../render/slot";
import RenderContext from "./RenderContext";
import useBindings from "../hooks/useBingdings";
import { BindingContext } from "./BindingLayer";
import ThreeContext from "./ThreeContext";

export const RenderPipelineContext = createContext({
  bindingPoints: {} as Record<string, number>,
  groupToPass: {} as Record<string, Array<{ id: string; pipeline: Pipeline }>>,
});

interface Props {
  children: React.ReactNode;
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

    const bindingPoints: Record<string, number> = {};
    let bindingsLayout: BindingsLayout = {};

    const slotGroup: SlotGroup = {
      map: {},
      maxSlot: 0,
    };

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

    for (const name in bindingsLayout) {
      bindingPoints[name] = getOrcreateSlot(slotGroup, name);
    }

    const ctx = {
      groupToPass,
      bindingPoints,
    };

    return {
      ctx,
      bindingsLayout,
    };
  }, []);

  const bindings = useBindings(bindingsLayout);

  useMemo(() => {
    const sharedBindings: TransferBinding[] = [];
    for (const name in bindings.resources) {
      sharedBindings.push({
        name,
        binding: ctx.bindingPoints[name],
        visibility: 3,
        resource: bindings.resources[name],
      });
    }

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
      textures: {},
      bindings: sharedBindings,
    });
  }, []);

  return (
    <RenderPipelineContext.Provider value={ctx}>
      <BindingContext.Provider value={bindings.resources}>
        {children}
      </BindingContext.Provider>
    </RenderPipelineContext.Provider>
  );
}
