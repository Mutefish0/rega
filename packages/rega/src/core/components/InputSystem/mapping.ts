import { GamepadKey } from "../../io/input";

interface Mapping {
  buttons: Array<GamepadKey>;
  axis: Array<GamepadKey>;
}

// Nintendo Switch Pro Controller, a:b0,b:b1,back:b8,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,guide:b12,leftshoulder:b4,leftstick:b10,lefttrigger:b6,leftx:a0,lefty:a1,misc1:b13,rightshoulder:b5,rightstick:b11,righttrigger:b7,rightx:a2,righty:a3,start:b9,x:b2,y:b3,platform:Windows
// Nintendo Switch Pro Controller, a:b0,b:b1,back:b8,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,guide:b12,leftshoulder:b4,leftstick:b10,lefttrigger:b6,leftx:a0,lefty:a1,rightshoulder:b5,rightstick:b11,righttrigger:b7,rightx:a2,righty:a3,start:b9,x:b2,y:b3,platform:Mac OS X,

export const SWITCH_PRO: Mapping = {
  buttons: [
    "b",
    "a",
    "y",
    "x",
    "leftBumper",
    "rightBumper",
    "leftTrigger",
    "rightTrigger",
    "back",
    "start",
    "leftStick",
    "rightStick",
    "guide",
    "dpadLeft",
    "dpadRight",
    "dpadUp",
    "dpadDown",
  ],
  axis: ["leftX", "leftY", "rightX", "rightY"],
};
