import { MaterialJSON, TransferInput, TransferBinding } from "./types";

class RenderObject {
  public material: MaterialJSON;
  public id: string = crypto.randomUUID();
  public input: TransferInput;
  public bindings: TransferBinding[];

  constructor(
    material: MaterialJSON,
    input: TransferInput,
    bindings: TransferBinding[]
  ) {
    this.material = material;
    this.input = input;
    this.bindings = bindings;
  }
}

export default RenderObject;
