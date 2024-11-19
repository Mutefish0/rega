import React, { useMemo, useState } from "react";

import {
  RigidBody2D,
  TilemapCollider2D,
  Tilemap,
  ShapeCollider2D,
  Relative,
  ActiveCollisionTypes,
  useSoundPlayer,
  Vector,
  useConst,
} from "rega";

import { CollisionGroup } from "../../constants";
import Spike from "./Spike";
import Spring from "./Spring";
import FallFloor from "./FallFloor";
import FakeWall from "./FakeWall";
import Fruit from "./Fruit";
import FlyFruit from "./FlyFruit";
import Key from "./Key";
import Chest from "./Chest";
import Ballon from "./Balloon";
import Platform from "./Platform";
import Message from "./Message";
import BigChest from "./BigChest";

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

  playerHasDashed: boolean;

  fruitsGot: string[];
  onPlayerGetFruit: (id: string) => void;
  onPlayerSpike: (pos: Vector) => void;
  onPlayerFall: (pos: Vector) => void;
  onPlayerWin: () => void;
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
  fruitsGot,
  onPlayerGetFruit,
  onPlayerSpike,
  onPlayerFall,
  onPlayerWin,
  playerHasDashed,
}: Props) {
  const s = useConst({ hasSpike: false });
  const [hasKey, setHasKey] = useState(false);
  const getKeySfx = useSoundPlayer("/sounds/get_key.wav");

  const { clips, tiles, solids, spikes } = tilemap;

  function onPlayerGetKey() {
    getKeySfx.play();
    setHasKey(true);
  }

  function handleSpike(pos: Vector) {
    if (s.hasSpike) {
      return;
    }
    s.hasSpike = true;
    onPlayerSpike(pos);
  }

  return (
    <RigidBody2D type="fixed" mass={1000}>
      <Tilemap
        textureId="/images/atlas.png"
        tiles={tiles}
        coords={clips.map(([x, y]) => [x, y])}
        pixelPerTile={8}
        tileSize={8}
      />
      <TilemapCollider2D
        tiles={solids}
        tileSize={8}
        collisionGroup={CollisionGroup.Solid}
      />
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
      {/* fake walls */}
      {fakeWalls.map(([x, y], i) =>
        fruitsGot.includes(`fake_wall_fruit_${i}`) ? null : (
          <Relative key={i} translation={{ x: x + 4, y: y - 4 }}>
            <FakeWall
              onGetFruit={() => onPlayerGetFruit(`fake_wall_fruit_${i}`)}
            />
          </Relative>
        )
      )}
      {/* fruits */}
      {fruits.map(([x, y], i) =>
        fruitsGot.includes(`fruit_${i}`) ? null : (
          <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
            <Fruit key={i} onGetFruit={() => onPlayerGetFruit(`fruit_${i}`)} />
          </Relative>
        )
      )}
      {/* fly fruits */}
      {flyFruits.map(([x, y], i) =>
        fruitsGot.includes(`fly_fruit_${i}`) ? null : (
          <Relative translation={{ x: x + 4, y: y - 4 }} key={i}>
            <FlyFruit
              key={i}
              onGetFruit={() => onPlayerGetFruit(`fly_fruit_${i}`)}
              playerHasDashed={playerHasDashed}
            />
          </Relative>
        )
      )}
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
      {chests.map(([x, y], i) =>
        fruitsGot.includes(`chest_fruit_${i}`) ? null : (
          <Relative translation={{ x: x, y: y - 4 }} key={i}>
            <Chest
              hasKey={hasKey}
              onGetFruit={() => onPlayerGetFruit(`chest_fruit_${i}`)}
            />
          </Relative>
        )
      )}
      {/* spikes */}
      {spikes.map(([x, y, d], i) => (
        <Relative key={i} translation={{ x, y }}>
          <Spike dir={d} onSpike={handleSpike} />
        </Relative>
      ))}
      {messages.map(([x, y], i) => (
        <Relative key={i} translation={{ x: x + 4, y }}>
          <Message />
        </Relative>
      ))}
      {bigChests.map(([x, y], i) => (
        <Relative key={i} translation={{ x, y }}>
          <BigChest />
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
    </RigidBody2D>
  );
}
