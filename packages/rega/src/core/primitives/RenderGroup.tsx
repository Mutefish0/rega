import React, { useContext, createContext, useMemo } from "react";
import { uniq } from "lodash";
import { mainTarget } from "./RenderTarget";

interface Props {
  targetId?: string;
  children: React.ReactNode;
}

export const RenderGroupContext = createContext({
  targetId: mainTarget,
  targetIds: [] as string[],
});

export default function RenderGroup({ targetId: _targetId, children }: Props) {
  const parent = useContext(RenderGroupContext);
  const ctx = useMemo(() => {
    const targetId = _targetId ?? parent.targetId;
    return {
      targetId,
      targetIds: uniq([...parent.targetIds, targetId]),
    };
  }, [parent]);

  return (
    <RenderGroupContext.Provider value={ctx}>
      {children}
    </RenderGroupContext.Provider>
  );
}
