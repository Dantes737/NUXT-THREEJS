import { Mesh, BoxGeometry, MeshStandardMaterial } from "three";

import { Vec3, Body, Box } from "cannon-es";

const createPlatform = (options = {}) => {
  const { x = 0, y = 0, z = 0, contact, dataType = "" } = options;

  const PLATFORM_WIDTH = 6;
  const PLATFORM_HEIGH = 0.8;
  const PLATFORM_DEPTH = 6;

  const platformMesh = new Mesh(
    new BoxGeometry(PLATFORM_WIDTH, PLATFORM_HEIGH, PLATFORM_DEPTH),
    new MeshStandardMaterial({ color: "#86d6d8" }) // brown tone
  );
  platformMesh.position.set(x, y, z); // Adjust position as you like
  platformMesh.castShadow = true;
  platformMesh.receiveShadow = true;

  const platformBody = new Body({
    mass: 0, // static platform
    shape: new Box(
      new Vec3(PLATFORM_WIDTH / 2, PLATFORM_HEIGH / 2, PLATFORM_DEPTH / 2)
    ),
    position: new Vec3(x, y, z), // same as mesh
    material: contact, // solid, not bouncy
  });

  if (dataType) {
    platformBody.userData = { type: dataType };
  }

  return { platformMesh, platformBody };
};

export default createPlatform;
