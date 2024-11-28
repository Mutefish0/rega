import React, { useEffect, useState } from "react";
import {
  RenderTarget,
  RenderGroup,
  GUICamera,
  GUIView,
  View,
  Text,
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
    ]).then(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <>
      <RenderTarget camera={<GUICamera />} id="GUI" />
      <RenderGroup target="GUI">
        <GUIView style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text
            style={{
              fontSize: 32,
              lineHeight: 32,
              fontFamily: "arial",
              color: "#fff",
              backgroundColor: "red",
            }}
          >
            hello world
          </Text>
          <View
            style={{
              width: 64,
              height: 32,
              marginLeft: 12,
              marginRight: 12,
              backgroundColor: "blue",
            }}
          ></View>
          <Text
            style={{
              fontSize: 32,
              lineHeight: 32,
              fontFamily: "pixel",
              color: "#fff",
              backgroundColor: "red",
            }}
          >
            hello world
          </Text>
        </GUIView>
      </RenderGroup>
    </>
  );
}
