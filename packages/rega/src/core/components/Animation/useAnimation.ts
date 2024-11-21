import { useEffect, useMemo } from "react";
import {
  easeLinear,
  easeCubicIn,
  easeCubicOut,
  easeCircleIn,
  easeCircleOut,
  easeElasticIn,
  easeElasticOut,
  easeBounceIn,
  easeBounceOut,
  easeCubicInOut,
  easeSinIn,
  easeSinOut,
  easeSinInOut,
  easeQuadInOut,
  easeExpOut,
  easeExpIn,
  easeQuadIn,
} from "d3-ease";
import useFrame from "../../hooks/useFrame";
import useConst from "../../hooks/useConst";

type AnimGenData<T> = readonly [T, number];
type AnimationGenerator<T> = Generator<AnimGenData<T>, void, unknown>;

export interface AnimConfig<T> {
  steps: T[];
  duration: number;
  type?: "segments" | "stops";
  loop?: boolean;
}

export interface AnimationConfig<T> {
  config?: AnimConfig<T>;
  // generator
  genFunc?: () => AnimationGenerator<T>;
}

export interface UseAnimationProps<T> extends AnimationConfig<T> {
  //
  onCheckActive: () => boolean;
  onCheckPaused?: () => boolean;
  onAnimationEnd?: () => void;
  onAnimationFrame?: (value: T) => void;
  onDeactive?: () => void;
}

function configToGenerator<T>({
  duration,
  loop,
  steps,
  type = "segments",
}: Exclude<
  AnimationConfig<T>["config"],
  undefined
>): () => AnimationGenerator<T> {
  return function* stepsGen() {
    const len = steps.length;
    if (len === 0) {
      return;
    }
    const dt = type === "stops" ? duration / (len - 1) : duration / len;
    if (type === "segments") {
      do {
        for (const value of steps) {
          yield [value, dt];
        }
      } while (loop);
    } else if (type === "stops") {
      do {
        let i = 0;
        for (; i < len - 1; i++) {
          yield [steps[i], dt];
        }
        yield [steps[i], 0];
      } while (loop);
    }
  };
}

export default function useAnimation<T>({
  onCheckActive,
  onCheckPaused,
  onAnimationFrame,
  onAnimationEnd,
  onDeactive,
  genFunc,
  config,
}: UseAnimationProps<T>) {
  const state = useConst({
    nextTime: 0,
    lastIsActive: false,
    gen: null as any as AnimationGenerator<T>,

    genFunc: null as any as () => AnimationGenerator<T>,
    onCheckActive,
    onCheckPaused,
    onAnimationFrame,
    onAnimationEnd,
    onDeactive,
  });

  const _genFunc = useMemo(() => {
    if (genFunc) {
      return genFunc;
    } else if (config) {
      return configToGenerator(config);
    } else {
      return function* () {};
    }
  }, [genFunc, config]);

  useEffect(() => {
    state.genFunc = _genFunc;
    state.gen = _genFunc();
  }, [_genFunc]);

  useEffect(() => {
    state.onCheckActive = onCheckActive;
  }, [onCheckActive]);

  useEffect(() => {
    state.onCheckPaused = onCheckPaused;
  }, [onCheckPaused]);

  useEffect(() => {
    state.onAnimationFrame = onAnimationFrame;
  }, [onAnimationFrame]);

  useEffect(() => {
    state.onAnimationEnd = onAnimationEnd;
  }, [onAnimationEnd]);

  useEffect(() => {
    state.onDeactive = onDeactive;
  }, [onDeactive]);

  useFrame((_, time) => {
    const isActive = state.onCheckActive();
    const isPaused = state.onCheckPaused && state.onCheckPaused();

    if (isPaused) {
      return;
    }

    if (!isActive) {
      if (state.lastIsActive) {
        state.onDeactive?.();
      }
      state.lastIsActive = false;
      return;
    }

    if (!state.lastIsActive && isActive) {
      state.lastIsActive = true;
      state.gen = state.genFunc();
    }

    if (time > state.nextTime) {
      const { done, value } = state.gen.next();
      if (done) {
        state.onAnimationEnd?.();
      } else {
        // @ts-ignore
        const [val, dt] = value;
        state.onAnimationFrame?.(val);
        state.nextTime = Math.max(state.nextTime + dt, time);
      }
    }
  }, []);
}

const funcMap = {
  easeLinear,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeCircleIn,
  easeCircleOut,
  easeElasticIn,
  easeElasticOut,
  easeBounceIn,
  easeBounceOut,
  easeSinIn,
  easeSinOut,
  easeSinInOut,
  easeQuadInOut,
  easeExpOut,
  easeExpIn,
  easeQuadIn,
};

type SmoothType = keyof typeof funcMap;

export function smoothstep(
  from: number,
  to: number,
  steps: number,
  type: SmoothType
) {
  const dt = 1 / (steps - 1);
  const func = funcMap[type];

  const smaple: number[] = [0];

  for (let i = 1; i < steps - 1; i++) {
    smaple.push(func(i * dt));
  }
  smaple.push(1);

  const width = to - from;

  return smaple.map((v) => from + width * v);
}
