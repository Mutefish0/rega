import React, { useContext } from "react";
import View from "./View";
import useWindowInfo from "../../hooks/useWindowInfo";
import TransformContext from "../../primitives/TransformContext";
import SceneContext from "../../primitives/SceneContext";

interface GUIViewProps {
  children: React.ReactNode;
}

export default function GUIView({ children }: GUIViewProps) {
  const ctx = useContext(TransformContext);
  const { clientWidth, clientHeight } = useWindowInfo();

  return (
    <SceneContext.Provider value="gui">
      <TransformContext.Provider value={ctx}>
        <View style={{ width: clientWidth, height: clientHeight }}>
          {children}
        </View>
      </TransformContext.Provider>
    </SceneContext.Provider>
  );
}
