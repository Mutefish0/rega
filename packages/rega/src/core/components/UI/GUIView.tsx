import React, { useContext, useEffect, useMemo } from "react";
import Yoga from "yoga-layout";
import ThreeContext from "../../primitives/ThreeContext";
import Absolute from "../../primitives/Absolute";
import { emptyMatrix4 } from "pure3";
import { ViewStyle } from "./View";

interface GUIViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// @TODO use portal
export default function GUIView({ children, style }: GUIViewProps) {
  const ctx = useContext(ThreeContext);

  const config = useMemo(() => {
    const config = Yoga.Config.create();
    config.setPointScaleFactor(Math.floor(ctx.pixelRatio));
    return config;
  }, [ctx.pixelRatio]);

  useEffect(() => {
    return () => {
      config.free();
    };
  }, [config]);

  return (
    <Absolute matrix={emptyMatrix4}>
      <yoga
        style={{
          ...style,
          width: ctx.size[0] / ctx.pixelRatio,
          height: ctx.size[1] / ctx.pixelRatio,
          position: "absolute",
          left: 0,
          top: 0,
        }}
        config={config}
      >
        {children}
      </yoga>
    </Absolute>
  );
}
