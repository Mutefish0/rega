import React, { useContext, createContext, useMemo } from "react";
import { uniq } from "lodash";

interface Props {
  targetId: string;
  children: React.ReactNode;
}

export const RenderGroupContext = createContext({
  targetIds: [] as string[],
});

export default function RenderGroup({ targetId, children }: Props) {
  const parent = useContext(RenderGroupContext);
  const ctx = useMemo(() => {
    return {
      targetIds: uniq([...parent.targetIds, targetId]),
    };
  }, [parent]);

  return (
    <RenderGroupContext.Provider value={ctx}>
      {children}
    </RenderGroupContext.Provider>
  );
}
