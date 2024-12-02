import React, { useEffect, useState } from "react";
import {
  RenderTarget,
  RenderGroup,
  GUICamera,
  GUIView,
  Text,
  Br,
  FontManager,
} from "rega";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      FontManager.add("arial", {
        type: "typeface",
        url: "/fonts/ArialBlack-Regular.json",
      }),
      FontManager.add("pixel", {
        type: "bitmap",
        url: "/fonts/pixel.bmp",
        charSize: [3, 5],
        stepSize: [8, 8],
      }),
      FontManager.add("noto-sans", {
        type: "msdf-bmfont",
        url: "/fonts/noto-sans/noto-sans-cjk-jp-msdf.json",
      }),
      FontManager.add("noto-sans-sc", {
        type: "msdf",
        configUrl: "/fonts/noto-sans/config.json",
        atlasUrl: "/fonts/noto-sans/texture.png",
      }),
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <>
      <RenderTarget camera={<GUICamera />} id="GUI" />
      <RenderGroup target="GUI">
        <GUIView
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: 12,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "arial",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            WebGPU Afg
          </Text>
          <Text
            style={{
              fontSize: 24,
              letterSpacing: 2,
              fontFamily: "pixel",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            {"hello world"}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "noto-sans",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            WebGPU Afg 日本語 キリン公園 ひらがな
          </Text>

          <Text
            style={{
              fontSize: 24,
              fontFamily: "noto-sans-sc",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            WebGPU Afg 你好世界
            <Br />
            哈哈
          </Text>
        </GUIView>
      </RenderGroup>
    </>
  );
}
