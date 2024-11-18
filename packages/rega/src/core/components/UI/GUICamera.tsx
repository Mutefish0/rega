import { useContext } from "react";
import Camera from "../../primitives/Camera";
import Relative from "../../primitives/Relative";
import ThreeContext from "../../primitives/ThreeContext";

export default function GUICamera() {
  const ctx = useContext(ThreeContext);
  return (
    <Relative translation={{ z: 1000 }}>
      <Camera
        anchor="top-left"
        type="orthographic"
        width={ctx.size[0] / ctx.pixelRatio}
        height={ctx.size[1] / ctx.pixelRatio}
      />
    </Relative>
  );
}
