import { useEffect, useMemo, useState } from "react";
import { Sprite2D, Animation, Relative, useSoundPlayer } from "rega";
import { spr } from "../utils";
import Fruit from "./Fruit";
import { times } from "lodash";

interface Props {
  hasKey: boolean;
  onGetFruit: () => void;
}

export default function Chest({ hasKey, onGetFruit }: Props) {
  const [state, setState] = useState<"idle" | "shaking" | "fruit">("idle");

  const animConfig = useMemo(
    () => ({
      steps: times(20, () => Math.random() * 3 - 1.5),
      duration: 660,
    }),
    []
  );

  const chestSfx = useSoundPlayer("/sounds/chest.wav");

  useEffect(() => {
    if (hasKey && state === "idle") {
      // Open chest
      setState("shaking");
    }
  }, [hasKey, state]);

  if (state === "shaking") {
    return (
      <Animation
        config={animConfig}
        renderItem={(x) => (
          <Relative translation={{ x, y: 0, z: 0 }}>
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(20)}
              padding={0.05}
            />
          </Relative>
        )}
        onAnimationEnd={() => {
          chestSfx.play();
          setState("fruit");
        }}
      />
    );
  }

  if (state === "fruit") {
    return (
      <Relative translation={{ x: 0, y: 4, z: 0 }}>
        <Fruit onGetFruit={onGetFruit} />
      </Relative>
    );
  }

  return (
    <Sprite2D textureId="/images/atlas.png" clip={spr(20)} padding={0.05} />
  );
}
