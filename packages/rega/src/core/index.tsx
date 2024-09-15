import { Vector } from "@dimforge/rapier2d";

import AnimationTree from "./components/Animation/AnimationTree";
import Transition from "./components/Animation/Transition";
import Animation from "./components/Animation/Animation";
import useAnimation, {
  smoothstep,
  AnimConfig,
} from "./components/Animation/useAnimation";
import AnimationPipe from "./components/Animation/AnimationPipe";

import Sprite2D from "./components/Sprite2D";
import Box2D from "./components/Box2D";
import Absolute from "./primitives/Absolute";
import Relative from "./primitives/Relative";
import Order from "./primitives/Order";
import useTransform from "./hooks/useTransform";
import Lens from "./components/Camera/Lens";
import Screen from "./components/Camera/Screen";
import TextureManager from "./common/texture_manager";
import Tilemap from "./components/Tilemap";

import RigidBody2D, { RigidBodyRef } from "./primitives/RigidBody2D";
import { ActiveCollisionTypes } from "./components/BaseCollider2D";
import Editor from "./components/Editor";
import FPS from "./components/FPS";

import ShapeCollider2D from "./components/ShapeCollider2D";
import ConvexCollider2D from "./components/ConvexCollider2D";
import TilemapCollider2D from "./components/TilemapCollider2D";
import useCharacterController from "./primitives/useCharacterController";

import useWindowInfo from "./hooks/useWindowInfo";
import useConst from "./hooks/useConst";
import usePhysicsInfo from "./hooks/usePhysicsInfo";
import {
  useBeforePhysicsFrame,
  useAfterPhysicsFrame,
} from "./primitives/Physics";

import SoundManager from "./common/sound_manager";
import SoundPlayer from "./components/SoundPlayer";
import useSoundPlayer from "./hooks/useSoundPlayer";

import BMPFont from "./components/UI/BMPFont";
import GUIView from "./components/UI/GUIView";
import View, { ViewStyle } from "./components/UI/View";
import Text from "./components/UI/Text";
import { TextStyle } from "./components/UI/SpriteText";

import {
  KeyboardInput,
  KeyboardVectorInput,
  useKeyboardMapping,
  useKeyboardInput,
} from "./components/InputSystem/KeyboardInput";
import {
  GamepadInput,
  useGamepadMapping,
  useGamepadInput,
} from "./components/InputSystem/GamepadInput";
import { mergeInputValues } from "./components/InputSystem/utils";

import useParticles, { Particle } from "./hooks/useParticles";

import { parseGodotTileData } from "./tools/godot";

const localStorage = globalThis.localStorage;

export type {
  Vector,
  RigidBodyRef,
  Particle,
  AnimConfig,
  ViewStyle,
  TextStyle,
};

export {
  // animations
  Animation,
  AnimationTree,
  Transition,
  AnimationPipe,
  useAnimation,
  smoothstep,

  // texture manager
  TextureManager,

  // transforms
  Relative,
  Absolute,
  useTransform,
  Order,

  // colliders
  RigidBody2D,
  useCharacterController,
  ShapeCollider2D,
  ConvexCollider2D,
  TilemapCollider2D,
  ActiveCollisionTypes,

  // input system
  KeyboardInput,
  KeyboardVectorInput,
  useKeyboardMapping,
  useKeyboardInput,
  GamepadInput,
  useGamepadMapping,
  useGamepadInput,
  mergeInputValues,

  // editor
  Editor,
  FPS,

  // camera
  Lens,
  Screen,

  // audio
  SoundManager,
  SoundPlayer,
  useSoundPlayer,

  // particles
  useParticles,

  //
  useWindowInfo,

  // tools
  parseGodotTileData,
  useConst,
  useBeforePhysicsFrame,
  useAfterPhysicsFrame,
  usePhysicsInfo,

  // components
  Tilemap,
  Box2D,
  Sprite2D,

  // ui
  BMPFont,
  View,
  Text,
  GUIView,
  localStorage,
};
