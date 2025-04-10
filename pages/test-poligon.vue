<script setup>
import * as THREE from "three";

import {
  World,
  Vec3,
  Body,
  Sphere,
  Plane,
  Material,
  ContactMaterial,
} from "cannon-es";

const canvasRef = ref(null);

onMounted(() => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 7);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", handleResize);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  scene.add(directionalLight);

  // Cannon.js setup
  const world = new World({
    gravity: new Vec3(0, -9.82, 0),
  });

  // Create physics material with restitution (bounciness)
  const bounceMaterial = new Material("bounceMaterial");
  const bounceContact = new ContactMaterial(bounceMaterial, bounceMaterial, {
    friction: 0.01, // low friction to allow smooth bouncing
    restitution: 0.8, // restitution controls the bounce (0.0–1.0)
  });

  // Add contact material to world
  world.addContactMaterial(bounceContact);

  // Sphere physics
  const sphereRadius = 1;
  const sphereBody = new Body({
    mass: 5,
    shape: new Sphere(sphereRadius),
    position: new Vec3(0, 5, 0),
    material: bounceMaterial, // apply bouncing material here
  });
  world.addBody(sphereBody);

  // Ground physics
  const groundBody = new Body({
    mass: 0,
    shape: new Plane(),
    material: bounceMaterial, // ground shares bounce material
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Sphere mesh (Three.js)
  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(sphereRadius, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x0077ff })
  );
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);

  // Ground mesh (Three.js) - Correctly colored and receives shadows
  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x4caf50 }) // green color
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Animation loop
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    world.step(1 / 60, delta);

    // Sync Cannon.js and Three.js positions
    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    renderer.render(scene, camera);
  };

  animate();

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
  });
});
</script>

<template>
  <canvas ref="canvasRef" class="block w-full h-screen"></canvas>
</template>
