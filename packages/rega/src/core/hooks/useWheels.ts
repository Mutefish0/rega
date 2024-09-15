import { useEffect, useState, RefObject } from "react";
import {
  Matrix4,
  Camera,
  Vector2,
  Vector3,
  Raycaster,
  Plane,
} from "three/webgpu";

function screenToWorld({ x, y, camera }: any) {
  const worldPosition = new Vector3();
  const plane = new Plane(camera.getWorldDirection(new Vector3()));

  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2(x, y), camera);
  return raycaster.ray.intersectPlane(plane, worldPosition)!;
}

const MOVE_SPEED = 1 / 2000;
const ZOOM_SPEED = 1 / 100;

export default function useWheels(ref: RefObject<Camera | undefined>) {
  const [mat, setMat] = useState<Matrix4>();

  function handleWheels(e: WheelEvent) {
    const camera = ref.current;
    if (camera) {
      const { deltaX, deltaY } = e;
      const nextMat = new Matrix4();

      if (e.ctrlKey) {
        const dy = -deltaY * ZOOM_SPEED;
        const dir = camera.getWorldDirection(new Vector3());

        const z = Math.abs(camera.position.z);

        dir.multiplyScalar(dy * z);
        nextMat.makeTranslation(dir);
      } else {
        const worldWidth =
          screenToWorld({
            x: 1,
            y: 0,
            camera,
          }).x -
          screenToWorld({
            x: -1,
            y: 0,
            camera,
          }).x;

        const worldHeight =
          screenToWorld({
            x: 0,
            y: 1,
            camera,
          }).y -
          screenToWorld({
            x: 0,
            y: -1,
            camera,
          }).y;
        const dx = deltaX * MOVE_SPEED;
        const dy = -deltaY * MOVE_SPEED;
        nextMat.makeTranslation(dx * worldWidth, dy * worldHeight, 0);
      }

      setMat(nextMat);

      e.preventDefault();
    }
  }

  useEffect(() => {
    // web
    // @ts-ignore
    if (typeof Deno === "undefined") {
      document.addEventListener("wheel", handleWheels, { passive: false });
      return () => document.removeEventListener("wheel", handleWheels);
    }
  }, []);

  return mat;
}
