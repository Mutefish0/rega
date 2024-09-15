import { useEffect, useMemo } from "react";
import { GamepadEvent, GamepadKey } from "../../io/input";
import {
  gamepadEventSubject,
  gamepadLabeledMap,
  createGamepadData,
} from "./index";
import { mergeInputValues } from "./utils";

interface GamepadInputProps {
  onKeyChange: (value: number) => void;
  inputKey: GamepadKey;
  label: string;
}

export function useGamepadInput(label: string) {
  const gp = useMemo(() => {
    if (!gamepadLabeledMap.has(label)) {
      gamepadLabeledMap.set(label, createGamepadData());
    }
    return gamepadLabeledMap.get(label)!;
  }, []);
  return gp;
}

type InvertedValueKey = "-leftX" | "-leftY" | "-rightX" | "-rightY";
type MapValue = GamepadKey | InvertedValueKey;

type Config<T> = {
  [Property in keyof T]: MapValue | MapValue[];
};
type Mapping<T> = {
  [Property in keyof T]: number;
};

function assign<T>(
  mapping: Mapping<T>,
  record: Record<GamepadKey, number>,
  config: Config<T>
) {
  for (let key in config) {
    let conf = config[key];
    if (!Array.isArray(conf)) {
      conf = [conf];
    }
    const vs = conf.map((v) => {
      if (v.startsWith("-")) {
        return -record[v.slice(1) as GamepadKey];
      } else {
        return record[v as GamepadKey];
      }
    });
    const v = mergeInputValues(...vs);
    mapping[key] = v;
  }
  return mapping;
}

export function useGamepadMapping<T>(label: string, config: Config<T>) {
  const gp = useGamepadInput(label);
  const mapping = useMemo(
    () => assign({} as Mapping<T>, gp.gamepad, config),
    []
  );
  useEffect(() => {
    const sub = gamepadEventSubject.subscribe((e) => {
      if (e.index === gp.index) {
        assign(mapping, gp.gamepad, config);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  return mapping;
}

export function GamepadInput({
  inputKey,
  onKeyChange,
  label,
}: GamepadInputProps) {
  const gp = useGamepadInput(label);

  function keyHandler(e: GamepadEvent) {
    if (gp.index === e.index) {
      const keyVal = e.changedKeys[inputKey];
      if (typeof keyVal === "number") {
        onKeyChange(keyVal);
      }
    }
  }

  useEffect(() => {
    const sub = gamepadEventSubject.subscribe(keyHandler);
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return null;
}
