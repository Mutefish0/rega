import { Vector } from "@dimforge/rapier2d";

import RenderGroup from "./primitives/RenderGroup";
import RenderPipeline from "./primitives/RenderPipeline";
import { RenderPass, Pipeline } from "./render/pass";

import AnimationTree from "./components/Animation/AnimationTree";
import Transition from "./components/Animation/Transition";
import Animation from "./components/Animation/Animation";
import useAnimation, {
  smoothstep,
  AnimConfig,
} from "./components/Animation/useAnimation";
import AnimationPipe from "./components/Animation/AnimationPipe";

import SpriteMSDF from "./components/SpriteMSDF";
import Sprite2D from "./components/Sprite2D";
import Box2D from "./components/Box2D";
import Box3D from "./components/Box3D";
import Absolute from "./primitives/Absolute";
import Relative from "./primitives/Relative";
import ZIndex from "./primitives/ZIndex";
import useTransform from "./hooks/useTransform";

import DirectionalLight from "./components/Light/DirectionalLight";

import Camera from "./primitives/Camera";

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

import FontManager from "./common/font_manager";
import GUIView from "./components/UI/GUIView";
import GUICamera from "./components/UI/GUICamera";
import View, { ViewStyle } from "./components/UI/View";
import Text from "./components/UI/Text";
import Br from "./components/UI/Text/Br";
import { TextStyle } from "./components/UI/Text";

import useTextureBinding from "./hooks/useTextureBinding";

import useAirTag from "./hooks/useAirTag";

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

export { RenderGroup, RenderPipeline };
export type { RenderPass, Pipeline };

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
  ZIndex,

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
  Camera,

  // audio
  SoundManager,
  SoundPlayer,
  useSoundPlayer,

  // misc
  useAirTag,

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
  SpriteMSDF,
  Box3D,

  // ui
  FontManager,
  View,
  Text,
  Br,
  GUIView,
  GUICamera,
  localStorage,

  // lights
  DirectionalLight,
};

export { useTextureBinding };
