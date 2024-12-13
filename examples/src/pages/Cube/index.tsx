import React from "react";
import { Canvas } from "rega/web";
import {
  RenderPipeline,
  RenderGroup,
  Camera,
  Relative,
  Box3D,
  DirectionalLight,
  BasicLightModel,
  Box2D,
  RenderPass,
} from "rega";

export default function Page() {
  return <Canvas width={512} height={512} App={App} />;
}

const pass: RenderPass = {
  id: "base",
  dependencies: [],
  pipelines: [Camera.pipeline, DirectionalLight.pipeline, BasicLightModel],
  loadOp: "clear",
  storeOp: "store",
  depthLoadOp: "clear",
  depthStoreOp: "store",
};

const renderGroups = new Map();
renderGroups.set(pass, ["main"]);

function App() {
  return (
    <RenderPipeline
      renderPass={[pass]}
      renderGroups={renderGroups}
      bindingsLayout={{
        ...Camera.bindingsLayout,
        ...DirectionalLight.bindingsLayout,
      }}
    >
      <RenderGroup id="main">
        <Relative rotation={{ y: Math.PI }}>
          <DirectionalLight direction={[-1, 0, 0]} intensity={0.5} />
        </Relative>
        <Relative translation={{ z: 10 }}>
          <Camera type="perspective" />
        </Relative>
        <Relative rotation={{ x: Math.PI / 3, y: Math.PI / 3, z: 0 }}>
          <Box3D size={[2, 2, 2]} color="red" />
        </Relative>
        <Box2D size={[1, 1]} color="forestgreen" />
      </RenderGroup>
    </RenderPipeline>
  );
}
