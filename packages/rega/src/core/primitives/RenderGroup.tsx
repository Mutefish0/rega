import React, { useContext, createContext, useMemo } from "react";
import { uniq } from "lodash";

interface Props {
  target?: string;
  targets?: string[];
  children: React.ReactNode;
}

export const RenderGroupContext = createContext({
  targetIds: [] as string[],
});

export default function RenderGroup({ target, targets, children }: Props) {
  const parent = useContext(RenderGroupContext);

  const ctx = useMemo(() => {
    const targetIds = targets
      ? uniq(targets)
      : target
      ? [target]
      : parent.targetIds;

    return {
      targetIds,
    };
  }, [parent]);

  return (
    <RenderGroupContext.Provider value={ctx}>
      {children}
    </RenderGroupContext.Provider>
  );
}
