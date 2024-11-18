import { ReactElement } from "react";
import CoreEngine, { EngineConfig } from "../core/components/Engine/index1";

function Engine(app: ReactElement, config: EngineConfig) {
  return CoreEngine(app, config);
}

export default Engine;
