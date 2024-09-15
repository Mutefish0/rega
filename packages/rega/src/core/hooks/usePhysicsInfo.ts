import { useContext } from "react";
import PhysicsContext from "../primitives/PhysicsContext";

export default function usePhysicsInfo() {
  const { timeStep } = useContext(PhysicsContext);
  return { timeStep };
}
