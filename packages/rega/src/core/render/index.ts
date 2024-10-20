import {  vec4, cameraProjectionMatrix, attribute, modelViewMatrix, positionGeometry } from 'three/src/nodes/TSL.js';
import WGSLNodeBuilder from 'three/src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import NodeMaterial from 'three/src/materials/nodes/NodeMaterial.js';
import { BufferGeometry } from 'three/src/core/BufferGeometry.js';

import { sdbm as hash } from 'jsr:@dumbjs/quick-hash';

// 不重要
const geometry = new BufferGeometry();

function setupMaterial(cb: (material: NodeMaterial) => void ) {
    const material = new NodeMaterial();
    
    cb(material);
    
    const builder = new WGSLNodeBuilder({ geometry, material }, {
        getRenderTarget: () => null,
        nodes: {
            library: {
                fromMaterial: (m: any) => m,
            }
        },
        getMRT: () => null,
    });

    builder.build();
    
    console.log(builder.vertexShader);
    console.log(builder.fragmentShader);
    
    console.log('attributes', builder.attributes);
    console.log('getBindings', builder.getBindings());
}


interface MeshElement {
    vertexShader: string;
    fragmentShader: string;
}

setupMaterial((material) => {
    material.positionNode = cameraProjectionMatrix.mul( modelViewMatrix ).mul( positionGeometry )
});