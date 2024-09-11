<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = ref(null);
const fov = 75;
const near = 0.1;
const far = 10;

const scene = new THREE.Scene();
const hemiLight = new THREE.HemisphereLight("#FFFFFF", "#000000");

const geo = new THREE.IcosahedronGeometry(1, 2);

const mat = new THREE.MeshStandardMaterial({
  color: "#50C878",
  flatShading: true,
});

const mesh = new THREE.Mesh(geo, mat);

onMounted(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;

  container.value.appendChild(renderer.domElement);

  scene.add(mesh);

  scene.add(hemiLight);

  // function animate(t = 0) {
  //   requestAnimationFrame(animate);

  //   renderer.render(scene, camera);
  //   controls.update();
  // }

  // animate();
});
</script>

<template><div ref="container" /></template>
