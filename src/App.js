import "./App.css";
import React from "react";
import { Suspense } from 'react'
import { OrbitControls, OrthographicCamera, Html, useProgress } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { nanoid } from "nanoid";
import materialsHardCoded from "./materialsHardCoded";
import TheModel from "./TheModel";
import Materials from "./Materials";

export default function App() {
  const [materials, setMaterials] = React.useState(
    {
      loaded: false,
      materialsList: null
    }
  )

  const [modelData, setModelData] = React.useState({
    loaded: false,
    path: process.env.PUBLIC_URL + "/test.stl",
    x: '',
    y: '',
    z: '',
    volume: '',
    material: 'не выбран',
    price: 0,
    scale: 1
  }
  );


  React.useEffect(() => {
    setMaterials(() => {
      return (
        {
          loaded: true,
          materialsList: materialsHardCoded
        }
      )
    });
    // console.log(materialsHardCoded);
    // console.log(materials);
  }, [materials.loaded])

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
      const choosedMaterial = e.target.value;

      console.log(choosedMaterial);
      materials.materialsList.forEach(mat => {
        if (mat.name === choosedMaterial) {
          setModelData({
            ...modelData,
            loaded: false,
            price: mat.price,
            material: choosedMaterial
          });
        }
      })

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

        <div className="ui-size">Размеры: {(Math.round((modelData.x * modelData.scale) * 100) / 100)} мм х {Math.round((modelData.y * modelData.scale) * 100) / 100} мм х {Math.round((modelData.z * modelData.scale) * 100) / 100} мм</div>

        <div className="ui-volume">Объём: {Math.round((modelData.volume * Math.pow(modelData.scale, 3)) / 10) / 100} см<span className="uppercase">3</span></div>

        <div className="ui-calc">
          {materials.loaded ? <Materials key={nanoid()} materials={materials.materialsList} currMaterial={modelData.material} handler={(e) => formHandler(e)} /> : "Материалы не загружены"}
          <div>{modelData.price ? "Стоимость печати: " + Math.round(modelData.price * modelData.volume * Math.pow(modelData.scale, 3) / 1000) + " рублей" : ""}</div>
        </div>
      </div>
    </div>
  )
}