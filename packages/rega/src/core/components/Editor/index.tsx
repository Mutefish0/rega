import React, { useEffect, useState } from "react";
import Relative from "../../primitives/Relative";
import Grid from "../Grid";
import Camera from "../../primitives/Camera";
import useWheels from "../../hooks/useWheels";
import Order from "../../primitives/Order";
import PhysicsDebuger from "../../primitives/PhysicsDebuger";

interface Props {
  showPhysicDebuger?: boolean;
  showIteractiveCamera?: boolean;
}

const LOCAL_INITIAL_POSITION = localStorage.getItem(
  "__REGA_EDITOR_CAMERA__POS_"
);

let timeout = 0;

const SPEED = 10;

function setLocalPosition(v: { x: number; y: number; z: number }) {
  clearTimeout(timeout);
  setTimeout(() => {
    localStorage.setItem("__REGA_EDITOR_CAMERA__POS_", JSON.stringify(v));
  }, 200);
}

const INITIAL_POSITION = LOCAL_INITIAL_POSITION
  ? JSON.parse(LOCAL_INITIAL_POSITION)
  : { x: 0, y: 0, z: 10 };

export default function Editor({
  showPhysicDebuger,
  showIteractiveCamera,
}: Props) {
  const [position, setPosition] = useState<{ x: number; y: number; z: number }>(
    INITIAL_POSITION
  );

  useWheels((dx, dy, opts) => {
    if (opts.ctrlKey) {
      setPosition((prev) => ({
        x: prev.x,
        y: prev.y,
        z: prev.z + dy * SPEED,
      }));
    } else {
      setPosition((prev) => ({
        x: prev.x + dx * SPEED,
        y: prev.y - dy * SPEED,
        z: prev.z,
      }));
    }
  });

  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  return (
    <>
      {/* <Grid color="rgba(0,0,0,0.15)" principleColor="rgba(125,0,0,0.3)" /> */}
      {!!showPhysicDebuger && (
        <Order order={1000}>
          <PhysicsDebuger />
        </Order>
      )}
      {!!showIteractiveCamera && (
        <>
          <Relative translation={position}>
            <Camera type="perspective" />
          </Relative>
        </>
      )}
    </>
  );
}
