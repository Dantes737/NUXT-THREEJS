<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { JoltPhysics } from "three/addons/physics/JoltPhysics.js";

const container = ref(null);
let camera, scene, renderer;
let physics, position;
let spheres;

async function init() {
  physics = await JoltPhysics();
  position = new THREE.Vector3();

  //

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-1, 1.5, 2);
  camera.lookAt(0, 0.5, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x666666);

  const hemiLight = new THREE.HemisphereLight();
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(5, 5, 5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.zoom = 2;
  scene.add(dirLight);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(10, 5, 10),
    new THREE.ShadowMaterial({ color: 0x444444 })
  );
  floor.position.y = -2.5;
  floor.receiveShadow = true;
  floor.userData.physics = { mass: 0 };
  scene.add(floor);

  //

  const material = new THREE.MeshLambertMaterial();

  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();

  // Boxes

  const geometryBox = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const boxes_one = new THREE.Mesh(
    geometryBox,
    new THREE.MeshLambertMaterial({ color: "#3a8c5c" })
  );
  boxes_one.castShadow = true;
  boxes_one.receiveShadow = true;
  boxes_one.userData.physics = { mass: 1 };
  scene.add(boxes_one);

  const boxes_second = new THREE.Mesh(
    geometryBox,
    new THREE.MeshLambertMaterial({ color: "#cc8b3b" })
  );
  boxes_second.castShadow = true;
  boxes_second.receiveShadow = true;
  boxes_second.userData.physics = { mass: 1 };
  boxes_second.position.set(3, 5, -1);
  scene.add(boxes_second);

  const boxes_third = new THREE.Mesh(geometryBox, material);
  boxes_third.castShadow = true;
  boxes_third.receiveShadow = true;
  boxes_third.userData.physics = { mass: 1 };
  boxes_third.position.set(0, 5, -3);
  scene.add(boxes_third);

  // Spheres

  const geometrySphere = new THREE.IcosahedronGeometry(0.05, 4);
  spheres = new THREE.InstancedMesh(geometrySphere, material, 400);
  spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
  spheres.castShadow = true;
  spheres.receiveShadow = true;
  spheres.userData.physics = { mass: 1 };
  scene.add(spheres);

  for (let i = 0; i < spheres.count; i++) {
    matrix.setPosition(
      Math.random() - 0.5,
      Math.random() * 2,
      Math.random() - 0.5
    );
    spheres.setMatrixAt(i, matrix);
    spheres.setColorAt(i, color.setHex(0xffffff * Math.random()));
  }

  physics.addScene(scene);

  //

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  renderer.shadowMap.enabled = true;
  container.value.appendChild(renderer.domElement);

  //

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.y = 0.5;
  controls.update();

  setInterval(() => {
    let index = Math.floor(Math.random() * spheres.count);

    position.set(0, Math.random() + 1, 0);
    physics.setMeshPosition(spheres, position, index);
  }, 200);
}

function animate() {
  renderer.render(scene, camera);
}

onMounted(async () => {
  await init();
  animate();
});
</script>
<template><div ref="container" /></template>
