import { createContext } from "react";
import {
  ColliderDesc,
  RigidBody,
  Collider,
  RigidBodyDesc,
  KinematicCharacterController,
  Vector,
} from "@dimforge/rapier2d";

export type PhysicsFrameCallback = (
  deltaTime: number,
  time: number,
  step: number
) => void;

export interface CollisionItem<T extends any> {
  type: "enter" | "leave";
  userData: T;
  sendMessage: (msg: any) => void;
  contactData?: {
    normal: Vector;
    localNormal1: Vector;
    localNormal2: Vector;
    localContactPoints1: Vector[];
    localContactPoints2: Vector[];
    solverContacts: Vector[];
  };
}

export interface EventMapItem {
  getUserData?: () => any;
  onCollisionChange?: (items: CollisionItem<any>[]) => void;
  modifySolverContacts?: (
    normal: [number, number],
    point1: [number, number]
  ) => boolean;
}

export function createContextValues({
  minDistance,
  minVelocity,
  createCollider,
  removeCollider,
  getCollider,
  createRigidBody,
  removeRigidBody,
  createCharacterController,
  removeCharacterController,
  debugRender,
  upVector,
  timeStep = 1000 / 60, // 60 fps,
  getUserData,
}: {
  upVector: Vector;
  minDistance: number;
  minVelocity: number;
  createCollider: (desc: ColliderDesc, rigidBody?: RigidBody) => Collider;
  removeCollider: (collider: Collider) => void;
  getCollider: (handle: number) => Collider | undefined;
  createRigidBody(body: RigidBodyDesc): RigidBody;
  removeRigidBody(body: RigidBody): void;
  createCharacterController: (offset: number) => KinematicCharacterController;
  removeCharacterController: (controller: KinematicCharacterController) => void;
  getUserData: (handle: number) => any;
  debugRender: () => any;
  timeStep?: number;
}) {
  return {
    upVector,
    minDistance,
    minVelocity,
    createCollider,
    removeCollider,
    getCollider,
    createRigidBody,
    removeRigidBody,
    createCharacterController,
    removeCharacterController,
    getUserData,
    debugRender,
    step: 0,
    time: 0,
    rightBeforeFrameCallbacks: new Set<PhysicsFrameCallback>(),
    rightAfterFrameCallbacks: new Set<PhysicsFrameCallback>(),
    beforeFrameCallbacks: new Set<PhysicsFrameCallback>(),
    afterFrameCallbacks: new Set<PhysicsFrameCallback>(),
    timeStep,
    eventMap: new Map<number, EventMapItem>(),
    controllerColliderMap: new Map<string, number>(),
    colliderLisetenerMap: new Map<number, (msg: any) => void>(),
  };
}

export default createContext<ReturnType<typeof createContextValues>>({} as any);
