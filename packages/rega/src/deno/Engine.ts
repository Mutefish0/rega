import "./polyfill";
import { ReactElement } from "react";
import CoreEngine, { EngineConfig } from "../core/components/Engine/index1";
import Renderer from "./Renderer";

function Engine(app: ReactElement, config: EngineConfig) {
  return CoreEngine(app, config, Renderer);
}

export default Engine;
