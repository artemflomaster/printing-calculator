import "./App.css";
import React from "react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as THREE from 'three';
import { useFilePicker } from 'use-file-picker';
import { Vector3 } from "three";

export default function App() {

  const [modelPath, setPath] = React.useState({
    loaded: false,
    path: "/test.stl"
  }
  );

  const [modelData, setModelData] = React.useState({
    x: '',
    y: '',
    z: '',
    volume: ''
  })


  //new model loading
  function loadStl(scene, loadPath, camera, target) {
    return new Promise((resolve, reject) => {
      const material = new THREE.MeshNormalMaterial();
      const position = new Vector3(0, 0, 0);
      const loader = new STLLoader();
      loader.load(loadPath,
        function (geometry) {
          geometry.computeBoundingSphere();
          //const sphere = geometry.boundingSphere
          geometry.computeBoundingBox();
          const boxer = geometry.boundingBox;
          geometry.center();
          //
          //geometry.lookAt(target)
          //const theBox = new THREE.Mesh(boxer, material)
          // scene.add(theBox);
          //console.log(boxer, "minX :", boxer.min.x, "maxX :", boxer.max.x, "center: ", geometry.center());
          //geometry.position.set(0,0,0);
          // geometry.position.x = 0;
          // geometry.position.y = 0;
          // geometry.position.z = 0;
          const mesh = new THREE.Mesh(geometry, material);

          //mesh.DEFAULT_MATRIX_WORLD_AUTO_UPDATE(true) ;
          //mesh.computeBoundingBox(true);
          //mesh.boundingBox(true)
          scene.add(mesh);

          // scene.add(sphere);
          //console.log(calculateCenterOfMass(mesh));
          // mesh.matrixAutoUpdate = true;
          //mesh.matrixWorldNeedsUpdate = true;
          //  geometry.position.x = 0;
          // geometry.position.y = 0;
          //  geometry.position.z = 0;
          // geometry.translate(target);
            //update camera
            const wid = mesh.geometry.boundingBox.max.x - mesh.geometry.boundingBox.min.x;
            const glub = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
            const hei = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;
            const zoom = 2;
            if (hei > wid) {
              camera.top = zoom * (hei / 2);
              camera.bottom = zoom * (hei / -2);
              camera.right = zoom * (hei / 2);
              camera.left = zoom * (hei / -2);
            } else {
              camera.right = zoom * (wid / 2);
              camera.left = zoom * (wid / -2);
              camera.top = zoom * (wid / 2);
              camera.bottom = zoom * (wid / -2);

            }
           
            //   setModelData({
            //   ...modelData,
            //   x: wid,
            //   z: hei,
            //   y: glub
            // })
            
            camera.updateProjectionMatrix();
            console.log(mesh.geometry.boundingBox);
          resolve(mesh, boxer);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.log(error);
          reject(error);
        }

      )
    })
  }



  //new Model object
  const Dinosaur = () => {
    const refContainer = React.useRef();
    const [loading, setLoading] = React.useState(true);
    const [renderer, setRenderer] = React.useState();

    React.useEffect(() => {
      const { current: container } = refContainer;
      if (container && !renderer) {
        const scW = container.clientWidth;
        const scH = container.clientHeight;
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(scW, scH);
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);
        setRenderer(renderer);

        const scene = new THREE.Scene();
        const scale = 1;
        // const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
        const camera = new THREE.OrthographicCamera(150 / - 2, 150 / 2, 150 / 2, 150 / - 2, -300, 1000);
        camera.position.z = 100;
        camera.position.y = 100;
        camera.up.set(0, 0, 1);
        const target = new THREE.Vector3(0, 0, 0);
        camera.lookAt(target);
        scene.add(new THREE.AxesHelper())
        //const light = new THREE.SpotLight()
        //  light.position.set(1, 1, 1)
        //  scene.add(light)
        // const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        //scene.add(ambientLight);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.autoRotate = true;
        controls.enableDamping = true;
        controls.target = target;


        loadStl(scene, modelPath.path, camera, target)
          .then((mesh) => {


            animate();

            setLoading(false);

          });

        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };

        return () => {
          renderer.dispose();
        };
      }
    }, [modelPath]);

    return (
      <div className="model" ref={refContainer}>
        {loading && (
          <span style={{ position: "absolute", left: "50%", top: "50%" }}>
            Loading...
          </span>
        )}
      </div>
    );
  };



  //scene
  // const scene = new THREE.Scene()
  // scene.add(new THREE.AxesHelper(5))

  // // const light = new THREE.SpotLight()
  // // light.position.set(20, 20, 20)
  // // scene.add(light)

  // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // camera.position.z = 1
  // const renderer = new THREE.WebGLRenderer()
  // renderer.outputEncoding = THREE.sRGBEncoding
  // renderer.setSize(window.innerWidth, window.innerHeight)
  // document.body.appendChild(renderer.domElement)
  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableDamping = true


  function pathSetter() {
    const input = document.querySelector('input');
    const file = input.files[0];
    const neqPath = URL.createObjectURL(file);
    setPath({
      loaded: true,
      path: neqPath
    })


  }

  return (
    <div className="App">
      <div>
        <p>Модель можно вращать при помощи мыши.</p>
        <Dinosaur />

        <div>

          <div className="ui-wrapper">
            <label for="image_uploads">Выберете STL-файл</label>
            <input
              onChange={() => pathSetter()}
              type="file"
              accept=".stl, .STL"
            />
            <div className="ui-size">
              <div>Размер по X: {modelData.x}</div>
              <div>Размер по Y: {modelData.y}</div>
              <div>Размер по Z: {modelData.z}</div>
            </div>
            <div className="ui-volume"><div>Объём, см3: {modelData.volume}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
