import { useState, useMemo, useRef } from "react";
import {
  Relative,
  SoundPlayer,
  Order,
  Vector,
  useSoundPlayer,
  useParticles,
  Absolute,
  localStorage,
  KeyboardInput,
  GamepadInput,
} from "rega";
import DeathParticle from "../DeathParticle";
import Clouds from "../Clouds";
import Snow from "../Snow";
import Player, { PlayerState } from "../Player";
import Room from "../Room";
import { clamp } from "lodash";

import CelesteLevel, { TITLE_SCREEN_LEVEL } from "./celesteLevel";

interface Props {
  initialLevel?: number;
  onShake: (duration: number) => void;
}

const GAME_STATE_KEY = "__CELESTE_GAME_STATE__";

export default function Level({ initialLevel = 0, onShake }: Props) {
  const [death, setDeath] = useState(false);
  const [level, setLevel] = useState(initialLevel);
  const [fruitsGot, setFruitsGot] = useState(0);

  const [currentFruitsGot, setCurrentFruitsGot] = useState<
    Record<string, boolean>
  >({});

  const currentFruitsGotRef = useRef<Record<string, boolean>>({});

  const celesteLevel = useMemo(() => new CelesteLevel(), []);

  const [playerInstance, setPlayerInstance] = useState(0);

  const deathSfx = useSoundPlayer("/sounds/death.wav");

  const { list, emit } = useParticles<Vector>();

  const gameStatekey = `${level}-${playerInstance}`;

  const ref = useRef({
    fruitsGot: 0,
    level: 1,
    player: {
      position: {
        x: 0,
        y: 0,
      },
    },
  });

  // game state
  const [playerPosition, setPlayerPosition] = useState();
  const [playerHasDashed, setPlayerHasDashed] = useState(false);

  const {
    bgm,
    tilemap,
    playerSpawn,
    springs,
    fallFloors,
    fakeWalls,
    fruits,
    flyFruits,
    chests,
    keys,
    balloons,
    platforms,
    messages,
  } = useMemo(() => {
    celesteLevel.setLevel(level);
    ref.current.level = level;
    const tilemap = celesteLevel.getLevelMapAll();
    const bgm = celesteLevel.getLevelBGM();

    const objs = celesteLevel.getLevelObjects();

    return {
      tilemap,
      bgm,
      ...objs,
    };
  }, [level]);

  useMemo(() => {
    // reset states
    setPlayerHasDashed(false);
  }, [gameStatekey]);

  function onPlayerUpdate(state: PlayerState) {
    ref.current.player = state;
  }

  function saveGame() {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(ref.current));
    console.log("saved: ", ref.current);
  }

  function loadGame() {
    const str = localStorage.getItem(GAME_STATE_KEY);
    try {
      const state = JSON.parse(str);

      ref.current.level = state.level;
      ref.current.player = state.player;
      ref.current.fruitsGot = state.fruitsGot;

      setLevel(ref.current.level);

      setFruitsGot(ref.current.fruitsGot);
      setCurrentFruitsGot({});
      currentFruitsGotRef.current = {};

      setPlayerPosition(state.player.position);
      setPlayerInstance((i) => i + 1);

      console.log("loaded: ", state);
    } catch (err) {
      //
    }
  }

  function onPlayerDeath(pos: Vector) {
    deathSfx.play();
    onShake(330);

    emit({
      lifetime: 333,
      data: {
        x: clamp(pos.x, 0, 128),
        y: clamp(pos.y, -128, 0),
      },
    });
    setDeath(true);
    setTimeout(() => {
      setDeath(false);
      restartLevel();
    }, 500);
  }

  function restartLevel() {
    setCurrentFruitsGot(currentFruitsGotRef.current);
    setPlayerPosition(undefined);
    setPlayerInstance((i) => i + 1);
  }

  function onPlayerGetFruit(id: string) {
    currentFruitsGotRef.current[id] = true;
  }

  function goNextLevel() {
    setFruitsGot(
      (prev) => prev + Object.keys(currentFruitsGotRef.current).length
    );
    currentFruitsGotRef.current = {};
    setCurrentFruitsGot({});

    setPlayerPosition(undefined);
    setLevel((l) => (l + 1 === TITLE_SCREEN_LEVEL ? l + 2 : l + 1));
  }

  return (
    <>
      <KeyboardInput
        inputKey="j"
        onKeyChange={(pressed) => {
          if (pressed) {
            saveGame();
          }
        }}
      />
      <KeyboardInput
        inputKey="k"
        onKeyChange={(pressed) => {
          if (pressed) {
            loadGame();
          }
        }}
      />
      <GamepadInput
        label="player1"
        inputKey="leftBumper"
        onKeyChange={(pressed) => {
          if (pressed) {
            saveGame();
          }
        }}
      />
      <GamepadInput
        label="player1"
        inputKey="rightBumper"
        onKeyChange={(pressed) => {
          if (pressed) {
            loadGame();
          }
        }}
      />
      {list.map((p) => (
        <Absolute key={p.id} translation={p.data}>
          <DeathParticle />
        </Absolute>
      ))}
      {!death && (
        <Order order={2}>
          <Relative
            translation={
              playerPosition ?? { x: playerSpawn[0], y: playerSpawn[1] }
            }
          >
            <Player
              key={gameStatekey}
              onPlayerUpdate={onPlayerUpdate}
              onPlayerDash={() => {
                setPlayerHasDashed(true);
                onShake(200);
              }}
            />
          </Relative>
        </Order>
      )}

      <Order order={0}>
        <Clouds />
      </Order>

      <Order order={3}>
        <Snow />
      </Order>

      <Room
        key={gameStatekey}
        tilemap={tilemap}
        springs={springs}
        fallFloors={fallFloors}
        fakeWalls={fakeWalls}
        fruits={fruits}
        flyFruits={flyFruits}
        keys={keys}
        chests={chests}
        balloons={balloons}
        platforms={platforms}
        fruitsGot={currentFruitsGot}
        onPlayerGetFruit={onPlayerGetFruit}
        onPlayerSpike={onPlayerDeath}
        onPlayerFall={onPlayerDeath}
        onPlayerWin={goNextLevel}
        playerHasDashed={playerHasDashed}
        messages={messages}
      />

      <SoundPlayer sourceId={bgm} loop volume={0.6} />
    </>
  );
}
