import React, { useEffect, useState } from "react";
import { Canvas } from "rega/web";
import {
  RenderPipeline,
  RenderGroup,
  EffectScope,
  Camera,
  Relative,
  GLTFObject,
  AmbientLight,
  DirectionalLight,
  BasicLightModel,
  Animation,
  ModelManager,
  Sprite2D,
  TextureManager,
} from "rega";

function* anim() {
  // 33 fps
  const dt = 16;
  let time = 0;
  const w = (2 * Math.PI) / 6000;
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
    Promise.all([
      TextureManager.add("/models/helmet/Default_albedo.jpg"),
      ModelManager.loadModel("/models/helmet/DamagedHelmet.gltf"),
    ]).then(() => {
      setIsLoading(false);
    });
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
      <AmbientLight intensity={0.8} />

      <Relative>
        <DirectionalLight direction={[0, 0, -1]} intensity={1} />
      </Relative>

      <Relative translation={{ z: 5 }}>
        <Camera type="perspective" />
      </Relative>

      <RenderGroup id="main">
        <Animation
          genFunc={anim}
          renderItem={({ rotateY }) => (
            <Relative rotation={{ x: Math.PI / 5, y: rotateY, z: 0 }}>
              <RenderGroup id="main">
                <GLTFObject modelId="/models/helmet/DamagedHelmet.gltf" />
              </RenderGroup>
            </Relative>
          )}
        />
        {/* <Sprite2D
          textureId="/models/helmet/Default_albedo.jpg"
          size={[2, 2]}
          clip={[0, 0, 2048, 2048]}
        /> */}
      </RenderGroup>
    </RenderPipeline>
  );
}
