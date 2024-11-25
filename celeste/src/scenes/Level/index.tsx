import { useState, useMemo, useRef, useEffect } from "react";
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
  Box2D,
  AnimConfig,
  Animation,
} from "rega";
import DeathParticle from "../DeathParticle";
import Clouds from "../Clouds";
import Snow from "../Snow";
import PlayerIntro from "../Player/Intro";
import Player, { PlayerState } from "../Player";
import Room from "../Room";
import { clamp, uniq } from "lodash";

import CelesteLevel, { TITLE_SCREEN_LEVEL } from "./celesteLevel";

const flashBackgroundAnim: AnimConfig<string> = {
  duration: 1000,
  steps: [
    "#000",
    "#1d2b53",
    "#7e2553",
    "#008751",
    "#ab5236",
    "#5f574f",
    "#c2c3c7",
  ],
  loop: true,
};

interface Props {
  initialLevel?: number;
  onShake: (duration: number) => void;
  showToast: (msg: string) => void;
}

const INITIAL_STATE = {
  // passed levels
  totalFruitsGot: 0,
  gotOrb: false,
  startTime: Date.now(),
  level: 0,

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

  const [gotOrb, setGotOrb] = useState(false);

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
  const [isFlashing, setIsFlashing] = useState(false);
  const [playerFreeze, setPlayerFreeze] = useState(false);
  const [music, setMusic] = useState("");

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
    springFallFloors,
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

  useEffect(() => {
    setMusic(bgm);
  }, [bgm]);

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
    ref.current.gotOrb = gotOrb;
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
      setCurrentFruitsGot([]);
      setGotOrb(!!state.gotOrb);
      setTotalFruitsGot(state.totalFruitsGot || 0);
      setPlayerInstance((i) => i + 1);

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
    setIntro(true);

    showToast(
      `${formatDate(Date.now() - ref.current.startTime)} ${(level + 1) * 100}M`
    );
  }

  function onPlayerGetFruit(id: string) {
    setCurrentFruitsGot(uniq([...currentFruitsGot, id]));
  }

  function goNextLevel() {
    setPlayerPosition(undefined);
    setTotalFruitsGot(totalFruitsGot + currentFruitsGot.length);
    setCurrentFruitsGot([]);
    setLevel((l) => (l + 1 === TITLE_SCREEN_LEVEL ? l + 2 : l + 1));
    setIntro(true);

    showToast(
      `${formatDate(Date.now() - ref.current.startTime)} ${(level + 1) * 100}m`
    );
  }

  function freeze(ms: number) {
    setPlayerFreeze(true);
    setTimeout(() => setPlayerFreeze(false), ms);
  }

  function flash(ms: number) {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), ms);
  }

  function onGetOrb() {
    setGotOrb(true);
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

      <ZIndex zIndex={1}>
        {list.map((p) => (
          <Absolute key={p.id} translation={p.data}>
            <DeathParticle />
          </Absolute>
        ))}
      </ZIndex>

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
                freeze={playerFreeze}
                gotOrb={gotOrb}
                onPlayerSpike={onPlayerDeath}
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
          onGetOrb={onGetOrb}
          key={gameStatekey}
          tilemap={tilemap}
          springs={springs}
          fallFloors={fallFloors}
          springFallFloors={springFallFloors}
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
          onPlayerFall={onPlayerDeath}
          onPlayerWin={goNextLevel}
          playerHasDashed={playerHasDashed}
          //
          setMusic={setMusic}
          shake={onShake}
          freeze={freeze}
          flash={flash}
        />
      </ZIndex>

      {/* background */}
      <ZIndex zIndex={-2}>
        {isFlashing ? (
          <Animation
            config={flashBackgroundAnim}
            renderItem={(color) => (
              <Box2D size={[132, 132]} color={color} anchor="top-left" />
            )}
          />
        ) : (
          <Box2D
            size={[132, 132]}
            color={gotOrb ? "#7e2553" : "#000"}
            anchor="top-left"
          />
        )}
      </ZIndex>
      {!!music && <SoundPlayer sourceId={music} loop volume={0.6} />}
    </>
  );
}
