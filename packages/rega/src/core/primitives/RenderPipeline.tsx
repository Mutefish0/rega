import React, { ReactNode, useContext, createContext, useMemo } from "react";
import { TransferBinding, TransferRenderPass } from "../render";
import { BindingsLayout } from "../render/binding";
import { RenderPass, Pipeline, mergePipelines } from "../render/pass";
import { SlotGroup, getOrcreateSlot } from "../render/slot";
import RenderContext from "./RenderContext";
import useBindings from "../hooks/useBingdings";
import { BindingContext } from "./BindingLayer";

export const RenderPipelineContext = createContext({
  bindingPoints: {} as Record<string, number>,
  groupToPass: {} as Record<string, Array<{ id: string; pipeline: Pipeline }>>,
});

interface Props {
  children: React.ReactNode;
  renderPass: RenderPass[];
  renderGroups: Map<RenderPass, string[]>;
  bindingsLayout?: BindingsLayout;
}

export default function RenderPipeline({
  children,
  renderPass,
  renderGroups,
  bindingsLayout = {},
}: Props) {
  const renderCtx = useContext(RenderContext);
  const bindings = useBindings(bindingsLayout);

  const ctx = useMemo(() => {
    const groupToPass: Record<
      string,
      Array<{ id: string; pipeline: Pipeline }>
    > = {};
    const bindingPoints: Record<string, number> = {};

    const slotGroup: SlotGroup = {
      map: {},
      maxSlot: 0,
    };

    for (const [pass, groups] of renderGroups.entries()) {
      for (const group of groups) {
        if (!groupToPass[group]) {
          groupToPass[group] = [];
        }
        groupToPass[group].push({
          id: pass.id,
          pipeline: mergePipelines(pass.pipelines),
        });
      }
    }

    for (const name in bindingsLayout) {
      bindingPoints[name] = getOrcreateSlot(slotGroup, name);
    }

    return {
      groupToPass,
      bindingPoints,
    };
  }, [bindings]);

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

    for (const pass of renderPass) {
      transferRenderPasses[pass.id] = {
        id: pass.id,
        depthLoadOp: pass.depthLoadOp,
        depthStoreOp: pass.depthStoreOp,
        loadOp: pass.loadOp,
        storeOp: pass.storeOp,

        depthTexture: "",
        outputTxture: "swapchain",

        renderGroups: renderGroups.get(pass) || [],
      };
      sortedPasses.push(pass.id);
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
