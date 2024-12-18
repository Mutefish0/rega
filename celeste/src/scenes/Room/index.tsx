import React, { useState } from "react";

import {
  RigidBody2D,
  TilemapCollider2D,
  Tilemap,
  ShapeCollider2D,
  Relative,
  ActiveCollisionTypes,
  useSoundPlayer,
  Vector,
} from "rega";

import { CollisionGroup } from "../../constants";
import Spike from "./Spike";
import Spring from "./Spring";
import FallFloor from "./FallFloor";
import SpringFallFloor from "./SpringFallFloor";
import FakeWall from "./FakeWall";
import Fruit from "./Fruit";
import FlyFruit from "./FlyFruit";
import Key from "./Key";
import Chest from "./Chest";
import Ballon from "./Balloon";
import Platform from "./Platform";
import Message from "./Message";
import BigChest from "./BigChest";
import Orb from "./Orb";
import Flag from "./Flag";

interface Props {
  tilemap: {
    clips: Array<[number, number, number, number]>;
    tiles: Array<[number, number]>;
    solids: Array<[number, number]>;
    spikes: Array<[number, number, number]>;
  };
  springs: Array<[number, number]>;
  fallFloors: Array<[number, number]>;
  fakeWalls: Array<[number, number]>;
  fruits: Array<[number, number]>;
  flyFruits: Array<[number, number]>;
  keys: Array<[number, number]>;
  chests: Array<[number, number]>;
  balloons: Array<[number, number]>;
  platforms: Array<[number, number, number]>;
  messages: Array<[number, number]>;
  bigChests: Array<[number, number]>;
  springFallFloors: Array<[number, number]>;
  flags: Array<[number, number]>;

  playerHasDashed: boolean;

  onPlayerGetFruit: (id: string) => void;
  onPlayerFall: (pos: Vector) => void;
  onPlayerWin: () => void;
  onGetOrb: () => void;

  //
  setMusic: (src: string) => void;
  shake: (ms: number) => void;
  freeze: (ms: number) => void;
  flash: (ms: number) => void;
}

export default function Room({
  tilemap,
  springs,
  fallFloors,
  fakeWalls,
  fruits,
  flyFruits,
  keys,
  chests,
  balloons,
  platforms,
  messages,
  bigChests,
  springFallFloors,
  flags,

  onPlayerGetFruit,
  onPlayerFall,
  onPlayerWin,
  onGetOrb,
  playerHasDashed,
  //
  shake,
  setMusic,
  flash,
  freeze,
}: Props) {
  const [hasKey, setHasKey] = useState(false);
  const getKeySfx = useSoundPlayer("/sounds/get_key.wav");

  const { clips, tiles, solids, spikes } = tilemap;

  function onPlayerGetKey() {
    getKeySfx.play();
    setHasKey(true);
  }

  return (
    <>
      <Tilemap
        textureId="/images/atlas.png"
        tiles={tiles}
        coords={clips.map(([x, y]) => [x, y])}
        pixelPerTile={8}
        tileSize={8}
      />
      <RigidBody2D type="fixed" mass={1000}>
        <TilemapCollider2D
          tiles={solids}
          tileSize={8}
          collisionGroup={CollisionGroup.Solid}
        />
      </RigidBody2D>
      {/* platforms */}
      {platforms.map(([x, y, d], i) => (
        <Relative key={i} translation={{ x, y: y - 3 }}>
          <Platform dir={d} />
        </Relative>
      ))}
      {/* springs */}
      {springs.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y: y - 4 }}>
          <Spring />
        </Relative>
      ))}
      {/* fall floors */}
      {fallFloors.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y: y - 4 }}>
          <FallFloor />
        </Relative>
      ))}
      {springFallFloors.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y: y - 4 }}>
          <SpringFallFloor />
        </Relative>
      ))}
      {/* fake walls */}
      {fakeWalls.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y: y - 4 }}>
          <FakeWall
            onGetFruit={() => onPlayerGetFruit(`fake_wall_fruit_${i}`)}
          />
        </Relative>
      ))}
      {/* fruits */}
      {fruits.map(([x, y], i) => (
        <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
          <Fruit key={i} onGetFruit={() => onPlayerGetFruit(`fruit_${i}`)} />
        </Relative>
      ))}
      {/* fly fruits */}
      {flyFruits.map(([x, y], i) => (
        <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
          <FlyFruit
            key={i}
            onGetFruit={() => onPlayerGetFruit(`fly_fruit_${i}`)}
            playerHasDashed={playerHasDashed}
          />
        </Relative>
      ))}
      {/* balloons */}
      {balloons.map(([x, y], i) => (
        <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
          <Ballon />
        </Relative>
      ))}
      {/* keys */}
      {!hasKey &&
        keys.map(([x, y], i) => (
          <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
            <Key onGetKey={onPlayerGetKey} />
          </Relative>
        ))}
      {/* chests */}
      {chests.map(([x, y], i) => (
        <Relative translation={{ x: x, y: y - 4 }} key={i}>
          <Chest
            hasKey={hasKey}
            onGetFruit={() => onPlayerGetFruit(`chest_fruit_${i}`)}
          />
        </Relative>
      ))}
      {/* spikes */}
      {spikes.map(([x, y, d], i) => (
        <Relative key={i} translation={{ x, y }}>
          <Spike dir={d} />
        </Relative>
      ))}
      {messages.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y }}>
          <Message key={i} />
        </Relative>
      ))}
      {bigChests.map(([x, y], i) => (
        <Relative key={i} translation={{ x, y }}>
          <BigChest
            flash={flash}
            shake={shake}
            setMusic={setMusic}
            freeze={freeze}
          >
            <Orb
              shake={shake}
              freeze={freeze}
              onGetOrb={onGetOrb}
              setMusic={setMusic}
            />
          </BigChest>
        </Relative>
      ))}
      {flags.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y }}>
          <Flag />
        </Relative>
      ))}
      {/* invisible wall */}
      <Relative translation={{ x: -1, y: 0, z: 0 }}>
        <ShapeCollider2D
          anchor="top-left"
          shape="cuboid"
          size={[1, 128]}
          collisionGroup={CollisionGroup.Solid}
          userData={{ type: "invisible-wall" }}
        />
      </Relative>
      <Relative translation={{ x: 128, y: 0, z: 0 }}>
        <ShapeCollider2D
          anchor="top-left"
          shape="cuboid"
          size={[1, 128]}
          collisionGroup={CollisionGroup.Solid}
          userData={{ type: "invisible-wall" }}
        />
      </Relative>
      {/* death wall */}
      <Relative translation={{ x: 0, y: -132, z: 0 }}>
        <ShapeCollider2D
          anchor="top-left"
          shape="cuboid"
          size={[128, 1]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Player}
          userData={{ type: "death-wall" }}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={(cols) => {
            const col = cols.find((col) => col?.userData?.type === "player");
            if (col) {
              onPlayerFall(col.contactData!.solverContacts[0]);
            }
          }}
        />
      </Relative>
      {/* win */}
      <Relative translation={{ x: 0, y: 3, z: 0 }}>
        <ShapeCollider2D
          anchor="top-left"
          shape="cuboid"
          sensor
          size={[128, 1]}
          collisionGroup={CollisionGroup.Sensor}
          collisionMask={CollisionGroup.Player | CollisionGroup.Sensor}
          userData={{ type: "win-wall" }}
          activeCollisionTypes={
            ActiveCollisionTypes.DEFAULT | ActiveCollisionTypes.KINEMATIC_FIXED
          }
          onCollisionChange={(cols) => {
            for (const col of cols) {
              if (col?.userData?.type === "player") {
                onPlayerWin();
              }
            }
          }}
        />
      </Relative>
    </>
  );
}
