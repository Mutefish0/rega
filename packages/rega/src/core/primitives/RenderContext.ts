import { createContext } from "react";
import RenderServer from "../../core/render/server";

interface ContextValue {
  server: RenderServer;
}

const RenderContext = createContext(null as any as ContextValue);

export function createRenderContext(server: RenderServer): ContextValue {
  return {
    server,
  };
}

export default RenderContext;
