import React, { createContext, useContext, useEffect, useMemo } from "react";
import { BindingsLayout } from "../render/binding";
import RenderContext from "./RenderContext";
import BindingLayer from "./BindingLayer";

interface Props {
  id: string;
  children: React.ReactNode;
  bindingsLayout?: BindingsLayout;
}

export const RenderGroupContext = createContext({
  id: "" as string,
});

export default function RenderGroup({
  id,
  children,
  bindingsLayout = {},
}: Props) {
  const ctx = useMemo(() => ({ id }), []);
  const renderCtx = useContext(RenderContext);

  useMemo(() => {
    renderCtx.server.createRenderGroup(id);
  }, []);

  useEffect(() => {
    return () => {
      renderCtx.server.removeRenderGroup(id);
    };
  }, []);

  return (
    <RenderGroupContext.Provider value={ctx}>
      <BindingLayer bindingsLayout={bindingsLayout}>{children}</BindingLayer>
    </RenderGroupContext.Provider>
  );
}
