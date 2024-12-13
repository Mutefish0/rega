import { createContext, useContext, useMemo } from "react";
import { TransferResource } from "../render";
import { BindingsLayout } from "../render/binding";
import useBindings from "../hooks/useBingdings";

export const BindingContext = createContext(
  {} as Record<string, TransferResource>
);

interface Props {
  children: React.ReactNode;
  bindingsLayout: BindingsLayout;
}

export default function BindingLayer({ children, bindingsLayout }: Props) {
  const parentCtx = useContext(BindingContext);

  const bindings = useBindings(bindingsLayout);

  const ctx = useMemo(
    () => ({
      ...parentCtx,
      ...bindings.resources,
    }),
    [parentCtx]
  );

  return (
    <BindingContext.Provider value={ctx}>{children}</BindingContext.Provider>
  );
}
