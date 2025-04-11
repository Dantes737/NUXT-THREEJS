<script setup>
import * as THREE from "three";

import {
  World,
  Vec3,
  Body,
  Box,
  Sphere,
  Plane,
  Material,
  ContactMaterial,
} from "cannon-es";

import Stats from "stats.js";

const container = ref(null);
const canvasRef = ref(null);
const debrisBodies = [];
const keysPressed = {};
// joystick refs
const joystickZone = ref(null);
const joystick = ref(null);

// movement direction (to be used in animate loop)
let joystickDir = { x: 0, y: 0 };
let isTouching = false;
let jumpSound = null;
let bounceSound = null;
let isGrounded = false;

function press(code) {
  keysPressed[code] = true;
}

function release(code) {
  keysPressed[code] = false;
}

onMounted(() => {
  const stats = new Stats();
  stats.showPanel(0); // 0 = FPS, 1 = ms, 2 = memory

  container.value.appendChild(stats.dom);

  jumpSound = new Audio("/sounds/jumpSound.mp3");
  jumpSound.volume = 0.5;

  bounceSound = new Audio("/sounds/bounceSound.mp3");
  bounceSound.volume = 0.4;

  const unlockAudio = () => {
    jumpSound.play().catch(() => {});
    bounceSound.play().catch(() => {});
    jumpSound.pause();
    bounceSound.pause();
    jumpSound.currentTime = 0;
    bounceSound.currentTime = 0;

    window.removeEventListener("touchstart", unlockAudio);
    window.removeEventListener("click", unlockAudio);
  };

  window.addEventListener("touchstart", unlockAudio, { once: true });
  window.addEventListener("click", unlockAudio, { once: true });

  // Joystick setup
  const zone = joystickZone.value;
  const stick = joystick.value;

  const center = { x: 60, y: 60 }; // center of the zone

  const handleMove = ({ touches }) => {
    const touch = touches[0];
    const rect = zone.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const dx = touchX - center.x;
    const dy = touchY - center.y;
    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
    const angle = Math.atan2(dy, dx);

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    stick.style.left = `${center.x + offsetX - 30}px`;
    stick.style.top = `${center.y + offsetY - 30}px`;

    // normalize direction
    joystickDir.x = offsetX / 40;
    joystickDir.y = -offsetY / 40;
  };

  const resetStick = () => {
    joystickDir = { x: 0, y: 0 };
    stick.style.left = "30px";
    stick.style.top = "30px";
  };

  zone.addEventListener("touchstart", (e) => {
    isTouching = true;
    handleMove(e);
  });

  zone.addEventListener("touchmove", (e) => {
    if (isTouching) {
      handleMove(e);
    }
  });

  zone.addEventListener("touchend", () => {
    isTouching = false;
    resetStick();
  });

  // Mouse events for desktop
  zone.addEventListener("mousedown", (e) => {
    isTouching = true;
    handleMove({ touches: [e] });
  });
  zone.addEventListener("mousemove", (e) => {
    if (isTouching) handleMove({ touches: [e] });
  });
  zone.addEventListener("mouseup", () => {
    isTouching = false;
    resetStick();
  });
  zone.addEventListener("mouseleave", () => {
    isTouching = false;
    resetStick();
  });

  //

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Set position above and slightly behind the ball
  camera.position.set(0, 16, 27);
  // Look straight down (at the center of the scene)
  camera.lookAt(0, 0, 0);

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
  directionalLight.position.set(15, 25, 10);
  directionalLight.castShadow = true;

  // Set up shadow properties for the light
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.mapSize.set(2048, 2048);

  scene.add(directionalLight);

  // Cannon.js setup
  const world = new World({
    gravity: new Vec3(0, -9.82, 0),
  });

  // create materials for the ball and ground
  const bounceMaterial = new Material("bouncy"); // For ball and ground
  const nonBounceMaterial = new Material("nonBouncy");

  // Create physics material with restitution
  // Ball ↔ Ground → bouncy
  const bounceContact = new ContactMaterial(bounceMaterial, bounceMaterial, {
    friction: 0.01,
    restitution: 0.8, // bouncy!
  });

  // Ball ↔ Boxes → no bounce
  const noBounceContact = new ContactMaterial(
    bounceMaterial,
    nonBounceMaterial,
    {
      friction: 0.4,
      restitution: 0, // no bounce at all
    }
  );

  // Add contact material to world
  world.addContactMaterial(noBounceContact);
  world.addContactMaterial(bounceContact);

  // Sphere physics
  const sphereRadius = 1;
  const sphereBody = new Body({
    mass: 6,
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
    new THREE.MeshStandardMaterial({
      color: 0x0077ff,
      metalness: 0.8,
      roughness: 0.4,
    })
  );
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);

  // Ground mesh (Three.js) - Correctly colored and receives shadows
  const groundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x4caf50 }) // green color
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  world.addEventListener("beginContact", (event) => {
    const { bodyA, bodyB } = event;

    const ids = [bodyA, bodyB];
    const ballInvolved = ids.includes(sphereBody);
    const smashableBox = ids.find((b) => b.userData?.type === "smashable");

    if (ballInvolved && smashableBox) {
      destroyBox(smashableBox);
    }

    // BOUNCE logic
    if (ballInvolved) {
      const otherBody = bodyA === sphereBody ? bodyB : bodyA;

      // Consider grounded if downward velocity is strong enough on contact
      const impactVelocity = Math.abs(sphereBody.velocity.y);
      if (otherBody.mass === 0 && impactVelocity > 0.1) {
        isGrounded = true;
      }

      // bounce sound logic
      const relativeVelocity = sphereBody.velocity.vsub(
        otherBody.velocity || new Vec3(0, 0, 0)
      );
      const impactSpeed = relativeVelocity.length();

      if (impactSpeed > 1.5) {
        bounceSound.currentTime = 0;
        bounceSound.play();
      }

      // destroy boxes
      const smashableBox = [bodyA, bodyB].find(
        (b) => b.userData?.type === "smashable"
      );
      if (smashableBox) destroyBox(smashableBox);
    }
  });

  world.addEventListener("endContact", (event) => {
    const { bodyA, bodyB } = event;

    const ids = [bodyA, bodyB];
    if (ids.includes(sphereBody)) {
      isGrounded = false;
    }
  });

  // Animation loop
  const clock = new THREE.Clock();

  const handleKeyDown = (event) => {
    keysPressed[event.code] = true;

    if (keysPressed["Space"]) {
      if (isGrounded) {
        sphereBody.velocity.y = 7;
        jumpSound.currentTime = 0;
        jumpSound.play();
        isGrounded = false;
      }
      keysPressed["Space"] = false;
    }
  };

  const handleKeyUp = (event) => {
    keysPressed[event.code] = false;
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Create walls
  const wallHeight = 5;
  const groundSize = 40;
  const wallThickness = 0.5;
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

  const createWall = (x, y, z, rotY = 0) => {
    // Three.js Mesh
    const wallMesh = new THREE.Mesh(
      new THREE.BoxGeometry(groundSize, wallHeight, wallThickness),
      wallMaterial
    );
    wallMesh.position.set(x, y, z);
    wallMesh.rotation.y = rotY;
    wallMesh.receiveShadow = true;
    wallMesh.castShadow = true;
    scene.add(wallMesh);

    // Cannon.js Body
    const wallBody = new Body({
      mass: 0,
      shape: new Box(
        new Vec3(groundSize / 2, wallHeight / 2, wallThickness / 2)
      ),
      position: new Vec3(x, y, z),
      material: nonBounceMaterial,
    });
    wallBody.quaternion.setFromEuler(0, rotY, 0);
    world.addBody(wallBody);
  };

  // Borders positions
  const halfSize = groundSize / 2;

  // Front wall
  createWall(0, wallHeight / 2, -halfSize, 0);
  // Back wall
  createWall(0, wallHeight / 2, halfSize, 0);
  // Left wall
  createWall(-halfSize, wallHeight / 2, 0, Math.PI / 2);
  // Right wall
  createWall(halfSize, wallHeight / 2, 0, Math.PI / 2);

  // Random Boxes Setup
  const boxCount = 15; // Number of random boxes
  const boxSize = 2;
  const boxHeight = 2;
  const halfGroundSize = groundSize / 2;

  for (let i = 0; i < boxCount; i++) {
    const randomX = THREE.MathUtils.randFloatSpread(halfGroundSize * 1.5);
    const randomZ = THREE.MathUtils.randFloatSpread(halfGroundSize * 1.5);
    const posY = boxHeight / 2;

    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(boxSize, boxHeight, boxSize),
      new THREE.MeshStandardMaterial({ color: 0xff9800 }) // 🔴 make all boxes red
    );
    boxMesh.position.set(randomX, posY, randomZ);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    scene.add(boxMesh);

    const boxBody = new Body({
      mass: 0,
      shape: new Box(new Vec3(boxSize / 2, boxHeight / 2, boxSize / 2)),
      position: new Vec3(randomX, posY, randomZ),
      material: nonBounceMaterial,
    });

    // 🔥 Mark it as smashable
    boxBody.userData = { type: "smashable" };

    world.addBody(boxBody);
  }

  function destroyBox(boxBody) {
    const debrisCount = 8;
    const size = 0.4;
    const origin = boxBody.position.clone();

    // Remove original box
    world.removeBody(boxBody);

    const mesh = scene.children.find(
      (obj) => obj.isMesh && obj.position.distanceTo(boxBody.position) < 1.1
    );
    if (mesh) scene.remove(mesh);

    // Create small debris cubes
    for (let i = 0; i < debrisCount; i++) {
      const offset = new Vec3(
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      );

      // Mesh
      const debrisMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
      );
      debrisMesh.castShadow = true;
      scene.add(debrisMesh);

      // Physics body
      const debrisBody = new Body({
        mass: 0.5,
        position: origin.vadd(offset),
        shape: new Box(new Vec3(size / 2, size / 2, size / 2)),
        material: nonBounceMaterial,
      });

      // Give random impulse
      debrisBody.velocity.set(
        (Math.random() - 0.5) * 5,
        Math.random() * 5,
        (Math.random() - 0.5) * 5
      );

      world.addBody(debrisBody);

      // Sync debris in animation loop
      debrisBodies.push({ mesh: debrisMesh, body: debrisBody });
    }
  }

  // Animation loop
  const animate = () => {
    stats.begin();

    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    world.step(1 / 60, delta);

    const moveForce = 20;
    if (keysPressed["ArrowUp"]) {
      sphereBody.applyForce(new Vec3(0, 0, -moveForce), sphereBody.position);
    }
    if (keysPressed["ArrowDown"]) {
      sphereBody.applyForce(new Vec3(0, 0, moveForce), sphereBody.position);
    }
    if (keysPressed["ArrowLeft"]) {
      sphereBody.applyForce(new Vec3(-moveForce, 0, 0), sphereBody.position);
    }
    if (keysPressed["ArrowRight"]) {
      sphereBody.applyForce(new Vec3(moveForce, 0, 0), sphereBody.position);
    }

    if (keysPressed["Space"]) {
      if (isGrounded) {
        sphereBody.velocity.y = 7;
        jumpSound.currentTime = 0;
        jumpSound.play();
        isGrounded = false; // avoid double jump in same frame
      }
      keysPressed["Space"] = false; // trigger only once per tap
    }

    // Joystick-based movement
    const threshold = 0.05; // ignore tiny joystick inputs (helps jitter)

    if (
      Math.abs(joystickDir.x) > threshold ||
      Math.abs(joystickDir.y) > threshold
    ) {
      const force = new Vec3(
        joystickDir.x * moveForce,
        0,
        -joystickDir.y * moveForce // invert Y axis so "up" = forward
      );
      sphereBody.applyForce(force, sphereBody.position);
    }
    // ===

    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    // Sync debris
    debrisBodies.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    });

    renderer.render(scene, camera);

    stats.end();
  };

  animate();

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);

    zone.removeEventListener("touchstart", handleMove);
    zone.removeEventListener("touchmove", handleMove);
    zone.removeEventListener("touchend", resetStick);
  });
});
</script>

<template>
  <div ref="container" class="w-full">
    <canvas ref="canvasRef" class="block"></canvas>

    <!-- Virtual Joystick + Jump -->
    <div class="absolute flex z-10 bottom-7 gap-5 items-center left-7">
      <div class="joystick-zone" ref="joystickZone">
        <div class="joystick" ref="joystick"></div>
      </div>
      <button
        class="jump-button"
        @mousedown="press('Space')"
        @mouseup="release('Space')"
        @touchstart.prevent="press('Space')"
        @touchend.prevent="release('Space')"
      >
        Jump
      </button>
    </div>
  </div>
</template>
<style scoped>
.joystick-zone {
  width: 120px;
  height: 120px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  position: relative;
  touch-action: none;
}

.joystick {
  position: absolute;
  width: 60px;
  height: 60px;
  background: #333;
  border-radius: 50%;
  left: 30px;
  top: 30px;
  transition: 0.1s;
  touch-action: none;
}

.jump-button {
  width: 80px;
  height: 80px;
  font-size: 28px;
  border-radius: 50%;
  background: #0077ff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  touch-action: none;
}
.jump-button:active {
  background: #0057cc;
}
</style>
