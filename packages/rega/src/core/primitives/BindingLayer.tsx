import { createContext, useContext, useMemo } from "react";
import { TransferResource } from "../render";
import { BindingsLayout } from "../render/binding";
import useBindings from "../hooks/useBingdings";
import { SlotGroup, getOrcreateSlot } from "../render/slot";

export const BindingContext = createContext({
  layer: -1 as number,

  resources: {} as Record<string, TransferResource>,
  bindingPoints: {} as Record<string, number>,
  bindingLayers: {} as Record<string, number>,
});

interface Props {
  children: React.ReactNode;
  bindingsLayout: BindingsLayout;
}

const slotGroup: SlotGroup = {
  map: {},
  maxSlot: 0,
};

export default function BindingLayer({ children, bindingsLayout }: Props) {
  const parentCtx = useContext(BindingContext);

  const bindings = useBindings(bindingsLayout);

  const ctx = useMemo(() => {
    const resources = { ...parentCtx.resources, ...bindings.resources };
    const bindingPoints = { ...parentCtx.bindingPoints };
    const bindingLayers = {} as Record<string, number>;

    for (const name in bindings.resources) {
      bindingPoints[name] =
        bindingPoints[name] ?? getOrcreateSlot(slotGroup, name);
      bindingLayers[name] = parentCtx.layer + 1;
    }

    return {
      layer: parentCtx.layer + 1,
      resources,
      bindingPoints,
      bindingLayers,
    };
  }, [parentCtx]);

  return (
    <BindingContext.Provider value={ctx}>{children}</BindingContext.Provider>
  );
}
