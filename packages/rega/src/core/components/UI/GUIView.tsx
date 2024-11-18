import React, { useContext } from "react";
import ThreeContext from "../../primitives/ThreeContext";
import Absolute from "../../primitives/Absolute";
import { emptyMatrix4 } from "pure3";
import View from "./View";

interface GUIViewProps {
  children: React.ReactNode;
}

export default function GUIView({ children }: GUIViewProps) {
  const ctx = useContext(ThreeContext);
  return (
    <Absolute matrix={emptyMatrix4}>
      <View
        style={{
          width: ctx.size[0] / ctx.pixelRatio,
          height: ctx.size[1] / ctx.pixelRatio,
        }}
      >
        {children}
      </View>
    </Absolute>
  );
}
