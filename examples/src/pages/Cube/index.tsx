import React, { useEffect, useRef } from "react";
import { Canvas } from "rega/web";
import {
  RenderTarget,
  RenderGroup,
  Camera,
  Relative,
  Box2D,
  Box3D,
  useDirectionalLight,
} from "rega";

export default function App() {
  const light = useDirectionalLight({ direction: [0, 0, 1], intensity: 1 });

  return (
    <Canvas width={512} height={512}>
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
        <Relative rotation={{ x: 0, y: Math.PI / 8, z: 0 }}>
          <Box3D size={[2, 2, 2]} color="green" />
        </Relative>
        {/* <Box2D size={[5, 5]} color="green" /> */}
      </RenderGroup>
    </Canvas>
  );
}
