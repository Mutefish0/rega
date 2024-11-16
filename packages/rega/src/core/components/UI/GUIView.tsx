import React, { useContext } from "react";
import RenderGroup from "../../primitives/RenderGroup";
import ThreeContext from "../../primitives/ThreeContext";
import View from "./View";

interface GUIViewProps {
  target: string;
  children: React.ReactNode;
}

export default function GUIView({ children, target }: GUIViewProps) {
  const ctx = useContext(ThreeContext);
  return (
    <RenderGroup target={target}>
      <View
        style={{
          width: ctx.size[0] / ctx.pixelRatio,
          height: ctx.size[1] / ctx.pixelRatio,
        }}
      >
        {children}
      </View>
    </RenderGroup>
  );
}
