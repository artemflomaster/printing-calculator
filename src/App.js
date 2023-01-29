import "./App.css";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useFilePicker } from 'use-file-picker';



export default function App() {
  const [modelData, setModel] = React.useState({
    loaded: false,
    data: 'null'
  })
  const [openFileSelector, { filesContent, loading }] = useFilePicker({
    accept: '.stl',
    readAs: 'BinaryString'
  });

 
    setTimeout(()=>{
      setModel({
        loaded: true,
        data: filesContent[0].content
      })
    }, 7000)

    
 

  console.log('model data: ', modelData, filesContent);


  if (loading) {
    return <div>Loading...</div>;
  }

  function Model() {
    // const stl = useLoader(STLLoader, modelData.data);
    if (modelData.loaded){const stl =  modelData.data;
    return (
      <>
        <mesh>
          <primitive object={stl} scale={1} attach="geometry" />
          <meshStandardMaterial color={"orange"} />
        </mesh>
      </>
    );
  }
  };


  return (
    <div className="App">

      <div className="canvas-wrapper">
        <Canvas camera={{ position: [0, 0.5, 0.5] }}>
          <Suspense fallback={null}>
            <Model />
            <OrbitControls />
            <Environment preset="sunset" background />
          </Suspense>
        </Canvas>
      </div>
      <div className="form">

        <div>
          <button onClick={
            () => openFileSelector()}>Select files </button>
          <br />
          {filesContent.map((file, index) => (
            <div>
              <h2>{file.name}</h2>
              <div key={index}>{file.content}</div>
              <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
