import "./App.css";
import React from "react";
import { Suspense } from 'react'
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, OrthographicCamera, Html, useProgress } from "@react-three/drei";
import * as THREE from 'three';
import Select from "react-select";

export default function App() {

  const [modelData, setModelData] = React.useState({
    loaded: false,
    path: process.env.PUBLIC_URL + "/test.stl",
    x: '',
    y: '',
    z: '',
    volume: '',
    price: 160,
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
      const material = e.target.value;

      //set price shortcut
      function setPrice(price) {
        setModelData({
          ...modelData,
          loaded: false,
          price: price
        });
      }

      switch (material) {
        case "ABS":
          setPrice(160);
          break;

        case "9085":
          setPrice(380);
          break;

        case "PS":
          setPrice(150);
          break;

        case "PA12":
          setPrice(180);
          break;

        case "FC":
          setPrice(300);
          break;

        default:
          console.log('Material was not selected')
          break;
      }

    }
    if (e.target.id === "scale") {
      const scale = e.target.value;

      //set scale shortcut
      function setScale(scale) {
        setModelData({
          ...modelData,
          loaded: false,
          scale: scale
        });
      }

      switch (scale) {
        case "mm":
          setScale(1);
          break;
        case "cm":
          setScale(10);
          break;
        case "inch":
          setScale(24.5);
          break;
        default:
          console.log('Material was not selected')
          break;
      }
    }
  }


  const options = [
    { value: 'ABS', label: 'АБС' },
    { value: '9085', label: 'Ultem 9085' },
    { value: 'PA12', label: 'Полиамид 12' },
    { value: 'PS', label: 'Полистирол' },
    { value: 'FC', label: 'Фотополимер' }
  ]



  return (


    <div className="App">
      <div className="canvas-wrapper">

        <Canvas resize={{ scroll: false }}>
          <Suspense fallback={<Loader />}>
            <TheModel path={modelData.path} updater={(x, y, z, v) => smartUpdater(x, y, z, v)} />
          </Suspense>
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

        </Canvas>
      </div>
      <div className="ui-wrapper">
        <button
          name="pick-button"
          id="pick-button"
          onClick={() => document.getElementById("true-picker").click()}
        >Выберите STL-файл
        </button>

        <div className="true-picker">Имя файла:
          <input
            id="true-picker"
            onChange={() => pathSetter()}
            type="file"
            accept=".stl, .STL"
          />
        </div>

        <div className="scale">
          <label htmlFor="scale">Единицы измерения файла:</label>
          <select id="scale" name="scale" defaultValue="mm" onChange={(e) => { formHandler(e) }}>
            <option value="mm">мм</option>
            <option value="cm">см</option>
            <option value="inch">дюйм</option>
          </select>
        </div>

        <div className="ui-size">Размеры: {(Math.round((modelData.x * scale) * 100) / 100)} мм х {Math.round((modelData.y * scale) * 100) / 100} мм х {Math.round((modelData.z * scale) * 100) / 100} мм</div>

        <div className="ui-volume">Объём: {Math.round((modelData.volume * Math.pow(scale, 3)) / 10) / 100} см<span className="uppercase">3</span></div>

        <div className="ui-calc">
          <label htmlFor="materials">Выберите материал:</label>
          <select id="materials" name="materials" defaultValue="ABS" onChange={(e) => { formHandler(e) }}>
            {/* <option disabled selected hidden>Нужно выбрать</option> */}
            <option value="ABS">АБС</option>
            <option value="9085">Ultem 9085</option>
            <option value="PA12">Полиамид 12</option>
            <option value="PS">Полистирол</option>
            <option value="FC">Фотополимер</option>
          </select>
          {/* <Select options={options} id="materials" onChange={(e) => { formHandler(e) }} /> */}
          <div>{modelData.price ? "Стоимость печати: " + Math.round(modelData.price * modelData.volume * Math.pow(scale, 3) / 1000) + " рублей" : ""}</div>
        </div>
      </div>
    </div>
  )
}