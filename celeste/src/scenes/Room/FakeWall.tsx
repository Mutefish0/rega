import React, { useState } from "react";
import { Sprite2D, Relative, ShapeCollider2D, useSoundPlayer } from "rega";
import Smoke from "../Smoke";
import Fruit from "./Fruit";
import { CollisionGroup } from "../../constants";
import { spr } from "../utils";

interface Props {
  onGetFruit: () => void;
}

export default function FakeWall({ onGetFruit }: Props) {
  const [state, setState] = useState<"idle" | "break">("idle");

  const sfx = useSoundPlayer("/sounds/chest.wav");

  if (state === "break") {
    return (
      <>
        <Smoke autoDestroy />
        <Relative>
          <Smoke autoDestroy />
        </Relative>
        <Relative translation={{ x: 8 }}>
          <Smoke autoDestroy />
        </Relative>
        <Relative translation={{ y: -8 }}>
          <Smoke autoDestroy />
        </Relative>
        <Relative translation={{ x: 8, y: -8 }}>
          <Smoke autoDestroy />
        </Relative>
        <Relative translation={{ x: 4, y: -4 }}>
          <Fruit onGetFruit={onGetFruit} />
        </Relative>
      </>
    );
  }

  return (
    <>
      <Relative translation={{ x: 4, y: -4 }}>
        <ShapeCollider2D
          shape="cuboid"
          size={[16, 16]}
          collisionGroup={CollisionGroup.Solid}
          collisionMask={CollisionGroup.Player}
          userData={{ type: "fake-wall" }}
          anchor="center"
          onMessage={(msg) => {
            if (msg === "break") {
              setState("break");
              sfx.play();
            }
          }}
        />
      </Relative>
      <Sprite2D textureId="/images/atlas.png" clip={spr(64)} padding={0.05} />
      <Relative translation={{ x: 8 }}>
        <Sprite2D textureId="/images/atlas.png" clip={spr(65)} padding={0.05} />
      </Relative>
      <Relative translation={{ y: -8 }}>
        <Sprite2D textureId="/images/atlas.png" clip={spr(80)} padding={0.05} />
      </Relative>
      <Relative translation={{ x: 8, y: -8 }}>
        <Sprite2D textureId="/images/atlas.png" clip={spr(81)} padding={0.05} />
      </Relative>
    </>
  );
}
