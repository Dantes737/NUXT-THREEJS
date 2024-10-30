<script setup>
import * as THREE from "three";

import { MapControls } from "three/addons/controls/MapControls.js";

let camera, controls, scene, renderer;
const container = ref(null);

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.value.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 200, -400);

  // = = = = controls = = = = =
  controls = new MapControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 100;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;

  // world
  const groundGeo = new THREE.PlaneGeometry(1700, 1700);
  const groundMat = new THREE.MeshPhongMaterial({
    color: "gray",
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  scene.add(ground);

  const geometry = new THREE.BoxGeometry();
  geometry.translate(0, 0.5, 0);
  const material = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    flatShading: true,
  });

  for (let i = 0; i < 400; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.scale.x = 20;
    mesh.scale.y = Math.random() * 80 + 10;
    mesh.scale.z = 20;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }

  // lights

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 8);
  dirLight1.position.set(2, 8, 4);
  dirLight1.castShadow = true;
  scene.add(dirLight1);

  const ambientLight = new THREE.AmbientLight(0x555555);
  scene.add(ambientLight);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(t = 0) {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
  controls.update();
}

onMounted(async () => {
  init();
  animate();
});
</script>
<template><div ref="container" /></template>
