import wasmInit, { decode } from "wasm-image-decoder";
import { fetchBufferData } from "../../core/common/utils";

await wasmInit();

let UImage: {
  new (width?: number, height?: number): HTMLImageElement & {
    data: Uint8Array;
  };
};

// @ts-ignore
if (typeof Deno !== "undefined") {
  // @ts-ignore
  UImage = globalThis.__polyfill__.Image;
} else {
  UImage = class extends Image {
    data: Uint8Array = new Uint8Array();
    constructor() {
      super();
    }
    set src(url: string) {
      if (url) {
        fetchBufferData(url).then((res) => {
          const buff = decode(new Uint8Array(res.buffer), res.contentType);
          super.src = URL.createObjectURL(
            new Blob([res.buffer], { type: res.contentType })
          );
          this.data = buff;
        });
      }
    }
  };
}

export default UImage;
