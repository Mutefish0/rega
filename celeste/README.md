# Celeste Classic

A port of the PICO-8 game Celeste Classic built with Rega.

Play in your browser:
https://dev.ethevan.xyz/celeste/

Or play with deno:

```
deno run --unstable-ffi --unstable-webgpu https://dev.ethevan.xyz/celeste/index.deno.js
```

#### Original game credits:

Maddy Thorson - design and audio

[maddymakesgames.com](https://www.maddymakesgames.com/)

Noel Berry - code and art

[noelfb.com](https://noelfb.com/)

Play the original game:
[lexaloffle.com/bbs/?tid=2145](https://www.lexaloffle.com/bbs/?tid=2145)

## Development

```
git clone --recurse-submodules git@github.com:Mutefish0/rega.git
cd celeste
```

```
pnpm i
pnpm run dev
```

Open your browser and visit http://localhost:5173/

## Build

### Web

```
pnpm run build
```

### Deno

build:

```
pnpm run build:deno
```

run:

```
./dist/celeste
```

## TODO

- [x] save/load state
- [x] fix workers
      https://github.com/GoogleChromeLabs/wasm-bindgen-rayon/blob/a0593ddfcf13bcb1b244fb590e4d31ad83615f2b/src/workerHelpers.no-bundler.js#L63
- [x] fly-fruit
- [x] clouds
- [x] snow
- [x] camera shaking
- [ ] break spring
- [x] spawn animation
- [x] fake wall
- [x] title screen
- [ ] flag & score & fruit record
- [ ] orb
- [ ] save and load system
- [ ] alphaMap + textureColor
