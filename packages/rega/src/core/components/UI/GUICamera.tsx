import { useContext } from "react";
import Camera from "../../primitives/Camera";
import Relative from "../../primitives/Relative";
import ThreeContext from "../../primitives/ThreeContext";

export default function GUICamera({ target }: { target: string }) {
  const ctx = useContext(ThreeContext);
  return (
    <Relative translation={{ z: 1000 }}>
      <Camera
        anchor="top-left"
        target={target}
        type="orthographic"
        width={ctx.size[0] / ctx.pixelRatio}
        height={ctx.size[1] / ctx.pixelRatio}
      />
    </Relative>
  );
}
