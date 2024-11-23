import React, { useMemo, useState } from "react";
import {
  Animation,
  Tilemap,
  SoundPlayer,
  useSoundPlayer,
  View,
  Text,
  KeyboardInput,
  GamepadInput,
  TextStyle,
  GUIView,
} from "rega";

import CelesteLevel, { TITLE_SCREEN_LEVEL } from "../Level/celesteLevel";
import Snow from "../Snow";

interface Props {
  onStart: () => void;
}

const textStyle: TextStyle = {
  fontFamily: "celeste",
  fontSize: 7,
  letterSpacing: -3,
  color: "#5f574f",
};

function* idleAnimation() {
  yield ["#5f574f", 0] as const;
}

function* animation() {
  for (let i = 0; i < 4; i++) {
    yield ["#5f574f", 165] as const;
    yield ["#ffffff", 165] as const;
  }
  yield ["#7e2553", 165] as const;
  yield ["#1d2b53", 165] as const;
  yield ["#000000", 165] as const;
}

export default function TitleScreen({ onStart }: Props) {
  const [starting, setStarting] = useState(false);
  const sfx = useSoundPlayer("/sounds/start.wav");

  const { bgm, tiles, clips } = useMemo(() => {
    const celesteLevel = new CelesteLevel(TITLE_SCREEN_LEVEL);
    const bgm = celesteLevel.getLevelBGM();
    const { clips, tiles } = celesteLevel.getLevelMapAll();
    return {
      bgm,
      clips,
      tiles,
    };
  }, []);

  function handleKeyStart(pressed: number) {
    if (!starting && pressed) {
      setStarting(true);
      sfx.play();
      setTimeout(() => {
        onStart();
      }, 2600);
    }
  }

  return (
    <>
      <KeyboardInput inputKey="x" onKeyChange={handleKeyStart} />
      <KeyboardInput inputKey="c" onKeyChange={handleKeyStart} />
      <GamepadInput label="player1" inputKey="a" onKeyChange={handleKeyStart} />
      <GamepadInput label="player1" inputKey="b" onKeyChange={handleKeyStart} />

      <Animation
        genFunc={starting ? animation : idleAnimation}
        renderItem={(color) => (
          <>
            <Tilemap
              textureId="/images/atlas.png"
              tiles={tiles.map(([x, y]) => [x + 3, y])}
              coords={clips.map(([x, y]) => [x, y])}
              pixelPerTile={8}
              tileSize={8}
              color={starting ? color : undefined}
            />
            <View
              style={{
                width: 128,
                height: 128,
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  ...textStyle,
                  color,
                  marginTop: 80,
                  marginBottom: 12,
                }}
              >
                c+x
              </Text>
              <Text style={{ ...textStyle, color }}>matt thorson</Text>
              <Text style={{ ...textStyle, color }}>noel berry</Text>
            </View>
          </>
        )}
      />
      <Snow />
      {!starting && <SoundPlayer sourceId={bgm} loop volume={0.6} />}

      {/* TODO: add guide infomation */}
    </>
  );
}
