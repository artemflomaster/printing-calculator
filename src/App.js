import "./App.css";
import React from "react";
import { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, OrthographicCamera, Html, useProgress } from "@react-three/drei";
import * as THREE from 'three';


export default function App() {

  const [modelData, setModelData] = React.useState({
    loaded: false,
    path: "/test.stl",
    x: '',
    y: '',
    z: '',
    volume: '',
    price: undefined,
    scale: 1
  }
  );

  const scale = modelData.scale;


  function TheModel(props) {
    const stl = useLoader(STLLoader, modelData.path);
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

  function smartUpdater(wid, hei, glub, volume) {
    if (!modelData.loaded) {
      setModelData({
        ...modelData,
        loaded: true,
        x: wid,
        y: glub,
        z: hei,
        volume: volume
      })
    }
  }

  function pathSetter() {
    const input = document.querySelector('input');
    const file = input.files[0];
    const neqPath = URL.createObjectURL(file);
    setModelData({
      ...modelData,
      loaded: false,
      path: neqPath
    })
  }

  function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
  }

  //camera update
  const zoom = 1.2;
  let top = 200;
  let bottom = -200;
  let right = -200;
  let left = 200;

  if (modelData.loaded) {

    if (modelData.x > modelData.y) {
      top = zoom * (modelData.x / 2);
      bottom = zoom * (modelData.x / -2);
      right = zoom * (modelData.x / 2);
      left = zoom * (modelData.x / -2);
    } else {
      top = zoom * (modelData.y / 2);
      bottom = zoom * (modelData.y / -2);
      right = zoom * (modelData.y / 2);
      left = zoom * (modelData.y / -2);

    }
  }

  function formHandler(e) {

    if (e.target.id === "materials") {
      console.log("Materials triggered!")
      const material = e.target.value;
      switch (material) {
        case "ABS":
          setModelData({
            ...modelData,
            loaded: false,
            price: 160
          });
          break;

        case "9085":
          setModelData({
            ...modelData,
            loaded: false,
            price: 380
          });
          break;

        case "PS":
          setModelData({
            ...modelData,
            loaded: false,
            price: 150
          });
          break;

        case "PA12":
          setModelData({
            ...modelData,
            loaded: false,
            price: 180
          });
          break;

        case "FC":
          setModelData({
            ...modelData,
            loaded: false,
            price: 300
          });
          break;

        default:
          console.log('Material was not selected')
          break;
      }

    }
    if (e.target.id === "scale") {
      console.log("Scale triggered!");
      const scale = e.target.value;
      switch (scale) {
        case "mm":
          setModelData({
            ...modelData,
            loaded: false,
            scale: 1
          });
          break;

        case "cm":
          setModelData({
            ...modelData,
            loaded: false,
            scale: 10
          });
          break;
        case "inch":
          setModelData({
            ...modelData,
            loaded: false,
            scale: 25.4
          });
          break;
        default:
          console.log('Material was not selected')
          break;
      }
    }


  }

  return (
    <div className="App">
      <div className="canvas-wrapper">
        <Canvas >
          <Suspense fallback={<Loader />}>
            <TheModel path={modelData.path} updater={(x, y, z, v) => smartUpdater(x, y, z, v)} />
            <OrbitControls />
            <OrthographicCamera
              makeDefault
              // zoom={0.9}
              top={top}
              bottom={bottom}
              left={left}
              right={right}
              near={-100}
              far={2000}
              position={[0, -100, 50]}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="ui-wrapper">
        <div className="picker">
          <button
            name="pick-button"
            id="pick-button"
            onClick={() => document.getElementById("true-picker").click()}
          >Выберите STL-файл
          </button>
          <input
            className="true-picker"
            id="true-picker"
            onChange={() => pathSetter()}
            type="file"
            accept=".stl, .STL"
          />
          <label for="scale">Выберите единицы измерения файла:</label>
          <select id="scale" name="scale" defaultValue="Нужно выбрать" onChange={(e) => { formHandler(e) }}>
            <option value="mm" selected>мм</option>
            <option value="cm">см</option>
            <option value="inch">дюйм</option>
          </select>
        </div>

        <div className="ui-size">
          <div>Размеры: {(Math.round((modelData.x*scale) * 100) / 100)} мм х {Math.round((modelData.y*scale) * 100) / 100} мм х {Math.round((modelData.z*scale) * 100) / 100} мм</div>
        </div>
        <div className="ui-volume"><div>Объём: {Math.round((modelData.volume*Math.pow(scale, 3)) / 10) / 100} см<span className="uppercase">3</span></div></div>

        <div className="ui-calc">
          <label for="materials">Выберите материал:</label>
          <select id="materials" name="materials" defaultValue="Нужно выбрать" onChange={(e) => { formHandler(e) }}>
            <option disabled selected hidden>Нужно выбрать</option>
            <option value="ABS">АБС</option>
            <option value="9085">Ultem 9085</option>
            <option value="PA12">Полиамид 12</option>
            <option value="PS">Полистирол</option>
            <option value="FC">Фотополимер</option>
          </select>
          <div>{modelData.price ? "Стоимость печати: " + Math.round(modelData.price * modelData.volume * Math.pow(scale, 3) / 1000) + " рублей" : ""}</div>
        </div>
      </div>
    </div>
  )
}