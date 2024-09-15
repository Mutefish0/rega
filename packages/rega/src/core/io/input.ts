export type KeyboardKey =
  | "Meta"
  | "Shift"
  | "Control"
  | "Escape"
  | "Backspace"
  | "Tab"
  | "Alt"
  | " "
  | "-"
  | "="
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export const DEFAULT_KEYBOARD_MAP: Record<KeyboardKey, number> = {
  Meta: 0,
  Shift: 0,
  Control: 0,
  Escape: 0,
  Backspace: 0,
  Tab: 0,
  Alt: 0,
  " ": 0,
  "-": 0,
  "=": 0,
  F1: 0,
  F2: 0,
  F3: 0,
  F4: 0,
  F5: 0,
  F6: 0,
  F7: 0,
  F8: 0,
  F9: 0,
  F10: 0,
  F11: 0,
  F12: 0,
  ArrowUp: 0,
  ArrowDown: 0,
  ArrowLeft: 0,
  ArrowRight: 0,
  Enter: 0,
  a: 0,
  b: 0,
  c: 0,
  d: 0,
  e: 0,
  f: 0,
  g: 0,
  h: 0,
  i: 0,
  j: 0,
  k: 0,
  l: 0,
  m: 0,
  n: 0,
  o: 0,
  p: 0,
  q: 0,
  r: 0,
  s: 0,
  t: 0,
  u: 0,
  v: 0,
  w: 0,
  x: 0,
  y: 0,
  z: 0,
  "0": 0,
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0,
};

export interface KeyboardEvent {
  type: "keyboard";
  changedKeys: Partial<Record<KeyboardKey, number>>;
}

export type GamepadKey =
  | "leftX"
  | "leftY"
  | "rightX"
  | "rightY"
  | "a"
  | "b"
  | "x"
  | "y"
  | "dpadLeft"
  | "dpadRight"
  | "dpadUp"
  | "dpadDown"
  | "leftBumper"
  | "rightBumper"
  | "leftTrigger"
  | "rightTrigger"
  | "leftStick"
  | "rightStick"
  | "back"
  | "start"
  | "guide";

export const DEFAULT_GAMEPAD_MAP: Record<GamepadKey, number> = {
  leftX: 0,
  leftY: 0,
  rightX: 0,
  rightY: 0,
  a: 0,
  b: 0,
  x: 0,
  y: 0,
  dpadLeft: 0,
  dpadRight: 0,
  dpadUp: 0,
  dpadDown: 0,
  leftBumper: 0,
  rightBumper: 0,
  leftTrigger: 0,
  rightTrigger: 0,
  leftStick: 0,
  rightStick: 0,
  back: 0,
  start: 0,
  guide: 0,
};

export interface GamepadEvent {
  type: "gamepad";
  index: number;
  changedKeys: Partial<Record<GamepadKey, number>>;
}
