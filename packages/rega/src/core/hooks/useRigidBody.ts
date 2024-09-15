import { useContext } from "react";
import RigidBodyContext from "../primitives/RigidBodyContext";

export default function useRigidBody() {
  return useContext(RigidBodyContext);
}
