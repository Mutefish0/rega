# Wasm Image Decoder

Decodes images using Rust's `image` crate compiled to WebAssembly. By default it uses 4 threads (though some decoders are single-threaded) since it doesn't seem to get much faster if I add any more. You can edit `mod.js` to change the number of threads.

Works in the browser and in Deno.

**Note**: This can only be used within a Web Worker due to wasm not supporting blocking/waiting operations when executed in the main thread ([related comment](https://github.com/GoogleChromeLabs/wasm-bindgen-rayon/pull/7#issuecomment-828569860)). You can use [`comlink`](https://github.com/GoogleChromeLabs/comlink) to make it easy to use this module from the main thread.

(**Edit:** The following paragraph applies for v0.0.5 - I haven't tested later versions) As of writing it's about 3x slower than native Rust. Drawing the image to an `OffscreenCanvas` and then extracting the image data is the same speed as native Rust, so use that if your JS runtime has it available. The communication overhead between JS and the wasm module is negligible, so the slowness is probably due to missing functionality and lack of optimisation in wasm runtimes (e.g. thread/simd/etc. optimisations), so the performance should improve with time.

## File Formats Supported

It supports decoding PNG, JPEG, WEBP, GIF, BMP, ICO, TGA, and several others, but some formats don't have full support as of writing (Dec 2022). [See here](https://github.com/image-rs/image/tree/v0.24.5#supported-image-formats) for the support table. Check the [latest image-rs readme](https://github.com/image-rs/image) to see if there is increased support, and if so you can follow the build instructions below to build a version of this library that supports the new formats.

## Demo

```js
import decode from "https://deno.land/x/wasm_image_decoder@v0.0.7/mod.js";
let input = await fetch("https://i.imgur.com/LYVUrUf.jpg", {referrer:""}).then(r => r.arrayBuffer()); // empty referrer header because imgur blocks requests from 127.0.0.1
// let input = await Deno.readFile("./image.png");
let result = decode(input); // `decode` accepts an ArrayBuffer or a Uint8Array
console.log(result); // {width, height, data} where data is a Uint8Array array of RGBA values like [R,G,B,A,R,G,B,A,R,G,B,A,...]
```

## Build
```
git clone https://github.com/josephrocca/wasm-image-decoder
cd wasm-image-decoder
cargo install wasm-pack
wasm-pack build --target=web --out-dir=wasm
```
Basic `wasm-pack` tutorial here: https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm

If it fails with "unable to build with the standard library", you'll need to run
```
rustup component add rust-src
```
