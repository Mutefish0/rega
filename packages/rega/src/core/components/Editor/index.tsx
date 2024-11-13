import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "pure3";
import Relative from "../../primitives/Relative";
import Grid from "../Grid";
import Camera from "../../primitives/Camera";
import useWheels from "../../hooks/useWheels";
import Order from "../../primitives/Order";
import PhysicsDebuger from "../../primitives/PhysicsDebuger";

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
  const [position, setPosition] = useState(INITIAL_POSITION);

  useWheels(handleWheel);

  function handleWheel(dx: number, dy: number) {
    //
  }

  // useEffect(() => {
  //   if (mat) {
  //     setPosition((prev) => {
  //       const p = prev.clone().applyMatrix4(mat);
  //       setLocalPosition(p);
  //       return p;
  //     });
  //   }
  // }, [mat]);

  return (
    <>
      {/* <Grid color="rgba(0,0,0,0.15)" principleColor="rgba(125,0,0,0.3)" /> */}
      {children}
      {!!showPhysicDebuger && (
        <Order order={1000}>
          <PhysicsDebuger />
        </Order>
      )}
      {/* {!!showIteractiveCamera && (
        <>
          <Relative translation={position}>
            <Camera type="perspective" />
          </Relative>
        </>
      )} */}
    </>
  );
}
