import React, { createContext, useContext, useEffect, useMemo } from "react";
import RenderContext from "./RenderContext";

interface Props {
  id: string;
  children: React.ReactNode;
}

export const RenderGroupContext = createContext({
  id: "" as string,
});

export default function RenderGroup({ id, children }: Props) {
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
      {children}
    </RenderGroupContext.Provider>
  );
}
