import React from "react";
import { Canvas } from "rega/web";
import {
  RenderTarget,
  RenderGroup,
  Camera,
  Relative,
  Box3D,
  useDirectionalLight,
} from "rega";

export default function Page() {
  return <Canvas width={512} height={512} App={App} />;
}

function App() {
  const light = useDirectionalLight({ direction: [1, 0, 0], intensity: 0.8 });
  return (
    <>
      <RenderTarget
        id="main"
        bindings={light}
        camera={
          <Relative translation={{ z: 10 }}>
            <Camera type="perspective" />
          </Relative>
        }
      />
      <RenderGroup target="main">
        <Relative rotation={{ x: Math.PI / 3, y: Math.PI / 3, z: 0 }}>
          <Box3D size={[2, 2, 2]} color="green" />
        </Relative>
      </RenderGroup>
    </>
  );
}
