import { AmbientLight, DirectionalLight } from "three";

const ambientLight = new AmbientLight(0xffffff, 0.5);

const directionalLight = new DirectionalLight(0xffffff, 1.5);
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

export { directionalLight, ambientLight };
