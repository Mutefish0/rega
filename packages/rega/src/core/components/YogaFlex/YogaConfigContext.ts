import { createContext } from "react";
import Yoga, { Config } from "yoga-layout";

const defaultConfig = Yoga.Config.create();
defaultConfig.setPointScaleFactor(0);

interface YogaConfigContext {
  config: Config;
}

export default createContext<YogaConfigContext>({ config: defaultConfig });
