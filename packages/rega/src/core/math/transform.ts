import { Vector3Like, Matrix4, Vector3, Quaternion, Euler } from "three/webgpu";

interface Transform {
  translation: Vector3Like;
  rotation: Vector3Like;
  scale: Vector3Like;
}

export function transformToMatrix({
  translation,
  rotation,
}: Partial<Transform>) {
  if (rotation || translation) {
    const matRX = new Matrix4();
    const matRY = new Matrix4();
    const matRZ = new Matrix4();
    const matT = new Matrix4();
    if (rotation) {
      matRX.makeRotationX(rotation.x);
      matRY.makeRotationY(rotation.y);
      matRZ.makeRotationZ(rotation.z);
    }
    if (translation) {
      matT.setPosition(translation.x, translation.y, translation.z);
    }
    return matT.multiply(matRZ).multiply(matRY).multiply(matRX);
  }

  return new Matrix4();
}

export function matrixToTransform(matrix: Matrix4): Transform {
  const translation = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();

  matrix.decompose(translation, quaternion, scale);

  const rotation = new Euler().setFromQuaternion(quaternion)!;

  return { translation, scale, rotation };
}
