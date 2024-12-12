import React, { ReactNode, createContext, useMemo } from "react";
import { TransferResource } from "../render";
import { BindingsLayout } from "../render/binding";
import { RenderPass } from "../render/pass";
import { SlotGroup, getOrcreateSlot } from "../render/slot";
import useBindings from "../hooks/useBingdings";

export const RenderPipelineContext = createContext({
  bindingPoints: {} as Record<string, number>,
  bindings: {} as Record<string, TransferResource>,
  groupToPass: {} as Record<string, RenderPass[]>,
});

interface Props {
  children: React.ReactNode;
  renderPass: RenderPass[];
  renderGroups: Map<RenderPass, string[]>;
  bindingsLayout?: BindingsLayout;
}

export default function RenderPipeline({
  children,
  pass,
  renderGroups,
  bindingsLayout = {},
}: Props) {
  const bindings = useBindings(bindingsLayout);

  const ctx = useMemo(() => {
    const groupToPass: Record<string, RenderPass[]> = {};
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
        groupToPass[group].push(pass);
      }
    }

    for (const name in bindingsLayout) {
      bindingPoints[name] = getOrcreateSlot(slotGroup, name);
    }

    return {
      groupToPass,
      bindingPoints,
      bindings: bindings.resources,
    };
  }, [bindings]);

  return (
    <RenderPipelineContext.Provider value={ctx}>
      {children}
    </RenderPipelineContext.Provider>
  );
}
