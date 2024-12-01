import React, { useEffect, useState } from "react";
import {
  RenderTarget,
  RenderGroup,
  GUICamera,
  GUIView,
  View,
  Text,
  FontManager,
  SpriteMSDF,
  Camera,
  Box2D,
  Relative,
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
        type: "msdf",
        url: "/fonts/noto-sans/NotoSans-Regular.json",
      }),
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <>
      {/* <RenderTarget camera={<GUICamera />} id="GUI" /> */}
      <RenderTarget
        id="MAIN"
        camera={
          <Relative translation={{ z: 100 }}>
            <Camera
              type="orthographic"
              width={128}
              height={128}
              anchor="top-left"
            />
          </Relative>
        }
      />
      {/* <RenderGroup target="GUI">
        <GUIView
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              letterSpacing: 2,
              fontFamily: "arial",
              color: "#fff",
              backgroundColor: "red",
            }}
          >
            {"Helllo world"}
          </Text>
          <View
            style={{
              width: 64,
              height: 64,
              marginLeft: 12,
              marginRight: 12,
              backgroundColor: "blue",
            }}
          ></View>
          <Text
            style={{
              fontSize: 16,
              letterSpacing: 2,
              fontFamily: "pixel",
              color: "#fff",
              backgroundColor: "red",
            }}
          >
            {"hello world"}
          </Text>
          <SpriteMSDF
            atlasTextureId="/fonts/noto-sans/font.png"
            clip={[0, 0, 64, 64]}
            size={[40, 40]}
          />
          <Text
            style={{
              fontSize: 24,
              letterSpacing: 2,
              fontFamily: "noto-sans",
              color: "green",
            }}
          >
            WebGPU
          </Text>
        </GUIView>
      </RenderGroup> */}

      <RenderGroup target="MAIN">
        {/* <Box2D anchor="top-left" size={[120, 120]} color="red" /> */}
        <View style={{ width: 128, height: 128 }}>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 2,
              fontFamily: "noto-sans",
              color: "green",
            }}
          >
            WebGPU
          </Text>
        </View>
      </RenderGroup>
    </>
  );
}
