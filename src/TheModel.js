import React from "react";
import { useLoader } from '@react-three/fiber';
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from 'three';

function TheModel(props) {
    const stl = useLoader(STLLoader, props.path);
    stl.center();
    stl.computeBoundingBox();

    const wid = stl.boundingBox.max.x - stl.boundingBox.min.x;
    const glub = stl.boundingBox.max.y - stl.boundingBox.min.y;
    const hei = stl.boundingBox.max.z - stl.boundingBox.min.z;


    //volume calculation
    let volume = 0;
    let p1 = new THREE.Vector3();
    let p2 = new THREE.Vector3();
    let p3 = new THREE.Vector3();

    let position = stl.attributes.position;
    let faces = stl.attributes.position.count / 3;
    for (let i = 0; i < faces; i++) {
      p1.fromBufferAttribute(position, i * 3 + 0);
      p2.fromBufferAttribute(position, i * 3 + 1);
      p3.fromBufferAttribute(position, i * 3 + 2);
      volume += signedVolumeOfTriangle(p1, p2, p3);

    }

    function signedVolumeOfTriangle(p1, p2, p3) {
      return p1.dot(p2.cross(p3)) / 6.0;
    }


    // console.log("stl: ", stl, "vol: ", volume)

    props.updater(wid, hei, glub, volume);
    return (
      <mesh>
        <primitive object={stl} />
        <meshNormalMaterial />
      </mesh>
    )

  }


  export default TheModel;