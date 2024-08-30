<script setup>
import * as THREE from "three";

const container = ref(null);
const fov = 75;
const near = 0.1;
const far = 10;

const scene = new THREE.Scene();
const hemiLight = new THREE.HemisphereLight("#FFFFFF", "#000000");

const geo = new THREE.IcosahedronGeometry(1.0, 2);

const mat = new THREE.MeshStandardMaterial({
  color: "#50C878",
  flatShading: true,
});

const wireMat = new THREE.MeshBasicMaterial({
  color: "#003922",
  wireframe: true,
});

const mesh = new THREE.Mesh(geo, mat);
const wireMesh = new THREE.Mesh(geo, wireMat);

onMounted(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  container.value.appendChild(renderer.domElement);

  scene.add(mesh);
  scene.add(wireMesh);

  scene.add(hemiLight);

  function animate(t = 0) {
    requestAnimationFrame(animate);

    mesh.rotation.y = t * 0.0001;
    wireMesh.rotation.y = t * 0.0001;

    renderer.render(scene, camera);
  }

  animate();
});
</script>

<template><div ref="container"></div></template>
