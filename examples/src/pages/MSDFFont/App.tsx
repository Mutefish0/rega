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
              fontSize: 14,
              lineHeight: 20,
              letterSpacing: 2,
              fontFamily: "pixel",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            The WebGPU API enables web developers to utilize the GPU (Graphics
            Processing Unit) of the underlying system for high-performance
            computations and to render complex graphics in the browser.
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "arial",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            The WebGPU API enables web developers to utilize the GPU (Graphics
            Processing Unit) of the underlying system for high-performance
            computations and to render complex graphics in the browser.
          </Text>

          <Text
            style={{
              fontSize: 24,
              lineHeight: 32,
              fontFamily: "noto-sans",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            WebGPU 日本語 キリン公園 ひらがな
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "noto-sans-sc",
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          >
            WebGPU API 使 web 开发人员能够使用底层系统的
            GPU（图形处理器）进行高性能计算并绘制可在浏览器中渲染的复杂图形。
            WebGPU 是 WebGL 的继任者，为现代 GPU 提供更好的兼容、支持更通用的
            GPU 计算、更快的操作以及能够访问到更高级的 GPU 特性。
            <Br />
            WebGPU API は、Web 開発者が基盤となるシステムの
            GPU（グラフィックスプロセッサ）を活用して、高性能な計算を実行し、ブラウザでレンダリング可能な複雑なグラフィックスを描画できるようにします。
          </Text>
        </GUIView>
      </RenderGroup>
    </>
  );
}
