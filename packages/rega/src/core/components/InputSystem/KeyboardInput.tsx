import { useEffect, useMemo } from "react";
import { KeyboardEvent, KeyboardKey } from "../../io/input";
import { keyboardEventSubject, keyboardMap } from "./index";
import { mergeInputValues } from "./utils";

interface KeyboardInputProps {
  onKeyChange: (value: number) => void;
  inputKey: KeyboardKey;
}

function toVectorInput(min: number, max: number) {
  let ret = 0;
  if ((min === 0 && max === 0) || (min === 1 && max === 1)) {
    ret = 0;
  } else if (min === 1) {
    ret = -1;
  } else if (max === 1) {
    ret = 1;
  }
  return ret;
}

export function KeyboardInput({ inputKey, onKeyChange }: KeyboardInputProps) {
  function keyHandler(e: KeyboardEvent) {
    const keyVal = e.changedKeys[inputKey];
    if (typeof keyVal !== "undefined") {
      onKeyChange(keyVal);
    }
  }
  useEffect(() => {
    const sub = keyboardEventSubject.subscribe(keyHandler);
    return () => {
      sub.unsubscribe();
    };
  }, []);

  return null;
}
interface InputAixsProps {
  onKeyChange: (value: number) => void;
  keyMin: KeyboardKey;
  keyMax: KeyboardKey;
}

export function KeyboardVectorInput({
  keyMin,
  keyMax,
  onKeyChange,
}: InputAixsProps) {
  function keyHandler() {
    const keyValMin = keyboardMap[keyMin];
    const keyValMax = keyboardMap[keyMax];
    const keyVal = toVectorInput(keyValMin, keyValMax);
    onKeyChange(keyVal);
  }
  return (
    <>
      <KeyboardInput inputKey={keyMin} onKeyChange={keyHandler} />
      <KeyboardInput inputKey={keyMax} onKeyChange={keyHandler} />
    </>
  );
}

export function useKeyboardInput() {
  return keyboardMap;
}

type MapValue = KeyboardKey | { min: KeyboardKey; max: KeyboardKey };

type Config<T> = {
  [Property in keyof T]: MapValue | MapValue[];
};
type Mapping<T> = {
  [Property in keyof T]: number;
};

function assign<T>(
  mapping: Mapping<T>,
  record: Record<KeyboardKey, number>,
  config: Config<T>
) {
  for (let key in config) {
    let conf = config[key];
    if (!Array.isArray(conf)) {
      conf = [conf];
    }
    const vs = conf.map((v) => {
      if (typeof v === "object") {
        return toVectorInput(record[v.min], record[v.max]);
      } else {
        return record[v];
      }
    });
    const v = mergeInputValues(...vs);
    mapping[key] = v;
  }
  return mapping;
}

export function useKeyboardMapping<T>(config: Config<T>) {
  const input = useKeyboardInput();
  const mapping = useMemo(() => assign({} as Mapping<T>, input, config), []);

  useEffect(() => {
    const sub = keyboardEventSubject.subscribe(() => {
      assign(mapping, input, config);
    });
    return () => sub.unsubscribe();
  }, []);

  return mapping;
}
