import React, { useEffect, useRef, useState } from "react";
import { Vector3, Camera } from "three/webgpu";
import Relative from "../../primitives/Relative";
import Grid from "../Grid";
import Lens from "../Camera/Lens";
import Screen from "../Camera/Screen";
import useWheels from "../../hooks/useWheels";
import PhysicsDebuger from "../../primitives/PhysicsDebuger";
import Order from "../../primitives/Order";

interface Props {
  showPhysicDebuger?: boolean;
  showIteractiveCamera?: boolean;
  children: React.ReactNode;
}

const LOCAL_INITIAL_POSITION = localStorage.getItem(
  "__REGA_EDITOR_CAMERA__POS_"
);

let timeout = 0;
function setLocalPosition(v: Vector3) {
  clearTimeout(timeout);
  setTimeout(() => {
    localStorage.setItem(
      "__REGA_EDITOR_CAMERA__POS_",
      JSON.stringify([v.x, v.y, v.z])
    );
  }, 200);
}

const INITIAL_POSITION = LOCAL_INITIAL_POSITION
  ? new Vector3(...JSON.parse(LOCAL_INITIAL_POSITION))
  : new Vector3(0, 0, 10);

export default function Editor({
  children,
  showPhysicDebuger,
  showIteractiveCamera,
}: Props) {
  const cameraRef = useRef<Camera>();

  const [position, setPosition] = useState(INITIAL_POSITION);

  const mat = useWheels(cameraRef);

  useEffect(() => {
    if (mat) {
      setPosition((prev) => {
        const p = prev.clone().applyMatrix4(mat);
        setLocalPosition(p);
        return p;
      });
    }
  }, [mat]);

  return (
    <>
      <Grid color="rgba(0,0,0,0.15)" principleColor="rgba(125,0,0,0.3)" />
      {children}
      {!!showPhysicDebuger && <PhysicsDebuger />}
      {!!showIteractiveCamera && (
        <>
          <Screen root screenId="__editorCamera__" />
          <Relative translation={position}>
            <Lens
              cameraRef={cameraRef}
              type="perspective"
              screenId="__editorCamera__"
            />
          </Relative>
        </>
      )}
    </>
  );
}
