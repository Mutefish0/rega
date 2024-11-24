import { useEffect, useState } from "react";
import {
  TextureManager,
  SoundManager,
  FontManager,
  Editor,
  FPS,
  Relative,
  RenderGroup,
  RenderTarget,
  GUICamera,
  GUIView,
} from "rega";

import ShakeCamera from "./camera";
import Toast from "./gui/Toast";
import Level from "./scenes/Level";
import TitleScreen from "./scenes/TitleScreen";
import Guide from "./scenes/Guide";

export default function App() {
  const [toast, setToast] = useState("");
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
      "/sounds/type.wav",
      "/sounds/big_chest.wav",
      "/sounds/orb.wav",
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

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 2000);
  }

  if (loadingTexture) {
    return null;
  }

  const appElement = (
    <>
      <RenderTarget
        id="GAME"
        camera={
          <Relative translation={{ z: 100 }}>
            <ShakeCamera shake={shake} onShakeEnd={() => setShake(0)} />
          </Relative>
        }
      />

      <RenderTarget id="GUI" camera={<GUICamera />} />

      <RenderGroup target="GUI">
        <GUIView>
          <FPS
            style={{
              marginLeft: "auto",
              marginTop: 12,
              marginRight: 12,
              fontFamily: "celeste",
              fontSize: 12,
            }}
          />
        </GUIView>
        {!!toast && <Toast>{toast}</Toast>}
        {!started && <Guide />}
      </RenderGroup>

      <RenderGroup target="GAME">
        {!started && <TitleScreen onStart={() => setStarted(true)} />}
        {!!started && (
          <Level initialLevel={0} onShake={onShake} showToast={showToast} />
        )}
        {import.meta.env.DEV && (
          <Editor showIteractiveCamera={false} showPhysicDebuger={true} />
        )}
      </RenderGroup>
    </>
  );

  return appElement;
}
