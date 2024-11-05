import React, { useContext } from "react";
import GUICamera from "./GUICamera";
import ThreeContext from "../../primitives/ThreeContext";
import View from "./View";

interface GUIViewProps {
  children: React.ReactNode;
}

export default function GUIView({ children }: GUIViewProps) {
  const ctx = useContext(ThreeContext);
  return (
    <>
      <GUICamera />
      <View
        style={{
          width: ctx.size[0] / ctx.pixelRatio,
          height: ctx.size[1] / ctx.pixelRatio,
        }}
      >
        {children}
      </View>
    </>
  );
}
