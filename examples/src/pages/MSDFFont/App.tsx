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
        <GUIView
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <Text
            style={{
              width: 100,
              fontSize: 32,
              letterSpacing: 2,
              lineHeight: 64,
              paddingLeft: 12,
              paddingRight: 12,
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
          <View
            style={{
              backgroundColor: "yellow",
              flexDirection: "row",
              alignItems: "flex-start",
              flexShrink: 1,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                letterSpacing: 10,
                lineHeight: 64,
                paddingLeft: 12,
                paddingRight: 12,
                fontFamily: "pixel",
                color: "#fff",
                backgroundColor: "red",
              }}
            >
              {"hello world"}
            </Text>
          </View>
        </GUIView>
      </RenderGroup>
    </>
  );
}
