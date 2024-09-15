import { Subject } from "rxjs";
import { useEffect } from "react";
import {
  KeyboardEvent,
  KeyboardKey,
  GamepadEvent,
  GamepadKey,
  DEFAULT_GAMEPAD_MAP,
  DEFAULT_KEYBOARD_MAP,
} from "../../io/input";
import useFrame from "../../hooks/useFrame";
import {
  keyboadAddEventListener,
  keyboadRemoveEventListener,
} from "../../io/keyboard";
import difference from "lodash/difference";

import { SWITCH_PRO } from "./mapping";

export const keyboardEventSubject = new Subject<KeyboardEvent>();
export const keyboardMap: Record<KeyboardKey, number> = {
  ...DEFAULT_KEYBOARD_MAP,
};

export const gamepadEventSubject = new Subject<GamepadEvent>();
export const gamepadLabeledMap: Map<
  string,
  { index: number; gamepad: Record<GamepadKey, number> }
> = new Map();
export function createGamepadData() {
  return {
    index: -1,
    gamepad: { ...DEFAULT_GAMEPAD_MAP },
  };
}

function round(value: number) {
  const pow = 100000; // Math.pow(10, precision);
  return Math.round(value * pow) / pow;
}

function assignDiff(gp: Record<GamepadKey, number>, gamepad: Gamepad) {
  const chagedItems: Array<[GamepadKey, number]> = [];
  for (let j = 0; j < gamepad.buttons.length; j++) {
    const button = gamepad.buttons[j];
    const key = SWITCH_PRO.buttons[j];
    const keyVal = button.pressed ? 1 : 0;
    if (gp[key] !== keyVal) {
      chagedItems.push([key, keyVal]);
      gp[key] = keyVal;
    }
  }
  for (let j = 0; j < gamepad.axes.length; j++) {
    const key = SWITCH_PRO.axis[j];
    const keyVal = round(gamepad.axes[j]);
    if (gp[key] !== keyVal) {
      chagedItems.push([key, keyVal]);
      gp[key] = keyVal;
    }
  }
  return chagedItems;
}

function assignDiff2(
  gp: Record<GamepadKey, number>,
  gp2: Record<GamepadKey, number>
) {
  const chagedItems: Array<[GamepadKey, number]> = [];
  for (const key in gp2) {
    if (gp[key as GamepadKey] !== gp2[key as GamepadKey]) {
      chagedItems.push([key as GamepadKey, gp2[key as GamepadKey]]);
      gp[key as GamepadKey] = gp2[key as GamepadKey];
    }
  }
  return chagedItems;
}

export default function InputSystem() {
  useEffect(() => {
    const handleKeydown = (event: globalThis.KeyboardEvent) => {
      keyboardMap[event.key as KeyboardKey] = 1;
      keyboardEventSubject.next({
        type: "keyboard",
        changedKeys: { [event.key as KeyboardKey]: 1 },
      });
    };
    const handleKeyup = (event: globalThis.KeyboardEvent) => {
      keyboardMap[event.key as KeyboardKey] = 0;
      keyboardEventSubject.next({
        type: "keyboard",
        changedKeys: { [event.key as KeyboardKey]: 0 },
      });
    };

    keyboadAddEventListener("keydown", handleKeydown);
    keyboadAddEventListener("keyup", handleKeyup);
    return () => {
      keyboadRemoveEventListener("keydown", handleKeydown);
      keyboadRemoveEventListener("keyup", handleKeyup);
    };
  }, []);

  useFrame(() => {
    const gamepads = navigator.getGamepads().filter((x) => !!x) as Gamepad[];

    const signedIndics: Record<number, string> = {};
    const unsignedLabels: string[] = [];

    const resolvedLabels: string[] = [];
    const allLabels: string[] = [];

    gamepadLabeledMap.forEach((v, k) => {
      if (v.index >= 0) {
        signedIndics[v.index] = k;
      } else {
        unsignedLabels.push(k);
      }
      allLabels.push(k);
    });

    for (let i = 0; i < gamepads.length; i++) {
      const index = gamepads[i].index;
      let label = "";
      if (signedIndics[index]) {
        label = signedIndics[index];
      } else {
        if (unsignedLabels.length > 0) {
          // connected
          label = unsignedLabels.pop()!;
          gamepadLabeledMap.get(label)!.index = index;
          console.log("Gamepad connected: ", label);
        }
      }
      if (label) {
        resolvedLabels.push(label);
        const gp = gamepadLabeledMap.get(label)!;
        const gamepad = gamepads[i];
        const changedItems = assignDiff(gp.gamepad, gamepad);
        if (changedItems.length > 0) {
          gamepadEventSubject.next({
            type: "gamepad",
            index: i,
            changedKeys: Object.fromEntries(changedItems),
          });
        }
      }
    }
    const unresolvedLabels = difference(allLabels, resolvedLabels);
    for (const lable of unresolvedLabels) {
      const gp = gamepadLabeledMap.get(lable)!;
      if (gp.index >= 0) {
        // disconnected
        console.log("Gamepad disconnected: ", lable);
        gp.index = -1;
        const changedItems = assignDiff2(gp.gamepad, DEFAULT_GAMEPAD_MAP);
        if (changedItems.length > 0) {
          gamepadEventSubject.next({
            type: "gamepad",
            index: gp.index,
            changedKeys: Object.fromEntries(changedItems),
          });
        }
      }
    }
  }, []);

  return null;
}
