import React from "react";
import { Canvas } from "rega/web";
import {
  RenderPipeline,
  RenderGroup,
  Camera,
  Relative,
  Box3D,
  DirectionalLight,
  Box2D,
  RenderPass,
} from "rega";

export default function Page() {
  return <Canvas width={512} height={512} App={App} />;
}

// function App() {
//   return (
//     <>
//       <RenderTarget
//         id="main"
//         bindingsLayout={{
//           ...DirectionalLight.bindingsLayout,
//         }}
//         camera={
//           <Relative translation={{ z: 10 }}>
//             <Camera type="perspective" />
//           </Relative>
//         }
//         light={<DirectionalLight intensity={0.8} direction={[1, -1, 1]} />}
//       />
//       <RenderGroup target="main">
//         <Relative rotation={{ x: Math.PI / 3, y: Math.PI / 3, z: 0 }}>
//           <Box3D size={[2, 2, 2]} color="green" />
//         </Relative>
//       </RenderGroup>
//     </>
//   );
// }

const pass: RenderPass = {
  id: "base",
  dependencies: [],
  pipelines: [() => ({})],
};

const renderGroups = new Map();
renderGroups.set(pass, ["main"]);

function App() {
  return (
    <RenderPipeline renderPass={[pass]} renderGroups={renderGroups}>
      <RenderGroup id="main">
        <Box2D size={[1, 1]} color="red" />
      </RenderGroup>
    </RenderPipeline>
  );
}
