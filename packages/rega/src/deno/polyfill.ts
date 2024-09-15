// @ts-ignore
import { AudioContext } from "https://jsr.io/@mutefish/web-audio-api/0.1.4/mod.ts";
// @ts-ignore
import { Image as UImage } from "jsr:@gfx/canvas@0.5.6";
import { resolvePath } from "utils";
import wasmInit, { decode } from "wasm-image-decoder";
// @ts-ignore
import { getGamepads } from "jsr:@mutefish/gamepad-api";

navigator.getGamepads = getGamepads;

await wasmInit;

function getMimeByUrl(url: string) {
  let mime = "image/png";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) {
    mime = "image/jpeg";
  } else if (url.endsWith(".webp")) {
    mime = "image/webp";
  } else if (url.endsWith(".gif")) {
    mime = "image/gif";
  } else if (url.endsWith(".bmp")) {
    mime = "image/bmp";
  } else if (url.endsWith(".ico")) {
    mime = "image/x-icon";
  } else if (url.endsWith(".png")) {
    mime = "image/png";
  }
  return mime;
}

async function fetchOrReadData(
  url: string
): Promise<{ contentType: string; buffer: Uint8Array }> {
  const uri = resolvePath("." + url, import.meta.url);
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    const response = await fetch(uri);
    let contentType = response.headers.get("content-type") as string;
    if (contentType === "image/x-ms-bmp") {
      contentType = "image/bmp";
    }
    const buffer = new Uint8Array(await response.arrayBuffer());
    return {
      contentType,
      buffer,
    };
  } else {
    const contentType = getMimeByUrl(uri);
    // @ts-ignore
    const buffer = Deno.readFileSync(uri);
    return {
      contentType,
      buffer,
    };
  }
}

async function fetchBufferData(url: string) {
  const res = await fetchOrReadData(url);
  return { buffer: res.buffer.buffer, contentType: res.contentType };
}

class Image extends UImage {
  data: Uint8Array = new Uint8Array();

  constructor() {
    super();
  }

  set src(url: string) {
    if (url) {
      // @ts-ignore
      fetchOrReadData(url).then((res) => {
        super.src = res.buffer;
        this.data = decode(res.buffer, res.contentType);
      });
    }
  }
}

const __polyfill__ = {
  Image,
  fetchBufferData,
};

// @ts-ignore
globalThis.AudioContext = AudioContext;
// @ts-ignore
globalThis.__polyfill__ = __polyfill__;
