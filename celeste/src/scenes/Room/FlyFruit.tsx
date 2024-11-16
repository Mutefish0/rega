import { useEffect, useState, useRef } from "react";
import {
  Sprite2D,
  Animation,
  AnimConfig,
  Relative,
  ShapeCollider2D,
  ActiveCollisionTypes,
  useSoundPlayer,
  RigidBody2D,
  RigidBodyRef,
  smoothstep,
  useAirTag,
  Absolute,
} from "rega";
import { spr } from "../utils";
import { CollisionGroup } from "../../constants";
import Lifeup from "../Lifeup";

interface Props {
  playerHasDashed: boolean;
  onGetFruit: () => void;
}

function* swingUpDown() {
  let time = 0;
  const dt = 33;
  const period = 660;
  while (true) {
    const cicle = Math.sin((time / period) * 2 * Math.PI);
    const y = 2.5 * cicle;
    const spr = Math.round(1 - cicle);
    yield [{ y, spr }, dt] as const;
    time += dt;
  }
}

const flyAnimConfig: AnimConfig<number> = {
  duration: 600,
  steps: smoothstep(30, 80, 20, "easeExpOut"),
};

export default function FlyFruit({ onGetFruit, playerHasDashed }: Props) {
  const rbRef = useRef<RigidBodyRef>();

  const [state, setState] = useState<"idle" | "got_fruit" | "fly" | "destory">(
    "idle"
  );

  const [tag, info] = useAirTag();

  const sfx = useSoundPlayer("/sounds/get_fruit.wav");

  const flySfx = useSoundPlayer("/sounds/fruit_fly.wav");

  useEffect(() => {
    if (state === "idle" && playerHasDashed) {
      setState("fly");
      setTimeout(() => flySfx.play(), 240);
    }
  }, [playerHasDashed, state]);

  if (state === "destory") {
    return null;
  }

  if (state === "got_fruit") {
    return (
      <Absolute matrix={info.matrix}>
        <Relative translation={{ y: 16 }}>
          <Lifeup />
        </Relative>
      </Absolute>
    );
  }

  if (state === "fly") {
    return (
      <>
        <Animation
          config={flyAnimConfig}
          onAnimationFrame={(spd) => {
            if (rbRef.current) {
              rbRef.current.commitVelocity({ y: spd });
            }
          }}
        />
        <RigidBody2D type="kinematic-velocity" ref={rbRef}>
          {tag}
          <ShapeCollider2D
            shape="cuboid"
            size={[8, 8]}
            collisionGroup={CollisionGroup.Sensor}
            collisionMask={CollisionGroup.Solid}
            activeCollisionTypes={
              ActiveCollisionTypes.DEFAULT |
              ActiveCollisionTypes.KINEMATIC_FIXED |
              ActiveCollisionTypes.KINEMATIC_KINEMATIC
            }
            onCollisionChange={(cols) => {
              if (cols.find((col) => col?.userData?.type === "player")) {
                onGetFruit();
                sfx.play();
                setState("got_fruit");
                setTimeout(() => {
                  setState("destory");
                }, 1000);
              } else if (
                cols.find((cols) => cols?.userData?.type === "win-wall")
              ) {
                setState("destory");
              }
            }}
            userData={{ type: "fruit" }}
          />
          <Sprite2D
            textureId="/images/atlas.png"
            clip={spr(28)}
            padding={0.05}
          />
          <Relative translation={{ x: 6, y: 2 }}>
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(45)}
              padding={0.05}
            />
          </Relative>
          <Relative translation={{ x: -6, y: 2 }}>
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(45)}
              padding={0.05}
              flipX
            />
          </Relative>
        </RigidBody2D>
      </>
    );
  }

  return (
    <>
      <Animation
        genFunc={swingUpDown}
        renderItem={(clip) => (
          <Relative translation={{ y: clip.y }}>
            {tag}
            <ShapeCollider2D
              shape="cuboid"
              size={[8, 8]}
              collisionGroup={CollisionGroup.Sensor}
              collisionMask={CollisionGroup.Solid}
              activeCollisionTypes={
                ActiveCollisionTypes.DEFAULT |
                ActiveCollisionTypes.KINEMATIC_FIXED
              }
              onCollisionChange={(cols) => {
                if (cols.find((col) => col?.userData?.type === "player")) {
                  onGetFruit();
                  sfx.play();
                  setState("got_fruit");
                  setTimeout(() => {
                    setState("destory");
                  }, 1000);
                }
              }}
              userData={{ type: "fruit" }}
            />
            <Sprite2D
              textureId="/images/atlas.png"
              clip={spr(28)}
              padding={0.05}
            />
            <Relative translation={{ x: 6, y: 2 }}>
              <Sprite2D
                textureId="/images/atlas.png"
                clip={spr(45 + clip.spr)}
                padding={0.05}
              />
            </Relative>
            <Relative translation={{ x: -6, y: 2 }}>
              <Sprite2D
                textureId="/images/atlas.png"
                clip={spr(45 + clip.spr)}
                padding={0.05}
                flipX
              />
            </Relative>
          </Relative>
        )}
      />
    </>
  );
}
