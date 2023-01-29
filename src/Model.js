import React from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

export default function Model(){
   
   
   
   
   
   
    const stl = useLoader(STLLoader, link);
    const ref = React.useRef();
    const { camera } = useThree();
    // React.useEffect(() => {
    //   camera.lookAt(ref.current.position);
    // });

   

    return (
      <>
        <mesh>
        {/* <mesh geometry={stl}>
          <meshStandardMaterial color="#cccccc" /> */}
          <primitive object={stl} scale={1} attach="geometry" />
          <meshStandardMaterial color={"orange"} />
        </mesh>
      </>
    );
  };