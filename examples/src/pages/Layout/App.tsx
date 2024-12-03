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
        {/* <View style={{ width: 128, height: 128 }}>
          <View
            style={{ backgroundColor: "red", width: 20, height: 20 }}
          ></View>
          <View
            style={{ backgroundColor: "blue", width: 20, height: 20 }}
          ></View>
        </View>
        <View></View> */}
        <yoga></yoga>
        <yoga>
          <Relative>
            <yoga></yoga>
          </Relative>
        </yoga>
      </RenderGroup>
    </>
  );
}
