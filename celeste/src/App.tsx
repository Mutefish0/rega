import { useEffect, useState } from "react";
import {
  TextureManager,
  SoundManager,
  FontManager,
  Editor,
  Box2D,
  Order,
  FPS,
  Relative,
  Sprite2D,
  RenderGroup,
  RenderTarget,
  Camera,
} from "rega";
// import Level from "./scenes/Level";
// import TitleScreen from "./scenes/TitleScreen";
// import Camera from "./camera";

export default function App() {
  const [loadingTexture, setLoadingTexture] = useState(true);
  const [shake, setShake] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const textures: string[] = ["/images/atlas.png"];
    const p1 = Promise.all(textures.map(TextureManager.add));

    const sounds: string[] = [
      "/sounds/area1.mp3",
      "/sounds/area2.mp3",
      "/sounds/area3.mp3",
      "/sounds/wind.mp3",
      "/sounds/title.mp3",
      "/sounds/dash.wav",
      "/sounds/jump.wav",
      "/sounds/wall_jump.wav",
      "/sounds/dash_land.wav",
      "/sounds/renew.wav",
      "/sounds/get_key.wav",
      "/sounds/spring.wav",
      "/sounds/get_fruit.wav",
      "/sounds/break_fall_floor.wav",
      "/sounds/chest.wav",
      "/sounds/get_balloon.wav",
      "/sounds/death.wav",
      "/sounds/fruit_fly.wav",
      "/sounds/start.wav",
    ];
    const p2 = Promise.all(sounds.map(SoundManager.add));

    const p3 = FontManager.add("celeste", {
      type: "bitmap",
      url: "/fonts/font.bmp",
      charSize: [8, 8],
    });

    const p4 = FontManager.add("Arial", {
      type: "typeface",
      url: "/fonts/ArialBlack-Regular.json",
    });

    Promise.all([p1, p2, p3, p4])
      .then(() => {
        setLoadingTexture(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function onShake(duration: number) {
    setShake(duration);
  }

  if (loadingTexture) {
    return null;
  }

  const appElement = (
    <>
      <RenderTarget main style={{ alignItems: 'center', justifyContent: 'center' }}>
        <RenderTarget targetId="test" style={{ height: 50, width: 50 }}></RenderTarget>
      </RenderTarget>
    
      <Camera type="orthographic" width={100} height={100} near={0.1} far={1000} />
      <RenderGroup targetId="___main___" >
        {/* <Sprite2D
          size={[20, 20]}
          textureId="/images/atlas.png"
          clip={[8, 0, 8, 8]}
          color="rgba(100,0,0,0.8)"
          //flipY={true}
        /> */}
        <Box2D size={[50, 50]} color="rgba(100,0,0,0.8)" /> 
      </RenderGroup>
    </>
  );

  // const appElement = (
  //   <>
  //     <FPS
  //       style={{
  //         fontFamily: "Arial",
  //         marginLeft: "auto",
  //         fontSize: 12,
  //         marginTop: 8,
  //         marginRight: 12,
  //         color: "rgba(200, 200, 200, 0.3)",
  //       }}
  //     />
  //     <Camera shake={shake} onShakeEnd={() => setShake(0)} />
  //     <Order order={1}>
  //       {!started && <TitleScreen onStart={() => setStarted(true)} />}
  //       {!!started && <Level initialLevel={0} onShake={onShake} />}
  //     </Order>
  //     <Order order={-1}>
  //       <Box2D size={[128, 128]} color="black" anchor="top-left" />
  //     </Order>
  //   </>
  // );

  if (import.meta.env.DEV) {
    return (
      <Editor showIteractiveCamera={false} showPhysicDebuger={false}>
        {appElement}
      </Editor>
    );
  } else {
    return appElement;
  }
}
