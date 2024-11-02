import { createContext } from "react";
import RenderServer from "../../core/render/server";
import { TransferResource } from "../../core/render/types";

const RenderContext = createContext(
  null as any as {
    server: RenderServer;
    createRenderTargetBinding(
      targetId: string,
      name: string,
      resource: TransferResource
    ): void;
    createFrameBinding(name: string, resource: TransferResource): void;
    createGlobalBinding(name: string, resource: TransferResource): void;
  }
);

export default RenderContext;
