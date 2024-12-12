import React, { createContext, useMemo } from "react";

interface Props {
  id: string;
  children: React.ReactNode;
}

export const RenderGroupContext = createContext({
  id: "" as string,
});

export default function RenderGroup({ id, children }: Props) {
  const ctx = useMemo(() => ({ id }), []);
  return (
    <RenderGroupContext.Provider value={ctx}>
      {children}
    </RenderGroupContext.Provider>
  );
}
