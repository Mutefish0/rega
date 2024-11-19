import { useMemo } from "react";
import { Sprite2D, Absolute, Relative, Animation } from "rega";
import Hair from "./Hair";
import { spr } from "../utils";

interface Props {
  onFinished: () => void;
  spwawn: {
    x: number;
    y: number;
  };
}

export default function Intro({ spwawn, onFinished }: Props) {
  const animConfig = useMemo(() => {
    const from = -128;
    const to = spwawn.y;
    const mid = spwawn.y + 8;

    const d1 = 400; // 400ms
    const h1 = mid - from;
    const h2 = to - from;
    const d2 = Math.sqrt((d1 * d1 * (h1 - h2)) / h1);
    const maxTime = d1 + d2;

    // 抛物线方程
    function f(x: number) {
      return (-h1 / (d1 * d1)) * x * x + ((2 * h1) / d1) * x;
    }

    const steps: number[] = [];

    for (let i = 0; i < maxTime; i += 30) {
      steps.push(f(i) + from);
    }

    steps.push(to);

    return { steps, duration: maxTime };
  }, [spwawn.y]);

  return (
    <Animation
      config={animConfig}
      onAnimationEnd={() => {
        onFinished();
      }}
      renderItem={(y) => (
        <Absolute translation={{ x: spwawn.x, y }}>
          <Relative
            translation={{
              x: 2.5,
              y: -3.5,
              z: 0,
            }}
          >
            <Hair color="#fe014c" />
          </Relative>

          <Sprite2D
            textureId="/images/atlas.png"
            clip={spr(1)}
            anchor="top-left"
          />
        </Absolute>
      )}
    />
  );
}
