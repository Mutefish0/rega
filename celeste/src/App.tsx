import { useEffect, useState } from "react";
import { TextureManager, SoundManager, Editor, Box2D, Order, FPS } from "rega";
import Level from "./scenes/Level";
import TitleScreen from "./scenes/TitleScreen";
import Camera from "./camera";
import font from "./ui/font";

export default function App() {
  const [loadingTexture, setLoadingTexture] = useState(true);
  const [shake, setShake] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const textures: string[] = ["/images/atlas.png", "/images/font.bmp"];
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

    Promise.all([p1, p2])
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
      <FPS
        font={font}
        style={{
          marginLeft: "auto",
          fontSize: 12,
          margin: 16,
          letterSpacing: -4,
          color: "rgba(200, 200, 200, 0.2)",
        }}
      />
      <Camera shake={shake} onShakeEnd={() => setShake(0)} />
      <Order order={1}>
        {!started && <TitleScreen onStart={() => setStarted(true)} />}
        {!!started && <Level initialLevel={0} onShake={onShake} />}
      </Order>
      <Order order={-1}>
        <Box2D size={[128, 128]} color="black" anchor="top-left" />
      </Order>
    </>
  );

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
