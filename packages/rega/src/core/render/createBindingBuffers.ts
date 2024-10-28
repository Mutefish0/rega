import { MaterialJSON, TransferBinding } from "./types";

export default function createBindingBuffers(material: MaterialJSON) {
  const { bindings } = material;
  for (const bindGroup of bindings) {
    const { bindings } = bindGroup;
  }
}
