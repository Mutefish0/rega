import { createContext } from "react";
import { RigidBody } from "@dimforge/rapier2d";

export interface RigidBodyRef {
  rotation: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  commitVelocity: ({ x, y }: { x?: number; y?: number }) => void;
  commitPosition: ({ x, y }: { x?: number; y?: number }) => void;
  applyImpulse: ({ x, y }: { x: number; y: number }) => void;
  rigidBody: RigidBody;
}

export default createContext<RigidBodyRef>(null as any);
