import React, { useEffect, useState } from "react";
import { Canvas } from "rega/web";
import {
  RenderPipeline,
  RenderGroup,
  EffectScope,
  Camera,
  Relative,
  Box3D,
  GLTF,
  AmbientLight,
  DirectionalLight,
  BasicLightModel,
  Animation,
  ModelManager,
} from "rega";

function* anim() {
  // 33 fps
  const dt = 16;
  let time = 0;
  const w = (2 * Math.PI) / 3000;
  while (true) {
    const offsetY = Math.sin(w * time);
    const rotateY = w * time;
    yield [{ offsetY, rotateY }, dt] as const;
    time += dt;
  }
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ModelManager.loadModel("/models/helmet/DamagedHelmet.gltf").then(() =>
      setIsLoading(false)
    );
  }, []);

  if (isLoading) {
    return <h1>loading...</h1>;
  }

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
        <Animation
          genFunc={anim}
          renderItem={({ offsetY, rotateY }) => (
            <Relative
              //translation={{ y: offsetY * 3 }}
              rotation={{ x: 0, y: rotateY, z: 0 }}
            >
              <RenderGroup id="main">
                <GLTF modelId="/models/helmet/DamagedHelmet.gltf" />
              </RenderGroup>
            </Relative>
          )}
        />
      </RenderGroup>
    </RenderPipeline>
  );
}
