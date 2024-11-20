import { useState, useMemo, useRef } from "react";
import {
  Relative,
  SoundPlayer,
  ZIndex,
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
import PlayerIntro from "../Player/Intro";
import Player, { PlayerState } from "../Player";
import Room from "../Room";
import { clamp, uniq } from "lodash";

import CelesteLevel, { TITLE_SCREEN_LEVEL } from "./celesteLevel";

interface Props {
  initialLevel?: number;
  onShake: (duration: number) => void;
  showToast: (msg: string) => void;
}

const INITIAL_STATE = {
  // passed levels
  totalFruitsGot: 0,
  startTime: Date.now(),
  level: 0,
  // current level
  currentLevelFruitsGot: [] as string[],

  player: {
    position: {
      x: 0,
      y: 0,
    },
  },
};

function formatDate(time: number) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(
    2,
    "0"
  )}:${String(seconds % 60).padStart(2, "0")}`;
}

const GAME_STATE_KEY = "__CELESTE_GAME_STATE__";

export default function Level({ initialLevel = 0, onShake, showToast }: Props) {
  const ref = useRef(INITIAL_STATE);

  const [death, setDeath] = useState(false);

  const [intro, setIntro] = useState(true);

  const celesteLevel = useMemo(() => new CelesteLevel(), []);

  const [playerInstance, setPlayerInstance] = useState(0);

  const deathSfx = useSoundPlayer("/sounds/death.wav");

  const { list, emit } = useParticles<Vector>();

  const [playerPosition, setPlayerPosition] = useState();
  const [level, setLevel] = useState(initialLevel);
  const [currentFruitsGot, setCurrentFruitsGot] = useState<string[]>([]);
  const [totalFruitsGot, setTotalFruitsGot] = useState(0);
  const [playerHasDashed, setPlayerHasDashed] = useState(false);
  const [musicOn, setMusicOn] = useState(true);

  const gameStatekey = `${level}-${playerInstance}`; // game state

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
    bigChests,
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
    ref.current.level = level;
    ref.current.totalFruitsGot = totalFruitsGot;
    ref.current.currentLevelFruitsGot = currentFruitsGot;

    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(ref.current));

    console.log("saved: ", ref.current);
    showToast("GAME SAVED");
  }

  function loadGame() {
    const str = localStorage.getItem(GAME_STATE_KEY);
    try {
      const state = JSON.parse(str);
      ref.current = state;

      setLevel(ref.current.level);
      setPlayerPosition(state.player.position);
      setCurrentFruitsGot(state.currentLevelFruitsGot || []);
      setTotalFruitsGot(state.totalFruitsGot || 0);
      setPlayerInstance((i) => i + 1);
      setMusicOn(true);

      console.log("loaded: ", state);

      showToast("GAME LOADED");
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
    setCurrentFruitsGot([]);
    setPlayerPosition(undefined);
    setPlayerInstance((i) => i + 1);
    setMusicOn(true);
    setIntro(true);

    showToast(
      `${formatDate(Date.now() - ref.current.startTime)} ${(level + 1) * 100}M`
    );
  }

  function onPlayerGetFruit(id: string) {
    setCurrentFruitsGot(uniq([...currentFruitsGot, id]));
  }

  function goNextLevel() {
    setCurrentFruitsGot([]);
    setPlayerPosition(undefined);
    setTotalFruitsGot(totalFruitsGot + currentFruitsGot.length);
    setLevel((l) => (l + 1 === TITLE_SCREEN_LEVEL ? l + 2 : l + 1));
    setMusicOn(true);
    setIntro(true);

    showToast(
      `${formatDate(Date.now() - ref.current.startTime)} ${(level + 1) * 100}m`
    );
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
        <ZIndex zIndex={1}>
          {!!intro && (
            <PlayerIntro
              spwawn={{ x: playerSpawn[0], y: playerSpawn[1] }}
              onFinished={() => {
                setIntro(false);
                onShake(200);
              }}
            />
          )}
          {!intro && (
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
          )}
        </ZIndex>
      )}

      <ZIndex zIndex={-1}>
        <Clouds />
      </ZIndex>

      <ZIndex zIndex={2}>
        <Snow />
      </ZIndex>

      <ZIndex zIndex={0}>
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
          messages={messages}
          bigChests={bigChests}
          fruitsGot={currentFruitsGot}
          onPlayerGetFruit={onPlayerGetFruit}
          onPlayerSpike={onPlayerDeath}
          onPlayerFall={onPlayerDeath}
          onPlayerWin={goNextLevel}
          onBigChestOpen={() => setMusicOn(false)}
          playerHasDashed={playerHasDashed}
        />
      </ZIndex>

      {!!musicOn && <SoundPlayer sourceId={bgm} loop volume={0.6} />}
    </>
  );
}
