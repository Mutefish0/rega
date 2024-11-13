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
  Text,
  GUIView,
  GUICamera,
  useTextureBinding,
  Tilemap,
  TilemapCollider2D,
} from "rega";

import Player from "./scenes/Player";
import Level from "./scenes/Level";
import TitleScreen from "./scenes/TitleScreen";
import FlyFruit from "./scenes/Room/FlyFruit";
import Fruit from "./scenes/Room/Fruit";

import CelesteLevel, { TITLE_SCREEN_LEVEL } from "./scenes/Level/celesteLevel";

const celesteLevel = new CelesteLevel(1);

const { clips, tiles } = celesteLevel.getLevelMapAll();

// import Camera from "./camera";

export default function App() {
  const [loadingTexture, setLoadingTexture] = useState(true);
  const [shake, setShake] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const textures: string[] = ["/images/atlas.png", "/images/test.png"];
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
      <RenderTarget main />
      <RenderGroup>
        <Relative translation={{ z: 1 }}>
          <Camera
            type="orthographic"
            width={128}
            height={128}
            //anchor="top-left"
          />
        </Relative>

        {/* <FlyFruit onGetFruit={() => {}} playerHasDashed={false} /> */}
        {/* <Order order={1}>
          <Box2D size={[20, 20]} anchor="bottom-left" color="#fff" />
        </Order> */}
        {/* <Order order={10}>
          <Box2D size={[20, 20]} anchor="bottom-left" color="#fff" />
        </Order>

        <Order order={5}>
          <Relative translation={{ x: 10, y: 10 }}>
            <Box2D size={[20, 20]} anchor="bottom-left" color="red" />
          </Relative>
        </Order> */}
        <Sprite2D
          textureId="/images/atlas.png"
          clip={[8, 0, 8, 8]}
          size={[20, 20]}
          flipX={false}
        />
        {/* <Level initialLevel={0} onShake={onShake} /> */}

        {/* <Box2D size={[20, 20]} anchor="bottom-left" color="#fff" /> */}
        {/* <Tilemap
          textureId="/images/atlas.png"
          tiles={tiles.map(([x, y]) => [x, y])}
          coords={clips.map(([x, y]) => [x, y])}
          pixelPerTile={8}
          tileSize={8}
        /> */}

        {import.meta.env.DEV && (
          <Editor showIteractiveCamera={true} showPhysicDebuger={true} />
        )}
      </RenderGroup>
    </>
  );

  return appElement;

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

  // if (import.meta.env.DEV) {
  //   return (
  //     <Editor showIteractiveCamera={true} showPhysicDebuger={true}>
  //       {appElement}
  //     </Editor>
  //   );
  // } else {
  //   return appElement;
  // }
}
