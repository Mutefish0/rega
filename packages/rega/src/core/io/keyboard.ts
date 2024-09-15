import { KeyboardKey } from "./input";

// @ts-ignore
const env = typeof Deno === "undefined" ? "web" : "deno";

const GLFW_KEY_SPACE = 32;

const GLFW_KEY_0 = 48;
const GLFW_KEY_1 = 49;
const GLFW_KEY_2 = 50;
const GLFW_KEY_3 = 51;
const GLFW_KEY_4 = 52;
const GLFW_KEY_5 = 53;
const GLFW_KEY_6 = 54;
const GLFW_KEY_7 = 55;
const GLFW_KEY_8 = 56;
const GLFW_KEY_9 = 57;

const GLFW_KEY_MINUS = 45; /* - */
const GLFW_KEY_EQUAL = 61; /* = */

const GLFW_KEY_A = 65;
const GLFW_KEY_B = 66;
const GLFW_KEY_C = 67;
const GLFW_KEY_D = 68;
const GLFW_KEY_E = 69;
const GLFW_KEY_F = 70;
const GLFW_KEY_G = 71;
const GLFW_KEY_H = 72;
const GLFW_KEY_I = 73;
const GLFW_KEY_J = 74;
const GLFW_KEY_K = 75;
const GLFW_KEY_L = 76;
const GLFW_KEY_M = 77;
const GLFW_KEY_N = 78;
const GLFW_KEY_O = 79;
const GLFW_KEY_P = 80;
const GLFW_KEY_Q = 81;
const GLFW_KEY_R = 82;
const GLFW_KEY_S = 83;
const GLFW_KEY_T = 84;
const GLFW_KEY_U = 85;
const GLFW_KEY_V = 86;
const GLFW_KEY_W = 87;
const GLFW_KEY_X = 88;
const GLFW_KEY_Y = 89;
const GLFW_KEY_Z = 90;

const GLFW_KEY_ESCAPE = 256;
const GLFW_KEY_ENTER = 257;
const GLFW_KEY_TAB = 258;
const GLFW_KEY_BACKSPACE = 259;

const GLFW_KEY_RIGHT = 262;
const GLFW_KEY_LEFT = 263;
const GLFW_KEY_DOWN = 264;
const GLFW_KEY_UP = 265;

const GLFW_KEY_F1 = 290;
const GLFW_KEY_F2 = 291;
const GLFW_KEY_F3 = 292;
const GLFW_KEY_F4 = 293;
const GLFW_KEY_F5 = 294;
const GLFW_KEY_F6 = 295;
const GLFW_KEY_F7 = 296;
const GLFW_KEY_F8 = 297;
const GLFW_KEY_F9 = 298;
const GLFW_KEY_F10 = 299;
const GLFW_KEY_F11 = 300;
const GLFW_KEY_F12 = 301;

const GLFW_KEY_LEFT_SHIFT = 340;
const GLFW_KEY_LEFT_CONTROL = 341;
const GLFW_KEY_LEFT_ALT = 342;
const GLFW_KEY_LEFT_SUPER = 343;
const GLFW_KEY_RIGHT_SHIFT = 344;
const GLFW_KEY_RIGHT_CONTROL = 345;
const GLFW_KEY_RIGHT_ALT = 346;
const GLFW_KEY_RIGHT_SUPER = 347;

const glfwkeyCodeMap: Record<number, KeyboardKey> = {
  [GLFW_KEY_RIGHT]: "ArrowRight",
  [GLFW_KEY_LEFT]: "ArrowLeft",
  [GLFW_KEY_DOWN]: "ArrowDown",
  [GLFW_KEY_UP]: "ArrowUp",
  [GLFW_KEY_ENTER]: "Enter",
  [GLFW_KEY_ESCAPE]: "Escape",
  [GLFW_KEY_BACKSPACE]: "Backspace",
  [GLFW_KEY_LEFT_ALT]: "Alt",
  [GLFW_KEY_RIGHT_ALT]: "Alt",
  [GLFW_KEY_LEFT_SUPER]: "Meta",
  [GLFW_KEY_RIGHT_SUPER]: "Meta",
  [GLFW_KEY_TAB]: "Tab",
  [GLFW_KEY_MINUS]: "-",
  [GLFW_KEY_EQUAL]: "=",

  [GLFW_KEY_A]: "a",
  [GLFW_KEY_B]: "b",
  [GLFW_KEY_C]: "c",
  [GLFW_KEY_D]: "d",
  [GLFW_KEY_E]: "e",
  [GLFW_KEY_F]: "f",
  [GLFW_KEY_G]: "g",
  [GLFW_KEY_H]: "h",
  [GLFW_KEY_I]: "i",
  [GLFW_KEY_J]: "j",
  [GLFW_KEY_K]: "k",
  [GLFW_KEY_L]: "l",
  [GLFW_KEY_M]: "m",
  [GLFW_KEY_N]: "n",
  [GLFW_KEY_O]: "o",
  [GLFW_KEY_P]: "p",
  [GLFW_KEY_Q]: "q",
  [GLFW_KEY_R]: "r",
  [GLFW_KEY_S]: "s",
  [GLFW_KEY_T]: "t",
  [GLFW_KEY_U]: "u",
  [GLFW_KEY_V]: "v",
  [GLFW_KEY_W]: "w",
  [GLFW_KEY_X]: "x",
  [GLFW_KEY_Y]: "y",
  [GLFW_KEY_Z]: "z",
  [GLFW_KEY_SPACE]: " ",
  [GLFW_KEY_0]: "0",
  [GLFW_KEY_1]: "1",
  [GLFW_KEY_2]: "2",
  [GLFW_KEY_3]: "3",
  [GLFW_KEY_4]: "4",
  [GLFW_KEY_5]: "5",
  [GLFW_KEY_6]: "6",
  [GLFW_KEY_7]: "7",
  [GLFW_KEY_8]: "8",
  [GLFW_KEY_9]: "9",
  [GLFW_KEY_F1]: "F1",
  [GLFW_KEY_F2]: "F2",
  [GLFW_KEY_F3]: "F3",
  [GLFW_KEY_F4]: "F4",
  [GLFW_KEY_F5]: "F5",
  [GLFW_KEY_F6]: "F6",
  [GLFW_KEY_F7]: "F7",
  [GLFW_KEY_F8]: "F8",
  [GLFW_KEY_F9]: "F9",
  [GLFW_KEY_F10]: "F10",
  [GLFW_KEY_F11]: "F11",
  [GLFW_KEY_F12]: "F12",
  [GLFW_KEY_LEFT_SHIFT]: "Shift",
  [GLFW_KEY_RIGHT_SHIFT]: "Shift",
  [GLFW_KEY_LEFT_CONTROL]: "Control",
  [GLFW_KEY_RIGHT_CONTROL]: "Control",
};

const map: Map<Function, Function> = new Map();

export const keyboadAddEventListener =
  env === "deno"
    ? function (event: string, func: (e: KeyboardEvent) => void) {
        const f = function (e: KeyboardEvent) {
          // @ts-ignore
          e.key = glfwkeyCodeMap[e.keyCode];
          func(e);
        };
        // @ts-ignore
        self.addEventListener(event, f);
        map.set(func, f);
      }
    : function (event: string, func: (e: KeyboardEvent) => void) {
        //@ts-ignore
        window.addEventListener(event, func);
      };

export const keyboadRemoveEventListener =
  env === "deno"
    ? function (event: string, func: (e: KeyboardEvent) => void) {
        // @ts-ignore
        self.removeEventListener(event, map.get(func));
      }
    : function (event: string, func: (e: KeyboardEvent) => void) {
        // @ts-ignore
        window.removeEventListener(event, func);
      };
