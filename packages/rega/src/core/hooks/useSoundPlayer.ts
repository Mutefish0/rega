import { useEffect, useContext, useRef } from "react";
import GameStateContext from "../primitives/GameStateContext";
import SoundManager, { audioContext } from "../common/sound_manager";

interface Options {
  playbackRate?: number;
  volume?: number;
  loop?: boolean;
}

export default function useSoundPlayer(sourceId: string, opts: Options = {}) {
  const { playbackRate = 1, volume = 1, loop = false } = opts;

  const ref = useRef({
    sourceId,
    sourceNode: null as AudioBufferSourceNode | null,
    playbackRate,
    loop,
  });

  const ctx = useContext(GameStateContext);

  useEffect(() => {
    if (ctx.paused) {
      pause();
    } else {
      resume();
    }
  }, [ctx.paused]);

  useEffect(() => {
    ref.current.sourceId = sourceId;
  }, [sourceId]);

  useEffect(() => {
    ref.current.playbackRate = playbackRate;
    if (ref.current.sourceNode) {
      ref.current.sourceNode.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    ref.current.loop = loop;
    if (ref.current.sourceNode) {
      ref.current.sourceNode.loop = loop;
    }
  }, [loop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  function play() {
    stop();
    const node = audioContext.createBufferSource();
    ref.current.sourceNode = node as any;
    node.buffer = SoundManager.get(ref.current.sourceId)! as any;
    // @ts-ignore
    node.connect(audioContext.destination);
    // @ts-ignore
    node.playbackRate.value = ref.current.playbackRate;
    // @ts-ignore
    node.loop = ref.current.loop;
    node.start();
  }

  function stop() {
    if (ref.current.sourceNode) {
      ref.current.sourceNode.stop();
      ref.current.sourceNode.disconnect();
      ref.current.sourceNode = null;
    }
  }

  // @TODO
  function pause() {}
  // @TODO
  function resume() {}

  return {
    play,
    stop,
  };
}
