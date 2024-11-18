import { useMemo } from "react";
import { Sprite2D, Relative, Animation } from "rega";
import Hair from "./Hair";
import { spr } from "../utils";

interface Props {
  spwawn: {
    x: number;
    y: number;
  };
}

export default function Intro({ spwawn }: Props) {
  const steps = useMemo(() => {
    const from = -128;
    const to = spwawn.y;
    const mid = spwawn.y + 3;

    let d1 = 400; // 400ms
    const h1 = mid - from;
    const h2 = to - from;
    let d2 = Math.sqrt((h1 * (h1 - h2)) / (d1 * d1));

    function f(x: number) {
      return (-h1 / (d1 * d1)) * x * x + ((2 * h1) / d1) * x;
    }
  }, [spwawn]);

  return (
    <Relative>
      <Hair color="#fe014c" />
      <Sprite2D textureId="/images/atlas.png" clip={spr(1)} anchor="top-left" />
    </Relative>
  );
}
