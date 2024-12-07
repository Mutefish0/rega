import React, { useEffect, useState } from "react";
import { RenderTarget, RenderGroup, View, Camera, Relative } from "rega";

export default function App() {
  return (
    <>
      <RenderTarget
        id="main"
        camera={
          <Relative translation={{ z: 1000 }}>
            <Camera
              type="orthographic"
              width={128}
              height={128}
              anchor="top-left"
            />
          </Relative>
        }
      />
      <RenderGroup target="main">
        <View
          style={{
            width: 128,
            height: 128,
            backgroundColor: "rgba(200,100,100, 0.2)",
            flexDirection: "row",
            gap: 12,
          }}
        >
          <View
            key="a"
            style={{ width: 10, height: 20, backgroundColor: "forestgreen" }}
          ></View>

          <View
            key="c"
            style={{ width: 10, height: 20, backgroundColor: "springgreen" }}
          ></View>

          <div>
            <View
              style={{ width: 10, height: 30, backgroundColor: "silver" }}
            ></View>
            <View
              style={{ width: 10, height: 10, backgroundColor: "skyblue" }}
            ></View>
          </div>

          <View
            key="b"
            style={{ width: 10, height: 30, backgroundColor: "indianred" }}
          ></View>
        </View>
      </RenderGroup>
    </>
  );
}
