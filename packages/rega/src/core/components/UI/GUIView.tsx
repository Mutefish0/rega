import React, { useContext, useEffect, useMemo } from "react";
import Yoga from "yoga-layout";
import ThreeContext from "../../primitives/ThreeContext";
import YogaConfigContext from "../YogaFlex/YogaConfigContext";
import Absolute from "../../primitives/Absolute";
import { emptyMatrix4 } from "pure3";
import View from "./View";

interface GUIViewProps {
  children: React.ReactNode;
}

export default function GUIView({ children }: GUIViewProps) {
  const ctx = useContext(ThreeContext);

  const configCtx = useMemo(() => {
    const config = Yoga.Config.create();
    config.setPointScaleFactor(ctx.pixelRatio);
    return { config };
  }, [ctx.pixelRatio]);

  useEffect(() => {
    return () => {
      configCtx.config.free();
    };
  }, [configCtx.config]);

  return (
    <Absolute matrix={emptyMatrix4}>
      <YogaConfigContext.Provider value={configCtx}>
        <View
          style={{
            width: ctx.size[0] / ctx.pixelRatio,
            height: ctx.size[1] / ctx.pixelRatio,
          }}
        >
          {children}
        </View>
      </YogaConfigContext.Provider>
    </Absolute>
  );
}
