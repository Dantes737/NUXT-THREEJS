<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = ref(null);
const fov = 75;
const near = 0.5;
const far = 1000;

const delta = 0.0006;
let moonAngleRadians = 0;

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();

const sunLight = new THREE.SpotLight("#FFFFFF", 7, 10, Math.PI / 4.5);
sunLight.castShadow = true;
sunLight.position.set(-5, 0.5, 1.5);

// const lightHelper = new THREE.SpotLightHelper(sunLight);

const geo = new THREE.IcosahedronGeometry(1, 12);
const moonGeo = new THREE.IcosahedronGeometry(0.25, 12);

const mat = new THREE.MeshStandardMaterial({
  map: loader.load("/img/planets/base.jpg"),
});

const moonMat = new THREE.MeshStandardMaterial({
  map: loader.load("/img/planets/moon.jpg"),
});

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("/img/planets/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("/img/planets/05_earthcloudmaptrans.jpg"),
  // alphaTest: 0.3,
});

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;

const EARTH_MESH = new THREE.Mesh(geo, mat);
EARTH_MESH.castShadow = true;
EARTH_MESH.receiveShadow = true;

const moonMesh = new THREE.Mesh(moonGeo, moonMat);
moonMesh.receiveShadow = true;
moonMesh.castShadow = true;
moonMesh.position.set(2.5, 0.2, 0);

const cloudsMesh = new THREE.Mesh(geo, cloudsMat);
cloudsMesh.scale.setScalar(1.003);

onMounted(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;

  container.value.appendChild(renderer.domElement);

  scene.add(getStarField({ numStars: 2000 }));

  scene.add(earthGroup);

  earthGroup.add(EARTH_MESH);
  earthGroup.add(cloudsMesh);

  scene.add(moonMesh);

  scene.add(sunLight);
  // scene.add(lightHelper);

  function animate() {
    requestAnimationFrame(animate);

    EARTH_MESH.rotation.y += 0.001;
    cloudsMesh.rotation.y += 0.002;

    moonAngleRadians += delta;
    moonAngleRadians %= 2 * Math.PI;

    moonMesh.position.x = 2.5 * Math.cos(moonAngleRadians);
    moonMesh.position.z = 2.5 * Math.sin(moonAngleRadians);

    renderer.render(scene, camera);
    controls.update();
  }

  animate();
});
</script>

<template>
  <!-- <ClientOnly> -->
  <div ref="container" class="overflow-x-scroll no-scrollbar" />
  <!-- </ClientOnly> -->
</template>
