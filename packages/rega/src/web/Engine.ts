import { ReactNode } from "react";
import CoreEngine, { EngineConfig } from "../core/components/Engine";

function Engine(app: ReactNode, config: EngineConfig) {
  return CoreEngine(app, config);
}

export default Engine;
