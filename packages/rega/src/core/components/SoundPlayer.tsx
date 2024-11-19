import { useEffect } from "react";
import useSoundPlayer from "../hooks/useSoundPlayer";

interface Props {
  sourceId: string;
  loop?: boolean;
  active?: boolean;
  playbackRate?: number;
  volume?: number;
}

export default function SoundPlayer({
  sourceId,
  loop = false,
  active = true,
  playbackRate = 1,
  volume = 1,
}: Props) {
  const { play, stop } = useSoundPlayer(sourceId, {
    loop,
    playbackRate,
    volume,
  });

  useEffect(() => {
    if (active) {
      play();
    } else {
      stop();
    }
  }, [active, sourceId]);

  return null;
}
