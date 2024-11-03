import { createContext } from "react";
import RenderServer from "../../core/render/server";
import { TransferResource, ResourceType } from "../../core/render/types";

interface ContextValue {
  server: RenderServer;
  renderTargets: Map<
    string,
    {
      bindings: Record<string, TransferResource>;
    }
  >;
  // merged bind group layout
  renderTargetBindGroupLayout: Record<string, ResourceType>;
}

const RenderContext = createContext(null as any as ContextValue);

export function createRenderContext(server: RenderServer): ContextValue {
  return {
    server,
    renderTargets: new Map<
      string,
      {
        bindings: Record<string, TransferResource>;
      }
    >(),
    renderTargetBindGroupLayout: {},
  };
}

export default RenderContext;
