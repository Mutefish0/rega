import { useEffect, useMemo, useContext } from "react";
import ThreeContext from "../../primitives/ThreeContext";
import {
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
  Vector4,
  Camera,
} from "three/webgpu";
import useTransform from "../../hooks/useTransform";

type CameraType = "perspective" | "orthographic";

type Props<T extends CameraType> = (PerspectiveProps | OrthographicProps) & {
  screenId: string;
  type: T;
  cameraRef?: React.MutableRefObject<Camera | undefined>;
};

interface PerspectiveProps {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
}
function PerspectiveLens({
  camera,
  fov,
  aspect,
  near,
  far,
}: PerspectiveProps & {
  camera: PerspectiveCamera;
}) {
  useEffect(() => {
    camera.fov = fov ?? 50;
    camera.updateProjectionMatrix();
  }, [fov]);

  useEffect(() => {
    camera.aspect = aspect ?? 1;
    camera.updateProjectionMatrix();
  }, [aspect]);

  useEffect(() => {
    camera.near = near ?? 0.1;
    camera.updateProjectionMatrix();
  }, [near]);

  useEffect(() => {
    camera.far = far ?? 1000;
    camera.updateProjectionMatrix();
  }, [far]);

  return null;
}

interface OrthographicProps {
  width?: number;
  height?: number;
  near?: number;
  far?: number;
}
function OrthographicLens({
  camera,
  width,
  height,
  near,
  far,
}: OrthographicProps & {
  camera: OrthographicCamera;
}) {
  useEffect(() => {
    if (typeof width !== "undefined") {
      const half = width / 2;
      camera.left = -half;
      camera.right = half;
    }
  }, [width]);

  useEffect(() => {
    if (typeof height !== "undefined") {
      const half = height / 2;
      camera.top = half;
      camera.bottom = -half;
    }
  }, [height]);

  useEffect(() => {
    camera.near = near ?? 0.1;
    camera.updateProjectionMatrix();
  }, [near]);

  useEffect(() => {
    camera.far = far ?? 1000;
    camera.updateProjectionMatrix();
  }, [far]);

  return null;
}

export default function Lens<T extends CameraType>({
  screenId,
  type,
  cameraRef,
  ...rest
}: Props<T>) {
  const camera = useMemo(
    () =>
      type === "orthographic"
        ? new OrthographicCamera()
        : new PerspectiveCamera(),
    []
  );

  const ctx = useContext(ThreeContext);
  const trans = useTransform();

  useEffect(() => {
    // @ts-ignore
    camera.cid = screenId;
    // @ts-ignore
    camera.viewport = new Vector4();
    camera.coordinateSystem = 2001;
  }, []);

  useEffect(() => {
    // @ts-ignore
    camera.position.copy(trans.transform.translation);
    // @ts-ignore
    camera.rotation.setFromVector3(trans.transform.rotation as Vector3);
    camera.updateWorldMatrix(false, false);
    camera.updateProjectionMatrix();
  }, [trans.transform.translation]);

  useEffect(() => {
    // @ts-ignore
    ctx.camera.cameras.push(camera);

    if (cameraRef) {
      cameraRef.current = camera;
    }

    return () => {
      // @ts-ignore
      const idx = ctx.camera.cameras.indexOf(camera);
      if (idx > -1) {
        ctx.camera.cameras.splice(idx, 1);
      }
      if (cameraRef) {
        cameraRef.current = undefined;
      }
    };
  }, []);

  if (type === "orthographic") {
    return <OrthographicLens camera={camera as OrthographicCamera} {...rest} />;
  } else {
    return (
      <PerspectiveLens
        camera={camera as PerspectiveCamera}
        {...(rest as PerspectiveProps)}
      />
    );
  }
}
