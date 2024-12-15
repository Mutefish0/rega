import React from "react";
import { Canvas } from "rega/web";
import {
  RenderPipeline,
  RenderGroup,
  EffectScope,
  Camera,
  Relative,
  Box3D,
  AmbientLight,
  DirectionalLight,
  BasicLightModel,
} from "rega";

export default function Page() {
  return <Canvas width={512} height={512} App={App} />;
}

function App() {
  return (
    <RenderPipeline
      config={{
        base: {
          depth: {},
          output: [{ ref: "swapchain" }],
          layers: [
            Camera.layer,
            AmbientLight.layer,
            DirectionalLight.layer,
            BasicLightModel,
          ],
          groups: ["main"],
        },
      }}
    >
      <AmbientLight intensity={0.2} />

      <Relative>
        <DirectionalLight direction={[0, 0, -1]} intensity={1} />
      </Relative>

      <Relative translation={{ z: 10 }}>
        <Camera type="perspective" />
      </Relative>

      <RenderGroup id="main">
        <Relative
          translation={{ y: -1 }}
          rotation={{ x: Math.PI / 3, y: Math.PI / 3, z: 0 }}
        >
          <Box3D size={[2, 2, 2]} color="skyblue" />
        </Relative>

        <Relative
          translation={{ y: 1 }}
          rotation={{ x: Math.PI / 3, y: Math.PI / 3, z: 0 }}
        >
          <Box3D size={[2, 2, 2]} color="skyblue" />
        </Relative>
      </RenderGroup>
    </RenderPipeline>
  );
}
